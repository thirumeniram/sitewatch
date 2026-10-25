import { Prisma } from "../../generated/prisma/client";
import {
  ALERT_EMAIL_TYPE,
  INCIDENT_EMAIL_FIELDS,
  INCIDENT_REPLY_FIELDS,
  INCIDENT_SUMMARY_FIELDS,
} from "./IncidentConstants";

export type IIncidentReply = Prisma.IncidentGetPayload<{ select: typeof INCIDENT_REPLY_FIELDS }>;

export type IIncidentEmailRow = Prisma.IncidentGetPayload<{
  select: typeof INCIDENT_EMAIL_FIELDS;
}>;

export type IAlertEmailType = keyof typeof ALERT_EMAIL_TYPE;

export interface IAlertEmail {
  subject: string;
  html: string;
}

export type IIncidentSummaryRow = Prisma.IncidentGetPayload<{
  select: typeof INCIDENT_SUMMARY_FIELDS;
}>;
