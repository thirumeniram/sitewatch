export const STATUS_PAGE_UPTIME_DAYS = 90;
export const STATUS_PAGE_BAR_DAYS = 30;
export const STATUS_PAGE_INCIDENT_DAYS = 30;
export const STATUS_PAGE_INCIDENT_LIMIT = 20;
export const STATUS_PAGE_RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const STATUS_PAGE_RATE_LIMIT_MAX = 60;
export const DAY_STATUS = {
  UP: "UP",
  DOWN: "DOWN",
  NO_DATA: "NO_DATA",
} as const;
export const DATE_KEY_LENGTH = 10;
export const PUBLIC_WEBSITE_FIELDS = {
  id: true,
  name: true,
  current_status: true,
} as const;
export const HOURLY_ROLLUP_FIELDS = {
  website_id: true,
  hour_start: true,
  total_checks: true,
  failed_checks: true,
} as const;
export const PUBLIC_INCIDENT_FIELDS = {
  status: true,
  started_at: true,
  ended_at: true,
  failure_reason: true,
  summary: true,
  website: {
    select: {
      name: true,
    },
  },
} as const;
