import { COMMON_MESSAGES } from "../shared/sharedConstant";

const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;
const MINUTES_PER_HOUR = 60;

export interface IResponse<T> {
  status: number;
  message: string;
  data: {
    success?: T;
    failure?: T;
  };
}

export const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return COMMON_MESSAGES.EMPTY_VALUE;
  }
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatTime = (value?: string | null): string => {
  if (!value) {
    return COMMON_MESSAGES.EMPTY_VALUE;
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatDuration = (startedAt?: string | null, endedAt?: string | null): string => {
  if (!startedAt) {
    return COMMON_MESSAGES.EMPTY_VALUE;
  }
  const endTime = endedAt ? new Date(endedAt).getTime() : Date.now();
  const totalMinutes = Math.max(
    1,
    Math.ceil((endTime - new Date(startedAt).getTime()) / ONE_MINUTE_IN_MILLISECONDS),
  );
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
};

export const formatPercent = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return COMMON_MESSAGES.EMPTY_VALUE;
  }
  return `${value}%`;
};
