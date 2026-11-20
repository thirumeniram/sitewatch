import StatusCodes from "http-status-codes";
import { createThrowError, handleErrorsAxios, logErrorLocation } from "../../library/utils";
import {
  fetchHourlyRollups,
  fetchPublicIncidents,
  fetchPublicWebsites,
  fetchUserIdBySlug,
} from "../../Interpreter/PostgreSQL/fetchCalls";
import {
  IDayTotals,
  IHourlyRollupRow,
  IStatusDay,
  IStatusPage,
  statusSlugSchema,
} from "../../db_schema/Status/StatusInterface";
import {
  DATE_KEY_LENGTH,
  DAY_STATUS,
  STATUS_PAGE_BAR_DAYS,
  STATUS_PAGE_INCIDENT_DAYS,
  STATUS_PAGE_INCIDENT_LIMIT,
  STATUS_PAGE_UPTIME_DAYS,
} from "../../db_schema/Status/StatusConstants";
import { FULL_PERCENT, UPTIME_ROUNDING_FACTOR } from "../../db_schema/Check/CheckConstants";
import { NOT_FOUND_NAME, ONE_DAY_IN_MILLISECONDS } from "../../shared/constants";
import { STATUS_PAGE_NOT_FOUND } from "../../shared/errorMessages";

const { NOT_FOUND } = StatusCodes;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, DATE_KEY_LENGTH);
}

function sumTotals(rows: IHourlyRollupRow[]): IDayTotals {
  return rows.reduce(
    (totals, row) => ({
      total: totals.total + (row?.total_checks ?? 0),
      failed: totals.failed + (row?.failed_checks ?? 0),
    }),
    { total: 0, failed: 0 },
  );
}

function toUptimePercent(totals: IDayTotals): number | null {
  if (!totals?.total) {
    return null;
  }
  const upShare = (totals.total - totals.failed) / totals.total;
  return Math.round(upShare * FULL_PERCENT * UPTIME_ROUNDING_FACTOR) / UPTIME_ROUNDING_FACTOR;
}

function buildDays(rows: IHourlyRollupRow[], now: number): IStatusDay[] {
  const totalsByDay = new Map<string, IDayTotals>();
  rows.forEach((row) => {
    const dateKey = toDateKey(row?.hour_start);
    const current = totalsByDay.get(dateKey) ?? { total: 0, failed: 0 };
    totalsByDay.set(dateKey, {
      total: current.total + (row?.total_checks ?? 0),
      failed: current.failed + (row?.failed_checks ?? 0),
    });
  });
  const days: IStatusDay[] = [];
  for (let daysAgo = STATUS_PAGE_BAR_DAYS - 1; daysAgo >= 0; daysAgo -= 1) {
    const dateKey = toDateKey(new Date(now - daysAgo * ONE_DAY_IN_MILLISECONDS));
    const totals = totalsByDay.get(dateKey);
    const status = !totals?.total
      ? DAY_STATUS.NO_DATA
      : totals.failed > 0
        ? DAY_STATUS.DOWN
        : DAY_STATUS.UP;
    days.push({ date: dateKey, status });
  }
  return days;
}

export async function getStatusPage(slug: unknown): Promise<IStatusPage> {
  try {
    const validSlug = (await statusSlugSchema.validateAsync(slug)) as string;
    const userId = await fetchUserIdBySlug(validSlug);
    if (!userId) {
      return createThrowError(NOT_FOUND, NOT_FOUND_NAME, STATUS_PAGE_NOT_FOUND, {});
    }
    const websites = await fetchPublicWebsites(userId);
    if (websites.length === 0) {
      return { slug: validSlug, sites: [], incidents: [] };
    }
    const now = Date.now();
    const websiteIds = websites.map((website) => website.id);
    const [hourlyRows, incidents] = await Promise.all([
      fetchHourlyRollups(websiteIds, new Date(now - STATUS_PAGE_UPTIME_DAYS * ONE_DAY_IN_MILLISECONDS)),
      fetchPublicIncidents(
        websiteIds,
        new Date(now - STATUS_PAGE_INCIDENT_DAYS * ONE_DAY_IN_MILLISECONDS),
        STATUS_PAGE_INCIDENT_LIMIT,
      ),
    ]);
    return {
      slug: validSlug,
      sites: websites.map((website) => {
        const websiteRows = hourlyRows.filter((row) => row?.website_id === website.id);
        return {
          name: website.name,
          current_status: website.current_status,
          uptime_90d: toUptimePercent(sumTotals(websiteRows)),
          days: buildDays(websiteRows, now),
        };
      }),
      incidents: incidents.map((incident) => ({
        website_name: incident?.website?.name,
        status: incident?.status,
        started_at: incident?.started_at,
        ended_at: incident?.ended_at,
        failure_reason: incident?.failure_reason,
        summary: incident?.summary,
      })),
    };
  } catch (error) {
    logErrorLocation(
      "StatusService.ts",
      "getStatusPage",
      error,
      "Error occurred while building the status page",
      "",
      { slug },
    );
    return handleErrorsAxios(error, {});
  }
}
