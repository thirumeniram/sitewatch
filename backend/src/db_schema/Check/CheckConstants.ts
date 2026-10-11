import { CheckStatus } from "../../generated/prisma/enums";

export const CHECK_STATUS = CheckStatus;
export const RAW_CHECK_RETENTION_DAYS = 7;
export const HOURLY_CHECK_RETENTION_DAYS = 90;
export const CHECK_TIMEOUT_MS = 10000;
export const CHECK_BATCH_SIZE = 20;
export const MAX_SITES_PER_CHECK_RUN = 500;
export const CHECK_SCHEDULE_SLACK_SECONDS = 10;
export const ROLLUP_LOOKBACK_HOURS = 48;
export const RECENT_CHECKS_LIMIT = 60;
export const UPTIME_SHORT_WINDOW_DAYS = 1;
export const UPTIME_LONG_WINDOW_DAYS = 7;
export const FULL_PERCENT = 100;
export const UPTIME_ROUNDING_FACTOR = 100;
export const CHECK_REPLY_FIELDS = {
  status: true,
  status_code: true,
  response_time_ms: true,
  error_message: true,
  checked_at: true,
} as const;
export const UP_STATUS_CODE_MIN = 200;
export const UP_STATUS_CODE_MAX = 399;
export const CHECK_USER_AGENT = "sitewatch-uptime-checker/1.0";
export const ERROR_MESSAGE_MAX_LENGTH = 200;
export const HTTP_STATUS_PREFIX = "HTTP status ";
export const UNKNOWN_PING_ERROR = "Connection failed";
export const PING_ERROR_MESSAGES: Record<string, string> = {
  ECONNABORTED: "Timed out",
  ETIMEDOUT: "Timed out",
  ERR_CANCELED: "Timed out",
  ENOTFOUND: "Domain not found",
  EAI_AGAIN: "Domain lookup failed",
  ECONNREFUSED: "Connection refused",
  ECONNRESET: "Connection reset",
  EHOSTUNREACH: "Host unreachable",
  CERT_HAS_EXPIRED: "SSL certificate expired",
  DEPTH_ZERO_SELF_SIGNED_CERT: "SSL certificate is self-signed",
  SELF_SIGNED_CERT_IN_CHAIN: "SSL certificate is self-signed",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "SSL certificate could not be verified",
  ERR_TLS_CERT_ALTNAME_INVALID: "SSL certificate does not match the domain",
  BLOCKED_ADDRESS: "Blocked: the site points to a private address",
};
