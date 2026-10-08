import Joi from "joi";
import { Prisma } from "../../generated/prisma/client";
import { NOTHING_TO_UPDATE } from "../../shared/errorMessages";
import {
  ALLOWED_URL_SCHEMES,
  CHECK_INTERVAL_MINUTES,
  WEBSITE_NAME_MAX_LENGTH,
  WEBSITE_REPLY_FIELDS,
  WEBSITE_URL_MAX_LENGTH,
} from "./WebsiteConstants";

export interface IWebsiteBody {
  name: string;
  url: string;
  check_interval_minutes: number;
  is_public: boolean;
}

export interface IWebsiteId {
  id: string;
}

export type IWebsiteReply = Prisma.WebsiteGetPayload<{ select: typeof WEBSITE_REPLY_FIELDS }>;

const websiteNameRule = Joi.string().trim().min(1).max(WEBSITE_NAME_MAX_LENGTH);
const websiteUrlRule = Joi.string()
  .trim()
  .max(WEBSITE_URL_MAX_LENGTH)
  .uri({ scheme: ALLOWED_URL_SCHEMES });
const checkIntervalRule = Joi.number().integer().valid(...CHECK_INTERVAL_MINUTES);

export const addWebsiteSchema = Joi.object<IWebsiteBody>({
  name: websiteNameRule.required(),
  url: websiteUrlRule.required(),
  check_interval_minutes: checkIntervalRule.required(),
  is_public: Joi.boolean().default(false),
});

export const updateWebsiteSchema = Joi.object<Partial<IWebsiteBody>>({
  name: websiteNameRule,
  url: websiteUrlRule,
  check_interval_minutes: checkIntervalRule,
  is_public: Joi.boolean(),
})
  .min(1)
  .messages({ "object.min": NOTHING_TO_UPDATE });

export const websiteIdSchema = Joi.string().guid().required().label("websiteId");
