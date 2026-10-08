import StatusCodes from "http-status-codes";
import {
  createThrowError,
  handleErrorsAxios,
  logErrorLocation,
  normalizeWebsiteUrl,
} from "../../library/utils";
import {
  fetchCheckCounts,
  fetchIncidentsByWebsite,
  fetchRecentChecks,
  fetchWebsiteById,
  fetchWebsiteByUrl,
  fetchWebsitesByUser,
} from "../../Interpreter/PostgreSQL/fetchCalls";
import { insertWebsiteWithinLimit } from "../../Interpreter/PostgreSQL/insertCalls";
import { archiveWebsite, updateWebsite } from "../../Interpreter/PostgreSQL/updateCalls";
import {
  addWebsiteSchema,
  IWebsiteBody,
  IWebsiteId,
  IWebsiteReply,
  updateWebsiteSchema,
  websiteIdSchema,
} from "../../db_schema/Website/WebsiteInterface";
import { IIncidentReply } from "../../db_schema/Incident/IncidentInterface";
import { INCIDENT_LIST_LIMIT } from "../../db_schema/Incident/IncidentConstants";
import { ICheckCounts, IWebsiteStats } from "../../db_schema/Check/CheckInterface";
import {
  FULL_PERCENT,
  RECENT_CHECKS_LIMIT,
  UPTIME_LONG_WINDOW_DAYS,
  UPTIME_ROUNDING_FACTOR,
  UPTIME_SHORT_WINDOW_DAYS,
} from "../../db_schema/Check/CheckConstants";
import {
  CONFLICT_NAME,
  NOT_FOUND_NAME,
  ONE_DAY_IN_MILLISECONDS,
} from "../../shared/constants";
import { WEBSITE_ALREADY_ADDED, WEBSITE_NOT_FOUND } from "../../shared/errorMessages";

const { CONFLICT, NOT_FOUND } = StatusCodes;

function calculateUptimePercent(counts: ICheckCounts): number | null {
  if (!counts?.total) {
    return null;
  }
  const upShare = (counts.total - counts.failed) / counts.total;
  return Math.round(upShare * FULL_PERCENT * UPTIME_ROUNDING_FACTOR) / UPTIME_ROUNDING_FACTOR;
}

