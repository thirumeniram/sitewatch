import { WebsiteStatus } from "../../generated/prisma/enums";

export const WEBSITE_STATUS = WebsiteStatus;
export const CHECK_INTERVAL_MINUTES = [1, 5, 15];
export const MAX_WEBSITES_PER_USER = 5;
export const WEBSITE_NAME_MAX_LENGTH = 60;
export const WEBSITE_URL_MAX_LENGTH = 2048;
export const ALLOWED_URL_SCHEMES = ["http", "https"];
export const WEBSITE_REPLY_FIELDS = {
  id: true,
  name: true,
  url: true,
  check_interval_minutes: true,
  current_status: true,
  is_public: true,
  created_at: true,
  modified_at: true,
} as const;
