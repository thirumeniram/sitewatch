import { Prisma } from "../../generated/prisma/client";
import { IDueWebsite } from "../../shared/interfaces";
import { ALL_TABLE_NAMES } from "../../db_schema/shared/sharedConstants";
import {
  CHECK_SCHEDULE_SLACK_SECONDS,
  MAX_SITES_PER_CHECK_RUN,
} from "../../db_schema/Check/CheckConstants";
import prisma from "../../pgConfig";
import { handleErrorsAxios, logErrorLocation } from "../../library/utils";
import { IWebsiteBody } from "../../db_schema/Website/WebsiteInterface";
import { WEBSITE_STATUS } from "../../db_schema/Website/WebsiteConstants";
import { ALERT_EMAIL_TYPE, INCIDENT_STATUS } from "../../db_schema/Incident/IncidentConstants";
import { IAlertEmailType } from "../../db_schema/Incident/IncidentInterface";

export async function updateWebsite(
  userId: string,
  websiteId: string,
  changes: Partial<IWebsiteBody>,
): Promise<boolean> {
  try {
    const result = await prisma.website.updateMany({
      where: { id: websiteId, user_id: userId, is_archived: false },
      data: {
        ...changes,
        ...(changes?.url
          ? { current_status: WEBSITE_STATUS.UNKNOWN, consecutive_failures: 0 }
          : {}),
      },
    });
    return result.count > 0;
  } catch (error) {
    logErrorLocation(
      "updateCalls.ts",
      "updateWebsite",
      error,
      "Error while updating website",
      userId,
      { userId, websiteId, changes },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function archiveWebsite(userId: string, websiteId: string): Promise<boolean> {
  try {
    return await prisma.$transaction(async (transaction) => {
      const result = await transaction.website.updateMany({
        where: { id: websiteId, user_id: userId, is_archived: false },
        data: { is_archived: true },
      });
      if (result.count > 0) {
        await transaction.incident.updateMany({
          where: { website_id: websiteId, status: INCIDENT_STATUS.OPEN },
          data: { status: INCIDENT_STATUS.CLOSED, ended_at: new Date() },
        });
      }
      return result.count > 0;
    });
  } catch (error) {
    logErrorLocation(
      "updateCalls.ts",
      "archiveWebsite",
      error,
      "Error while archiving website",
      userId,
      { userId, websiteId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function claimDueWebsites(): Promise<IDueWebsite[]> {
  try {
    const websiteTable = Prisma.raw(`"${ALL_TABLE_NAMES.Website}"`);
    return await prisma.$queryRaw<IDueWebsite[]>(Prisma.sql`
      UPDATE ${websiteTable} SET last_checked_at = now()
      WHERE id IN (
        SELECT id FROM ${websiteTable}
        WHERE is_archived = false
          AND (
            last_checked_at IS NULL
            OR last_checked_at <= now()
              - make_interval(mins => check_interval_minutes)
              + make_interval(secs => ${CHECK_SCHEDULE_SLACK_SECONDS})
          )
        ORDER BY last_checked_at NULLS FIRST
        LIMIT ${MAX_SITES_PER_CHECK_RUN}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, url`);
  } catch (error) {
    logErrorLocation(
      "updateCalls.ts",
      "claimDueWebsites",
      error,
      "Error while claiming due websites",
      "",
      {},
    );
    return handleErrorsAxios(error, {});
  }
}

export async function claimIncidentEmail(
  incidentId: string,
  emailType: IAlertEmailType,
): Promise<boolean> {
  try {
    const sentAt = new Date();
    const result = await prisma.incident.updateMany({
      where:
        emailType === ALERT_EMAIL_TYPE.DOWN
          ? { id: incidentId, opened_email_sent_at: null }
          : { id: incidentId, closed_email_sent_at: null },
      data:
        emailType === ALERT_EMAIL_TYPE.DOWN
          ? { opened_email_sent_at: sentAt }
          : { closed_email_sent_at: sentAt },
    });
    return result.count > 0;
  } catch (error) {
    logErrorLocation(
      "updateCalls.ts",
      "claimIncidentEmail",
      error,
      "Error while claiming incident email",
      incidentId,
      { incidentId, emailType },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function releaseIncidentEmail(
  incidentId: string,
  emailType: IAlertEmailType,
): Promise<void> {
  try {
    await prisma.incident.updateMany({
      where: { id: incidentId },
      data:
        emailType === ALERT_EMAIL_TYPE.DOWN
          ? { opened_email_sent_at: null }
          : { closed_email_sent_at: null },
    });
  } catch (error) {
    logErrorLocation(
      "updateCalls.ts",
      "releaseIncidentEmail",
      error,
      "Error while releasing incident email",
      incidentId,
      { incidentId, emailType },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function claimIncidentSummary(incidentId: string): Promise<boolean> {
  try {
    const result = await prisma.incident.updateMany({
      where: { id: incidentId, summary_requested_at: null },
      data: { summary_requested_at: new Date() },
    });
    return result.count > 0;
  } catch (error) {
    logErrorLocation(
      "updateCalls.ts",
      "claimIncidentSummary",
      error,
      "Error while claiming incident summary",
      incidentId,
      { incidentId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function releaseIncidentSummary(incidentId: string): Promise<void> {
  try {
    await prisma.incident.updateMany({
      where: { id: incidentId },
      data: { summary_requested_at: null },
    });
  } catch (error) {
    logErrorLocation(
      "updateCalls.ts",
      "releaseIncidentSummary",
      error,
      "Error while releasing incident summary",
      incidentId,
      { incidentId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function saveIncidentSummary(incidentId: string, summary: string): Promise<void> {
  try {
    await prisma.incident.updateMany({
      where: { id: incidentId },
      data: { summary },
    });
  } catch (error) {
    logErrorLocation(
      "updateCalls.ts",
      "saveIncidentSummary",
      error,
      "Error while saving incident summary",
      incidentId,
      { incidentId },
    );
    return handleErrorsAxios(error, {});
  }
}
