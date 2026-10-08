import { Prisma } from "../../generated/prisma/client";
import { CHECK_REPLY_FIELDS } from "./CheckConstants";

export type ICheckReply = Prisma.CheckGetPayload<{ select: typeof CHECK_REPLY_FIELDS }>;

export interface ICheckCounts {
  total: number;
  failed: number;
}

export interface IWebsiteStats {
  uptime_24h: number | null;
  uptime_7d: number | null;
  recent_checks: ICheckReply[];
}