export async function addWebsite(userId: string, body: unknown): Promise<IWebsiteReply> {
  try {
    const websiteValues = (await addWebsiteSchema.validateAsync(body)) as IWebsiteBody;
    return await insertWebsiteWithinLimit(userId, {
      ...websiteValues,
      url: normalizeWebsiteUrl(websiteValues?.url),
    });
  } catch (error) {
    logErrorLocation(
      "WebsiteService.ts",
      "addWebsite",
      error,
      "Error occurred while adding a website",
      userId,
      { userId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function getWebsites(userId: string): Promise<IWebsiteReply[]> {
  try {
    return await fetchWebsitesByUser(userId);
  } catch (error) {
    logErrorLocation(
      "WebsiteService.ts",
      "getWebsites",
      error,
      "Error occurred while listing websites",
      userId,
      { userId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function getWebsite(userId: string, websiteId: unknown): Promise<IWebsiteReply> {
  try {
    const validWebsiteId = (await websiteIdSchema.validateAsync(websiteId)) as string;
    const website = await fetchWebsiteById(userId, validWebsiteId);
    if (!website) {
      return createThrowError(NOT_FOUND, NOT_FOUND_NAME, WEBSITE_NOT_FOUND, {});
    }
    return website;
  } catch (error) {
    logErrorLocation(
      "WebsiteService.ts",
      "getWebsite",
      error,
      "Error occurred while fetching a website",
      userId,
      { userId, websiteId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function editWebsite(
  userId: string,
  websiteId: unknown,
  body: unknown,
): Promise<IWebsiteReply> {
  try {
    const validWebsiteId = (await websiteIdSchema.validateAsync(websiteId)) as string;
    const changes = (await updateWebsiteSchema.validateAsync(body)) as Partial<IWebsiteBody>;
    if (changes?.url) {
      changes.url = normalizeWebsiteUrl(changes.url);
      const sameUrlWebsite = await fetchWebsiteByUrl(userId, changes.url);
      if (sameUrlWebsite && sameUrlWebsite?.id !== validWebsiteId) {
        createThrowError(CONFLICT, CONFLICT_NAME, WEBSITE_ALREADY_ADDED, {});
      }
    }
    const isUpdated = await updateWebsite(userId, validWebsiteId, changes);
    const website = isUpdated ? await fetchWebsiteById(userId, validWebsiteId) : null;
    if (!website) {
      return createThrowError(NOT_FOUND, NOT_FOUND_NAME, WEBSITE_NOT_FOUND, {});
    }
    return website;
  } catch (error) {
    logErrorLocation(
      "WebsiteService.ts",
      "editWebsite",
      error,
      "Error occurred while editing a website",
      userId,
      { userId, websiteId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function removeWebsite(userId: string, websiteId: unknown): Promise<IWebsiteId> {
  try {
    const validWebsiteId = (await websiteIdSchema.validateAsync(websiteId)) as string;
    const isArchived = await archiveWebsite(userId, validWebsiteId);
    if (!isArchived) {
      return createThrowError(NOT_FOUND, NOT_FOUND_NAME, WEBSITE_NOT_FOUND, {});
    }
    return { id: validWebsiteId };
  } catch (error) {
    logErrorLocation(
      "WebsiteService.ts",
      "removeWebsite",
      error,
      "Error occurred while archiving a website",
      userId,
      { userId, websiteId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function getWebsiteIncidents(
  userId: string,
  websiteId: unknown,
): Promise<IIncidentReply[]> {
  try {
    const validWebsiteId = (await websiteIdSchema.validateAsync(websiteId)) as string;
    const website = await fetchWebsiteById(userId, validWebsiteId);
    if (!website) {
      return createThrowError(NOT_FOUND, NOT_FOUND_NAME, WEBSITE_NOT_FOUND, {});
    }
    return await fetchIncidentsByWebsite(validWebsiteId, INCIDENT_LIST_LIMIT);
  } catch (error) {
    logErrorLocation(
      "WebsiteService.ts",
      "getWebsiteIncidents",
      error,
      "Error occurred while listing website incidents",
      userId,
      { userId, websiteId },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function getWebsiteStats(userId: string, websiteId: unknown): Promise<IWebsiteStats> {
  try {
    const validWebsiteId = (await websiteIdSchema.validateAsync(websiteId)) as string;
    const website = await fetchWebsiteById(userId, validWebsiteId);
    if (!website) {
      return createThrowError(NOT_FOUND, NOT_FOUND_NAME, WEBSITE_NOT_FOUND, {});
    }
    const now = Date.now();
    const [shortWindowCounts, longWindowCounts, recentChecks] = await Promise.all([
      fetchCheckCounts(
        validWebsiteId,
        new Date(now - UPTIME_SHORT_WINDOW_DAYS * ONE_DAY_IN_MILLISECONDS),
      ),
      fetchCheckCounts(
        validWebsiteId,
        new Date(now - UPTIME_LONG_WINDOW_DAYS * ONE_DAY_IN_MILLISECONDS),
      ),
      fetchRecentChecks(validWebsiteId, RECENT_CHECKS_LIMIT),
    ]);
    return {
      uptime_24h: calculateUptimePercent(shortWindowCounts),
      uptime_7d: calculateUptimePercent(longWindowCounts),
      recent_checks: recentChecks,
    };
  } catch (error) {
    logErrorLocation(
      "WebsiteService.ts",
      "getWebsiteStats",
      error,
      "Error occurred while fetching website stats",
      userId,
      { userId, websiteId },
    );
    return handleErrorsAxios(error, {});
  }
}
