import StatusCodes from "http-status-codes";
import prisma from "../../pgConfig";
import { Prisma, User } from "../../generated/prisma/client";
import {
  createStatusPageSlug,
  createThrowError,
  handleErrorsAxios,
  logErrorLocation,
} from "../../library/utils";
import { IWebsiteBody, IWebsiteReply } from "../../db_schema/Website/WebsiteInterface";
import { ICheckResult } from "../../shared/interfaces";
import { CHECK_STATUS } from "../../db_schema/Check/CheckConstants";
import {
  FAILED_CHECKS_TO_OPEN_INCIDENT,
  INCIDENT_STATUS,
} from "../../db_schema/Incident/IncidentConstants";
import {
  MAX_WEBSITES_PER_USER,
  WEBSITE_STATUS,
  WEBSITE_REPLY_FIELDS,
} from "../../db_schema/Website/WebsiteConstants";
import { ALL_TABLE_NAMES } from "../../db_schema/shared/sharedConstants";
import { CONFLICT_NAME, FORBIDDEN_NAME } from "../../shared/constants";
import { WEBSITE_ALREADY_ADDED, WEBSITE_LIMIT_REACHED } from "../../shared/errorMessages";

const { CONFLICT, FORBIDDEN } = StatusCodes;

export async function saveUserIfMissing(userId: string, email: string): Promise<User> {
  try {
    return await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        status_page_slug: createStatusPageSlug(email),
      },
      update: {},
    });
  } catch (error) {
    logErrorLocation(
      "insertCalls.ts",
      "saveUserIfMissing",
      error,
      "Error while saving user",
      userId,
      { userId, email },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function insertWebsiteWithinLimit(
  userId: string,
  websiteValues: IWebsiteBody,
): Promise<IWebsiteReply> {
  try {
    return await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw(
        Prisma.sql`SELECT id FROM ${Prisma.raw(`"${ALL_TABLE_NAMES.User}"`)} WHERE id = ${userId}::uuid FOR UPDATE`,
      );
      const activeWebsites = await transaction.website.findMany({
        where: { user_id: userId, is_archived: false },
        select: { url: true },
      });
      if (activeWebsites.length >= MAX_WEBSITES_PER_USER) {
        createThrowError(FORBIDDEN, FORBIDDEN_NAME, WEBSITE_LIMIT_REACHED, {});
      }
      if (activeWebsites.some((website) => website.url === websiteValues.url)) {
        createThrowError(CONFLICT, CONFLICT_NAME, WEBSITE_ALREADY_ADDED, {});
      }
      return transaction.website.create({
        data: {
          user_id: userId,
          name: websiteValues.name,
          url: websiteValues.url,
          check_interval_minutes: websiteValues.check_interval_minutes,
          is_public: websiteValues.is_public,
        },
        select: WEBSITE_REPLY_FIELDS,
      });
    });
  } catch (error) {
    logErrorLocation(
      "insertCalls.ts",
      "insertWebsiteWithinLimit",
      error,
      "Error while adding website",
      userId,
      { userId, url: websiteValues?.url },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function saveCheckResults(results: ICheckResult[]): Promise<void> {
  try {
    const upWebsiteIds = results
      .filter((result) => result.status === CHECK_STATUS.UP)
      .map((result) => result.website_id);
    const downResults = results.filter((result) => result.status === CHECK_STATUS.DOWN);
    const downWebsiteIds = downResults.map((result) => result.website_id);
    await prisma.$transaction(async (transaction) => {
      await transaction.check.createMany({ data: results });
      await transaction.website.updateMany({
        where: { id: { in: upWebsiteIds } },
        data: { current_status: WEBSITE_STATUS.UP, consecutive_failures: 0 },
      });
      await transaction.website.updateMany({
        where: { id: { in: downWebsiteIds } },
        data: { current_status: WEBSITE_STATUS.DOWN, consecutive_failures: { increment: 1 } },
      });
      await transaction.incident.updateMany({
        where: { website_id: { in: upWebsiteIds }, status: INCIDENT_STATUS.OPEN },
        data: { status: INCIDENT_STATUS.CLOSED, ended_at: new Date() },
      });
      const websitesToOpen = await transaction.website.findMany({
        where: {
          id: { in: downWebsiteIds },
          consecutive_failures: { gte: FAILED_CHECKS_TO_OPEN_INCIDENT },
          incidents: { none: { status: INCIDENT_STATUS.OPEN } },
        },
        select: { id: true },
      });
      await transaction.incident.createMany({
        data: websitesToOpen.map((website) => ({
          website_id: website.id,
          failure_reason: downResults.find((result) => result.website_id === website.id)
            ?.error_message,
        })),
        skipDuplicates: true,
      });
    });
  } catch (error) {
    logErrorLocation(
      "insertCalls.ts",
      "saveCheckResults",
      error,
      "Error while saving check results",
      "",
      { resultCount: results?.length },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function rollUpChecksIntoHourly(lookbackHours: number): Promise<number> {
  try {
    const hourlyTable = Prisma.raw(`"${ALL_TABLE_NAMES.CheckHourly}"`);
    const checkTable = Prisma.raw(`"${ALL_TABLE_NAMES.Check}"`);
    return await prisma.$executeRaw(Prisma.sql`
      INSERT INTO ${hourlyTable}
        (website_id, hour_start, total_checks, failed_checks, average_response_time_ms)
      SELECT
        website_id,
        date_trunc('hour', checked_at),
        count(*)::int,
        (count(*) FILTER (WHERE status = ${CHECK_STATUS.DOWN}::"CheckStatus"))::int,
        round(avg(response_time_ms))::int
      FROM ${checkTable}
      WHERE checked_at >= date_trunc('hour', now()) - make_interval(hours => ${lookbackHours})
        AND checked_at < date_trunc('hour', now())
      GROUP BY website_id, date_trunc('hour', checked_at)
      ON CONFLICT (website_id, hour_start) DO UPDATE SET
        total_checks = EXCLUDED.total_checks,
        failed_checks = EXCLUDED.failed_checks,
        average_response_time_ms = EXCLUDED.average_response_time_ms`);
  } catch (error) {
    logErrorLocation(
      "insertCalls.ts",
      "rollUpChecksIntoHourly",
      error,
      "Error while rolling up checks",
      "",
      { lookbackHours },
    );
    return handleErrorsAxios(error, {});
  }
}
