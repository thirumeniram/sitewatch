import Joi from "joi";
import { Prisma, WebsiteStatus } from "../../generated/prisma/client";
import { STATUS_PAGE_SLUG_PATTERN } from "../User/UserConstants";
import { STATUS_PAGE_NOT_FOUND } from "../../shared/errorMessages";
import {
  DAY_STATUS,
  HOURLY_ROLLUP_FIELDS,
  PUBLIC_INCIDENT_FIELDS,
  PUBLIC_WEBSITE_FIELDS,
} from "./StatusConstants";

export type IPublicWebsiteRow = Prisma.WebsiteGetPayload<{
  select: typeof PUBLIC_WEBSITE_FIELDS;
}>;

export type IHourlyRollupRow = Prisma.CheckHourlyGetPayload<{
  select: typeof HOURLY_ROLLUP_FIELDS;
}>;

export type IPublicIncidentRow = Prisma.IncidentGetPayload<{
  select: typeof PUBLIC_INCIDENT_FIELDS;
}>;

export type IDayStatus = keyof typeof DAY_STATUS;

export interface IDayTotals {
  total: number;
  failed: number;
}

export interface IStatusDay {
  date: string;
  status: IDayStatus;
}

export interface IStatusSite {
  name: string;
  current_status: WebsiteStatus;
  uptime_90d: number | null;
  days: IStatusDay[];
}

export interface IStatusIncident {
  website_name: string;
  status: IPublicIncidentRow["status"];
  started_at: Date;
  ended_at: Date | null;
  failure_reason: string | null;
  summary: string | null;
}

export interface IStatusPage {
  slug: string;
  sites: IStatusSite[];
  incidents: IStatusIncident[];
}

export const statusSlugSchema = Joi.string()
  .pattern(STATUS_PAGE_SLUG_PATTERN)
  .required()
  .messages({ "string.pattern.base": STATUS_PAGE_NOT_FOUND });
