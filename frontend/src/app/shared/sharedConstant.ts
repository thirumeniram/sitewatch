export const APP_NAME = "sitewatch";

export const APP_PUBLIC_ROUTES = {
  HOME: "/*",
  AUTH: "/auth/*",
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/registration",
  STATUS_PAGE: "/status/:slug",
} as const;

export const AUTH_CHILD_ROUTES = {
  LOGIN: "login",
  REGISTER: "registration",
} as const;

export const APP_PRIVATE_ROUTES = {
  DASHBOARD: "/dashboard",
  WEBSITE_DETAILS: "/website/:websiteId",
} as const;

export const PAGE_TITLE = {
  DASHBOARD: "My websites",
  WEBSITE_DETAILS: "Website details",
  STATUS_PAGE: "Status",
} as const;

export const ROUTE_BUILDERS = {
  websiteDetails: (websiteId: string) => `/website/${websiteId}`,
  statusPage: (slug: string) => `/status/${slug}`,
};

export const WEBSITE_STATUS = {
  UP: "UP",
  DOWN: "DOWN",
  UNKNOWN: "UNKNOWN",
} as const;

export const INCIDENT_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  UP: "Up",
  DOWN: "Down",
  UNKNOWN: "Not checked yet",
  OPEN: "Ongoing",
  CLOSED: "Resolved",
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  UP: "text-bg-success",
  DOWN: "text-bg-danger",
  UNKNOWN: "text-bg-secondary",
  OPEN: "text-bg-danger",
  CLOSED: "text-bg-success",
};

export const DATA_REFRESH_INTERVAL_MS = 60 * 1000;
export const TOAST_POSITION = "top-right";

export const COMMON_MESSAGES = {
  NETWORK_ERROR: "Network error or no response from server",
  SOMETHING_WENT_WRONG: "Something went wrong",
  SESSION_EXPIRED: "Session expired. Please login again.",
  LOGGED_OUT: "Logged out successfully!",
  LOGOUT: "Log out",
  EMPTY_VALUE: "-",
} as const;
