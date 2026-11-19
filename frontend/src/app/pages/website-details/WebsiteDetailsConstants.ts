import { IWebsiteStats } from "./WebsiteDetailsInterface";

export const CHECK_STATUS_DOWN = "DOWN";
export const CHART_LINE_COLOR = "#198754";
export const CHART_FILL_COLOR = "rgba(25, 135, 84, 0.1)";
export const CHART_DOWN_POINT_COLOR = "#dc3545";
export const CHART_LINE_TENSION = 0.3;
export const CHART_POINT_RADIUS = 3;

export const EMPTY_WEBSITE_STATS: IWebsiteStats = {
  uptime_24h: null,
  uptime_7d: null,
  recent_checks: [],
};

export const WEBSITE_DETAILS_LABELS = {
  BACK: "All websites",
  UPTIME_24H: "Uptime, last 24 hours",
  UPTIME_7D: "Uptime, last 7 days",
  CHECKED_EVERY: "Checked every",
  LAST_RESPONSE: "Last response time",
  MINUTES: "min",
  MILLISECONDS: "ms",
  CHART_TITLE: "Response time",
  CHART_SUBTITLE: "Latest checks. Red points are failed checks.",
  CHART_AXIS: "Response time (ms)",
  NO_CHECKS: "No checks yet. The first check runs within a minute.",
  INCIDENTS_TITLE: "Incidents",
  NO_INCIDENTS: "No incidents. This website has not gone down.",
  STATUS: "Status",
  STARTED: "Started",
  ENDED: "Ended",
  DURATION: "Duration",
  REASON: "Reason",
} as const;
