import * as Yup from "yup";
import { IWebsiteFormValues } from "./DashboardInterface";

export const MAX_WEBSITES_PER_USER = 5;
export const CHECK_INTERVAL_MINUTES = [1, 5, 15];
export const DEFAULT_CHECK_INTERVAL_MINUTES = 5;
export const WEBSITE_NAME_MAX_LENGTH = 60;
export const WEBSITE_URL_MAX_LENGTH = 2048;
export const WEBSITE_URL_START = /^https?:\/\//i;

export const DASHBOARD_MESSAGES = {
  WEBSITE_ADDED: "Website added. The first check runs within a minute.",
  WEBSITE_UPDATED: "Website updated",
  WEBSITE_ARCHIVED: "Website removed",
  LINK_COPIED: "Link copied",
  NAME_REQUIRED: "Name is required",
  NAME_TOO_LONG: `Name can have at most ${WEBSITE_NAME_MAX_LENGTH} characters`,
  URL_REQUIRED: "URL is required",
  URL_INVALID: "Enter a full address that starts with http:// or https://",
  URL_TOO_LONG: `URL can have at most ${WEBSITE_URL_MAX_LENGTH} characters`,
  INTERVAL_INVALID: "Pick one of the listed intervals",
} as const;

export const DASHBOARD_LABELS = {
  ADD_WEBSITE: "Add website",
  EDIT_WEBSITE: "Edit website",
  SITES_USED: "sites used",
  LIMIT_REACHED: "Limit reached. Remove a website to add another.",
  EMPTY_TITLE: "No websites yet",
  EMPTY_TEXT: "Add your first website and sitewatch will start checking it.",
  NAME: "Name",
  NAME_PLACEHOLDER: "My blog",
  URL: "URL",
  URL_PLACEHOLDER: "https://example.com",
  CHECK_EVERY: "Check every",
  EVERY: "Every",
  MINUTE: "minute",
  MINUTES: "minutes",
  SHORT_MINUTES: "min",
  IS_PUBLIC: "Show on my public status page",
  PUBLIC: "Public",
  DETAILS: "Details",
  EDIT: "Edit",
  REMOVE: "Remove",
  CANCEL: "Cancel",
  SAVE: "Save",
  SAVING: "Saving...",
  REMOVE_TITLE: "Remove website?",
  REMOVE_TEXT: "Checks stop for this website. Its history is kept.",
  REMOVING: "Removing...",
  STATUS_PAGE_LINK: "Your public status page",
  STATUS_PAGE_HINT: "Shows the websites marked public. Anyone with the link can open it.",
  OPEN: "Open",
  COPY: "Copy link",
} as const;

export const websiteInitialValues: IWebsiteFormValues = {
  name: "",
  url: "",
  check_interval_minutes: DEFAULT_CHECK_INTERVAL_MINUTES,
  is_public: false,
};

const isValidUrl = (value?: string): boolean => {
  try {
    return !!value && !!new URL(value.trim()).hostname;
  } catch (error) {
    return false;
  }
};

export const websiteSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(WEBSITE_NAME_MAX_LENGTH, DASHBOARD_MESSAGES.NAME_TOO_LONG)
    .required(DASHBOARD_MESSAGES.NAME_REQUIRED),
  url: Yup.string()
    .trim()
    .max(WEBSITE_URL_MAX_LENGTH, DASHBOARD_MESSAGES.URL_TOO_LONG)
    .matches(WEBSITE_URL_START, DASHBOARD_MESSAGES.URL_INVALID)
    .test("valid-url", DASHBOARD_MESSAGES.URL_INVALID, isValidUrl)
    .required(DASHBOARD_MESSAGES.URL_REQUIRED),
  check_interval_minutes: Yup.number()
    .oneOf(CHECK_INTERVAL_MINUTES, DASHBOARD_MESSAGES.INTERVAL_INVALID)
    .required(DASHBOARD_MESSAGES.INTERVAL_INVALID),
  is_public: Yup.boolean().required(),
});
