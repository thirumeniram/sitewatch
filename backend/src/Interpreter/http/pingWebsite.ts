import http from "http";
import https from "https";
import { Readable } from "stream";
import axios from "axios";
import { isBlockedHostname, safeLookup } from "../../library/utils";
import { IPingResult, IThrownError } from "../../shared/interfaces";
import { BLOCKED_ADDRESS_CODE } from "../../shared/constants";
import {
  CHECK_STATUS,
  CHECK_TIMEOUT_MS,
  CHECK_USER_AGENT,
  ERROR_MESSAGE_MAX_LENGTH,
  HTTP_STATUS_PREFIX,
  PING_ERROR_MESSAGES,
  UNKNOWN_PING_ERROR,
  UP_STATUS_CODE_MAX,
  UP_STATUS_CODE_MIN,
} from "../../db_schema/Check/CheckConstants";

const httpAgent = new http.Agent({ lookup: safeLookup });
const httpsAgent = new https.Agent({ lookup: safeLookup });

function describePingError(error: unknown): string {
  const thrownError = error as IThrownError & { cause?: IThrownError };
  const errorCode = `${thrownError?.code ?? thrownError?.cause?.code ?? ""}`;
  const message = PING_ERROR_MESSAGES[errorCode] ?? `${UNKNOWN_PING_ERROR} ${errorCode}`.trim();
  return message.slice(0, ERROR_MESSAGE_MAX_LENGTH);
}

export async function pingWebsite(url: string): Promise<IPingResult> {
  const startTime = performance.now();
  try {
    if (isBlockedHostname(new URL(url).hostname)) {
      return {
        status: CHECK_STATUS.DOWN,
        status_code: null,
        response_time_ms: null,
        error_message: PING_ERROR_MESSAGES[BLOCKED_ADDRESS_CODE],
      };
    }
    const response = await axios.get<Readable>(url, {
      httpAgent,
      httpsAgent,
      proxy: false,
      maxRedirects: 0,
      responseType: "stream",
      timeout: CHECK_TIMEOUT_MS,
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      validateStatus: () => true,
      headers: { "User-Agent": CHECK_USER_AGENT },
    });
    response?.data?.destroy();
    const responseTimeMs = Math.round(performance.now() - startTime);
    const statusCode = response?.status;
    const isUp = statusCode >= UP_STATUS_CODE_MIN && statusCode <= UP_STATUS_CODE_MAX;
    return {
      status: isUp ? CHECK_STATUS.UP : CHECK_STATUS.DOWN,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      error_message: isUp ? null : `${HTTP_STATUS_PREFIX}${statusCode}`,
    };
  } catch (error) {
    return {
      status: CHECK_STATUS.DOWN,
      status_code: null,
      response_time_ms: null,
      error_message: describePingError(error),
    };
  }
}
