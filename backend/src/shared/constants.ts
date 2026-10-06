import { config } from "../config/config";

export const SUCCESS = "success";
export const BAD_REQUEST_NAME = "BAD_REQUEST";
export const UNAUTHORIZED_NAME = "UNAUTHORIZED";
export const FORBIDDEN_NAME = "FORBIDDEN";
export const NOT_FOUND_NAME = "NOT_FOUND";
export const CONFLICT_NAME = "CONFLICT";
export const DEVELOPMENT_ENV = "development";
export const PRODUCTION_ENV = "production";
export const TRUST_PROXY_HOPS = 1;
export const MIN_ERROR_STATUS_CODE = 400;
export const MAX_ERROR_STATUS_CODE = 599;
export const CORS_ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
export const CORS_ALLOWED_HEADERS = ["Content-Type", "Authorization"];
export const HEALTH_CHECK_MESSAGE = "Accepted";
export const HEALTH_CHECK_STATUS = "Healthy";
export const SERVER_STARTED = "Express server started on port: ";
export const VALIDATION_STARTED = "Validating configuration.";
export const VALIDATION_PASSED = "All validations passed!";
export const ALL_CONFIG_VALUES_SET = "All required configuration values are set";
export const DATABASE_CONNECTED = "Database connection is working";
export const LOGGED_OUT = "Logged out";
export const BEARER_PREFIX = "Bearer ";
export const STATIC_TOKEN_HEADER = "authentication";
export const CRON_SECRET_MIN_LENGTH = 32;
export const BLOCKED_ADDRESS_CODE = "BLOCKED_ADDRESS";
export const CHECK_RUN_STARTED = "Check run started";
export const SUPABASE_AUTH_PATH = "/auth/v1";
export const SUPABASE_JWKS_PATH = "/auth/v1/.well-known/jwks.json";
export const SUPABASE_TOKEN_AUDIENCE = "authenticated";
export const REFRESH_TOKEN = "refreshToken";
export const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
export const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;
export const ONE_HOUR_IN_MILLISECONDS = 60 * ONE_MINUTE_IN_MILLISECONDS;
export const MINUTES_PER_HOUR = 60;
export const TEMPLATE_PLACEHOLDER = /\{\{(\w+)\}\}/g;
export const HTML_SPECIAL_CHARACTERS = /[&<>"']/g;
export const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
export const THIRTY_DAYS_IN_MILLISECONDS = 30 * ONE_DAY_IN_MILLISECONDS;
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === PRODUCTION_ENV,
  sameSite: "lax" as const,
  path: "/",
  maxAge: THIRTY_DAYS_IN_MILLISECONDS,
};
export const CLEAR_REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === PRODUCTION_ENV,
  sameSite: "lax" as const,
  path: "/",
};
