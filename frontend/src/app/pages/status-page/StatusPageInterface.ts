import { IWebsiteStatus } from "../../shared/sharedInterface";
import { INCIDENT_STATUS } from "../../shared/sharedConstant";
import { DAY_STATUS } from "./StatusPageConstants";

export interface IStatusDay {
  date: string;
  status: keyof typeof DAY_STATUS;
}

export interface IStatusSite {
  name: string;
  current_status: IWebsiteStatus;
  uptime_90d: number | null;
  days: IStatusDay[];
}

export interface IStatusIncident {
  website_name: string;
  status: keyof typeof INCIDENT_STATUS;
  started_at: string;
  ended_at: string | null;
  failure_reason: string | null;
  summary: string | null;
}

export interface IStatusPage {
  slug: string;
  sites: IStatusSite[];
  incidents: IStatusIncident[];
}
