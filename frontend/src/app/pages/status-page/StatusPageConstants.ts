export const DAY_STATUS = {
  UP: "UP",
  DOWN: "DOWN",
  NO_DATA: "NO_DATA",
} as const;

export const DAY_BAR_CLASSES: Record<string, string> = {
  UP: "bg-success",
  DOWN: "bg-danger",
  NO_DATA: "bg-secondary-subtle",
};

export const DAY_BAR_TITLES: Record<string, string> = {
  UP: "No failed checks",
  DOWN: "Had failed checks",
  NO_DATA: "No data",
};

export const STATUS_PAGE_LABELS = {
  TITLE: "Status",
  ALL_UP: "All systems operational",
  SOME_DOWN: "Some systems are down",
  NO_SITES: "Nothing to show yet",
  NO_SITES_TEXT: "The owner has not made any website public.",
  NOT_FOUND: "Status page not found",
  NOT_FOUND_TEXT: "Check the link and try again.",
  UPTIME_90D: "90-day uptime",
  LAST_30_DAYS: "Last 30 days",
  TODAY: "Today",
  INCIDENTS_TITLE: "Recent incidents",
  NO_INCIDENTS: "No incidents in the last 30 days.",
  POWERED_BY: "Powered by",
} as const;
