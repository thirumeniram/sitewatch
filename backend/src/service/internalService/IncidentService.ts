import {
  escapeHtml,
  fillEmailTemplate,
  handleErrorsAxios,
  logErrorLocation,
  sendEmail,
} from "../../library/utils";
import {
  fetchFailedCheckMessages,
  fetchIncidentsWaitingForEmail,
  fetchIncidentsWaitingForSummary,
} from "../../Interpreter/PostgreSQL/fetchCalls";
import { requestIncidentSummary } from "../../Interpreter/ai/summarizeIncident";
import { config } from "../../config/config";
import {
  claimIncidentEmail,
  claimIncidentSummary,
  releaseIncidentEmail,
  releaseIncidentSummary,
  saveIncidentSummary,
} from "../../Interpreter/PostgreSQL/updateCalls";
import {
  IAlertEmail,
  IAlertEmailType,
  IIncidentEmailRow,
  IIncidentSummaryRow,
} from "../../db_schema/Incident/IncidentInterface";
import {
  ALERT_EMAIL_TYPE,
  DOWN_EMAIL_BODY,
  DOWN_EMAIL_SUBJECT,
  EMAIL_RETRY_WINDOW_HOURS,
  HOURS_LABEL,
  INCIDENT_STATUS,
  MAX_ALERT_EMAILS_PER_RUN,
  MAX_SUMMARIES_PER_RUN,
  MINUTES_LABEL,
  PERMANENT_AI_ERROR_CODES,
  SUMMARY_CHECK_LOOKBACK_MINUTES,
  SUMMARY_PROMPT,
  SUMMARY_RETRY_WINDOW_HOURS,
  UNKNOWN_FAILURE_REASON,
  UP_EMAIL_BODY,
  UP_EMAIL_SUBJECT,
} from "../../db_schema/Incident/IncidentConstants";
import {
  MINUTES_PER_HOUR,
  ONE_HOUR_IN_MILLISECONDS,
  ONE_MINUTE_IN_MILLISECONDS,
} from "../../shared/constants";
import { IThrownError } from "../../shared/interfaces";

function formatDuration(startedAt: Date, endedAt: Date | null): string {
  const durationMs = (endedAt ?? new Date()).getTime() - startedAt.getTime();
  const totalMinutes = Math.max(1, Math.ceil(durationMs / ONE_MINUTE_IN_MILLISECONDS));
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return hours > 0
    ? `${hours} ${HOURS_LABEL} ${minutes} ${MINUTES_LABEL}`
    : `${minutes} ${MINUTES_LABEL}`;
}

function buildAlertEmail(incident: IIncidentEmailRow, emailType: IAlertEmailType): IAlertEmail {
  const textValues: Record<string, string> = {
    name: incident?.website?.name,
    url: incident?.website?.url,
    reason: incident?.failure_reason ?? UNKNOWN_FAILURE_REASON,
    startedAt: incident?.started_at?.toUTCString(),
    endedAt: incident?.ended_at?.toUTCString() ?? "",
    duration: formatDuration(incident?.started_at, incident?.ended_at),
  };
  const htmlValues = Object.fromEntries(
    Object.entries(textValues).map(([key, value]) => [key, escapeHtml(value)]),
  );
  const isDownEmail = emailType === ALERT_EMAIL_TYPE.DOWN;
  return {
    subject: fillEmailTemplate(isDownEmail ? DOWN_EMAIL_SUBJECT : UP_EMAIL_SUBJECT, textValues),
    html: fillEmailTemplate(isDownEmail ? DOWN_EMAIL_BODY : UP_EMAIL_BODY, htmlValues),
  };
}

async function sendOneAlertEmail(
  incident: IIncidentEmailRow,
  emailType: IAlertEmailType,
): Promise<boolean> {
  try {
    const isClaimed = await claimIncidentEmail(incident?.id, emailType);
    if (!isClaimed) {
      return false;
    }
    try {
      const alertEmail = buildAlertEmail(incident, emailType);
      await sendEmail(incident?.website?.user?.email, alertEmail.subject, alertEmail.html);
      return true;
    } catch (error) {
      await releaseIncidentEmail(incident?.id, emailType);
      throw error;
    }
  } catch (error) {
    logErrorLocation(
      "IncidentService.ts",
      "sendOneAlertEmail",
      error,
      "Error occurred while sending an alert email",
      incident?.id,
      { incidentId: incident?.id, emailType },
    );
    return false;
  }
}

