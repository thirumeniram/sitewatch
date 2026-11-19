import { INCIDENT_STATUS } from "../../shared/sharedConstant";

export interface ICheck {
  status: "UP" | "DOWN";
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface IWebsiteStats {
  uptime_24h: number | null;
  uptime_7d: number | null;
  recent_checks: ICheck[];
}

export interface IIncident {
  id: string;
  status: keyof typeof INCIDENT_STATUS;
  started_at: string;
  ended_at: string | null;
  failure_reason: string | null;
  summary: string | null;
}

export interface IResponseTimeChartProps {
  checks: ICheck[];
}
