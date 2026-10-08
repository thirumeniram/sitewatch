import prisma from "../../pgConfig";
import { User } from "../../generated/prisma/client";
import { handleErrorsAxios, logErrorLocation } from "../../library/utils";
import { IWebsiteReply } from "../../db_schema/Website/WebsiteInterface";
import { WEBSITE_REPLY_FIELDS } from "../../db_schema/Website/WebsiteConstants";
import {
  IIncidentEmailRow,
  IIncidentReply,
  IIncidentSummaryRow,
} from "../../db_schema/Incident/IncidentInterface";
import { ICheckCounts, ICheckReply } from "../../db_schema/Check/CheckInterface";
import { CHECK_REPLY_FIELDS, CHECK_STATUS } from "../../db_schema/Check/CheckConstants";
import {
  IHourlyRollupRow,
  IPublicIncidentRow,
  IPublicWebsiteRow,
} from "../../db_schema/Status/StatusInterface";
import {
  HOURLY_ROLLUP_FIELDS,
  PUBLIC_INCIDENT_FIELDS,
  PUBLIC_WEBSITE_FIELDS,
} from "../../db_schema/Status/StatusConstants";
import {
  INCIDENT_EMAIL_FIELDS,
  INCIDENT_REPLY_FIELDS,
  INCIDENT_STATUS,
  INCIDENT_SUMMARY_FIELDS,
} from "../../db_schema/Incident/IncidentConstants";

