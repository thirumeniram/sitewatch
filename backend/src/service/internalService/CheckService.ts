import { handleErrorsAxios, logErrorLocation } from "../../library/utils";
import { pingWebsite } from "../../Interpreter/http/pingWebsite";
import { sendPendingIncidentEmails, writePendingSummaries } from "./IncidentService";
import { claimDueWebsites } from "../../Interpreter/PostgreSQL/updateCalls";
import { rollUpChecksIntoHourly, saveCheckResults } from "../../Interpreter/PostgreSQL/insertCalls";
import {
  deleteChecksOlderThan,
  deleteHourlyRowsOlderThan,
} from "../../Interpreter/PostgreSQL/deleteCalls";
import {
  ICheckResult,
  ICheckRunSummary,
  IDueWebsite,
  IRollupSummary,
} from "../../shared/interfaces";
import { CHECK_RUN_FAILED } from "../../shared/errorMessages";
import {
  CHECK_BATCH_SIZE,
  CHECK_STATUS,
  HOURLY_CHECK_RETENTION_DAYS,
  RAW_CHECK_RETENTION_DAYS,
  ROLLUP_LOOKBACK_HOURS,
} from "../../db_schema/Check/CheckConstants";

async function checkOneWebsite(website: IDueWebsite): Promise<ICheckResult> {
  try {
    const pingResult = await pingWebsite(website.url);
    return { website_id: website.id, ...pingResult };
  } catch (error) {
    logErrorLocation(
      "CheckService.ts",
      "checkOneWebsite",
      error,
      "Error occurred while checking a website",
      website?.id,
      { websiteId: website?.id },
    );
    return {
      website_id: website.id,
      status: CHECK_STATUS.DOWN,
      status_code: null,
      response_time_ms: null,
      error_message: CHECK_RUN_FAILED,
    };
  }
}

export async function runDueChecks(): Promise<ICheckRunSummary> {
  try {
    const dueWebsites = await claimDueWebsites();
    const results: ICheckResult[] = [];
    for (let start = 0; start < dueWebsites.length; start += CHECK_BATCH_SIZE) {
      const batch = dueWebsites.slice(start, start + CHECK_BATCH_SIZE);
      results.push(...(await Promise.all(batch.map((website) => checkOneWebsite(website)))));
    }
    if (results.length > 0) {
      await saveCheckResults(results);
    }
    const emailsSent = await sendPendingIncidentEmails();
    const summariesWritten = await writePendingSummaries();
    const upCount = results.filter((result) => result.status === CHECK_STATUS.UP).length;
    return {
      checked: results.length,
      up: upCount,
      down: results.length - upCount,
      emails_sent: emailsSent,
      summaries_written: summariesWritten,
    };
  } catch (error) {
    logErrorLocation(
      "CheckService.ts",
      "runDueChecks",
      error,
      "Error occurred while running due checks",
      "",
      {},
    );
    return handleErrorsAxios(error, {});
  }
}

export async function rollUpAndCleanChecks(): Promise<IRollupSummary> {
  try {
    const hourlyRowsSaved = await rollUpChecksIntoHourly(ROLLUP_LOOKBACK_HOURS);
    const rawChecksDeleted = await deleteChecksOlderThan(RAW_CHECK_RETENTION_DAYS);
    const hourlyRowsDeleted = await deleteHourlyRowsOlderThan(HOURLY_CHECK_RETENTION_DAYS);
    return {
      hourly_rows_saved: hourlyRowsSaved,
      raw_checks_deleted: rawChecksDeleted,
      hourly_rows_deleted: hourlyRowsDeleted,
    };
  } catch (error) {
    logErrorLocation(
      "CheckService.ts",
      "rollUpAndCleanChecks",
      error,
      "Error occurred while rolling up and cleaning checks",
      "",
      {},
    );
    return handleErrorsAxios(error, {});
  }
}