export async function sendPendingIncidentEmails(): Promise<number> {
  try {
    const since = new Date(Date.now() - EMAIL_RETRY_WINDOW_HOURS * ONE_HOUR_IN_MILLISECONDS);
    const incidents = await fetchIncidentsWaitingForEmail(since, MAX_ALERT_EMAILS_PER_RUN);
    let emailsSent = 0;
    for (const incident of incidents) {
      const isDownEmailWaiting = !incident?.opened_email_sent_at && incident?.started_at >= since;
      if (isDownEmailWaiting) {
        const isDownEmailSent = await sendOneAlertEmail(incident, ALERT_EMAIL_TYPE.DOWN);
        if (!isDownEmailSent) {
          continue;
        }
        emailsSent += 1;
      }
      const isUpEmailWaiting =
        incident?.status === INCIDENT_STATUS.CLOSED && !incident?.closed_email_sent_at;
      if (isUpEmailWaiting && (await sendOneAlertEmail(incident, ALERT_EMAIL_TYPE.UP))) {
        emailsSent += 1;
      }
    }
    return emailsSent;
  } catch (error) {
    logErrorLocation(
      "IncidentService.ts",
      "sendPendingIncidentEmails",
      error,
      "Error occurred while sending pending incident emails",
      "",
      {},
    );
    return handleErrorsAxios(error, {});
  }
}

async function buildSummaryPrompt(incident: IIncidentSummaryRow): Promise<string> {
  const endedAt = incident?.ended_at ?? new Date();
  const lookbackStart = new Date(
    incident?.started_at?.getTime() - SUMMARY_CHECK_LOOKBACK_MINUTES * ONE_MINUTE_IN_MILLISECONDS,
  );
  const failedMessages = await fetchFailedCheckMessages(
    incident?.website?.id,
    lookbackStart,
    endedAt,
  );
  const distinctErrors = [...new Set(failedMessages.filter((message) => message))];
  return fillEmailTemplate(SUMMARY_PROMPT, {
    name: incident?.website?.name,
    reason: incident?.failure_reason ?? UNKNOWN_FAILURE_REASON,
    startedAt: incident?.started_at?.toUTCString(),
    endedAt: endedAt.toUTCString(),
    duration: formatDuration(incident?.started_at, endedAt),
    failedChecks: `${failedMessages.length}`,
    errors: distinctErrors.join("; ") || UNKNOWN_FAILURE_REASON,
  });
}

async function writeOneSummary(incident: IIncidentSummaryRow): Promise<boolean> {
  try {
    const isClaimed = await claimIncidentSummary(incident?.id);
    if (!isClaimed) {
      return false;
    }
    try {
      const prompt = await buildSummaryPrompt(incident);
      const summary = await requestIncidentSummary(prompt);
      await saveIncidentSummary(incident?.id, summary);
      return true;
    } catch (error) {
      const isPermanentError = PERMANENT_AI_ERROR_CODES.includes(
        Number((error as IThrownError)?.code),
      );
      if (!isPermanentError) {
        await releaseIncidentSummary(incident?.id);
      }
      throw error;
    }
  } catch (error) {
    logErrorLocation(
      "IncidentService.ts",
      "writeOneSummary",
      error,
      "Error occurred while writing an incident summary",
      incident?.id,
      { incidentId: incident?.id },
    );
    return false;
  }
}

export async function writePendingSummaries(): Promise<number> {
  try {
    if (!config.ai.summaryEnabled) {
      return 0;
    }
    const since = new Date(Date.now() - SUMMARY_RETRY_WINDOW_HOURS * ONE_HOUR_IN_MILLISECONDS);
    const incidents = await fetchIncidentsWaitingForSummary(since, MAX_SUMMARIES_PER_RUN);
    let summariesWritten = 0;
    for (const incident of incidents) {
      if (await writeOneSummary(incident)) {
        summariesWritten += 1;
      }
    }
    return summariesWritten;
  } catch (error) {
    logErrorLocation(
      "IncidentService.ts",
      "writePendingSummaries",
      error,
      "Error occurred while writing pending summaries",
      "",
      {},
    );
    return handleErrorsAxios(error, {});
  }
}