export async function fetchUserCount(): Promise<number> {
  try {
    return await prisma.user.count();
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchUserCount",
      error,
      "Error while counting users",
      "",
      {},
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchUserById(userId: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchUserById",
      error,
      "Error while fetching user",
      userId,
      { userId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchWebsitesByUser(userId: string): Promise<IWebsiteReply[]> {
  try {
    return await prisma.website.findMany({
      where: { user_id: userId, is_archived: false },
      select: WEBSITE_REPLY_FIELDS,
      orderBy: { created_at: "asc" },
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchWebsitesByUser",
      error,
      "Error while fetching websites",
      userId,
      { userId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchWebsiteById(
  userId: string,
  websiteId: string,
): Promise<IWebsiteReply | null> {
  try {
    return await prisma.website.findFirst({
      where: { id: websiteId, user_id: userId, is_archived: false },
      select: WEBSITE_REPLY_FIELDS,
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchWebsiteById",
      error,
      "Error while fetching website",
      userId,
      { userId, websiteId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchWebsiteByUrl(
  userId: string,
  url: string,
): Promise<IWebsiteReply | null> {
  try {
    return await prisma.website.findFirst({
      where: { url, user_id: userId, is_archived: false },
      select: WEBSITE_REPLY_FIELDS,
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchWebsiteByUrl",
      error,
      "Error while fetching website by url",
      userId,
      { userId, url },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchIncidentsByWebsite(
  websiteId: string,
  limit: number,
): Promise<IIncidentReply[]> {
  try {
    return await prisma.incident.findMany({
      where: { website_id: websiteId },
      select: INCIDENT_REPLY_FIELDS,
      orderBy: { started_at: "desc" },
      take: limit,
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchIncidentsByWebsite",
      error,
      "Error while fetching incidents",
      websiteId,
      { websiteId, limit },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchIncidentsWaitingForEmail(
  since: Date,
  limit: number,
): Promise<IIncidentEmailRow[]> {
  try {
    return await prisma.incident.findMany({
      where: {
        website: { is_archived: false },
        OR: [
          { opened_email_sent_at: null, started_at: { gte: since } },
          {
            status: INCIDENT_STATUS.CLOSED,
            closed_email_sent_at: null,
            ended_at: { gte: since },
          },
        ],
      },
      select: INCIDENT_EMAIL_FIELDS,
      orderBy: { started_at: "asc" },
      take: limit,
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchIncidentsWaitingForEmail",
      error,
      "Error while fetching incidents waiting for email",
      "",
      { since, limit },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchRecentChecks(websiteId: string, limit: number): Promise<ICheckReply[]> {
  try {
    return await prisma.check.findMany({
      where: { website_id: websiteId },
      select: CHECK_REPLY_FIELDS,
      orderBy: { checked_at: "desc" },
      take: limit,
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchRecentChecks",
      error,
      "Error while fetching recent checks",
      websiteId,
      { websiteId, limit },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchCheckCounts(websiteId: string, since: Date): Promise<ICheckCounts> {
  try {
    const [total, failed] = await Promise.all([
      prisma.check.count({ where: { website_id: websiteId, checked_at: { gte: since } } }),
      prisma.check.count({
        where: { website_id: websiteId, checked_at: { gte: since }, status: CHECK_STATUS.DOWN },
      }),
    ]);
    return { total, failed };
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchCheckCounts",
      error,
      "Error while counting checks",
      websiteId,
      { websiteId, since },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchUserIdBySlug(slug: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { status_page_slug: slug },
      select: { id: true },
    });
    return user?.id ?? null;
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchUserIdBySlug",
      error,
      "Error while fetching user by status page slug",
      "",
      { slug },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchPublicWebsites(userId: string): Promise<IPublicWebsiteRow[]> {
  try {
    return await prisma.website.findMany({
      where: { user_id: userId, is_public: true, is_archived: false },
      select: PUBLIC_WEBSITE_FIELDS,
      orderBy: { created_at: "asc" },
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchPublicWebsites",
      error,
      "Error while fetching public websites",
      userId,
      { userId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchHourlyRollups(
  websiteIds: string[],
  since: Date,
): Promise<IHourlyRollupRow[]> {
  try {
    return await prisma.checkHourly.findMany({
      where: { website_id: { in: websiteIds }, hour_start: { gte: since } },
      select: HOURLY_ROLLUP_FIELDS,
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchHourlyRollups",
      error,
      "Error while fetching hourly roll-ups",
      "",
      { websiteCount: websiteIds?.length, since },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchPublicIncidents(
  websiteIds: string[],
  since: Date,
  limit: number,
): Promise<IPublicIncidentRow[]> {
  try {
    return await prisma.incident.findMany({
      where: { website_id: { in: websiteIds }, started_at: { gte: since } },
      select: PUBLIC_INCIDENT_FIELDS,
      orderBy: { started_at: "desc" },
      take: limit,
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchPublicIncidents",
      error,
      "Error while fetching public incidents",
      "",
      { websiteCount: websiteIds?.length, since, limit },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchIncidentsWaitingForSummary(
  since: Date,
  limit: number,
): Promise<IIncidentSummaryRow[]> {
  try {
    return await prisma.incident.findMany({
      where: {
        status: INCIDENT_STATUS.CLOSED,
        summary: null,
        summary_requested_at: null,
        ended_at: { gte: since },
        website: { is_archived: false },
      },
      select: INCIDENT_SUMMARY_FIELDS,
      orderBy: { ended_at: "asc" },
      take: limit,
    });
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchIncidentsWaitingForSummary",
      error,
      "Error while fetching incidents waiting for a summary",
      "",
      { since, limit },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function fetchFailedCheckMessages(
  websiteId: string,
  from: Date,
  to: Date,
): Promise<string[]> {
  try {
    const checks = await prisma.check.findMany({
      where: {
        website_id: websiteId,
        status: CHECK_STATUS.DOWN,
        checked_at: { gte: from, lte: to },
      },
      select: { error_message: true },
    });
    return checks.map((check) => check?.error_message ?? "");
  } catch (error) {
    logErrorLocation(
      "fetchCalls.ts",
      "fetchFailedCheckMessages",
      error,
      "Error while fetching failed check messages",
      websiteId,
      { websiteId, from, to },
    );
    return handleErrorsAxios(error, {});
  }
}
