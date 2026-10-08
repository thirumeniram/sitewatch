import crypto from "crypto";
import dns from "dns";
import net from "net";
import StatusCodes from "http-status-codes";
import rateLimit from "express-rate-limit";
import { NextFunction, Request, Response } from "express";
import { errorLogger } from "../shared/Logger";
import { config } from "../config/config";
import { ILogParams, IResponse, IThrownError, ResponseError } from "../shared/interfaces";
import {
  BLOCKED_URL,
  EMAIL_SEND_FAILED,
  INVALID_TOKEN_MESSAGE,
  SERVER_ERROR,
  TOO_MANY_REQUESTS_MESSAGE,
  TRY_AGAIN,
} from "../shared/errorMessages";
import {
  BLOCKED_HOSTNAME_ENDINGS,
  BLOCKED_HOSTNAMES,
  BLOCKED_IPV4_RANGES,
  BLOCKED_IPV6_RANGES,
  DRIVER_ADAPTER_ERROR_NAME,
  IPV6_BRACKETS,
  PRISMA_ERROR_NAME_START,
  TRAILING_DOT,
} from "../db_schema/shared/sharedConstants";
import { getTokenVerifier } from "../Interpreter/supabase/verifyToken";
import { createResendClient } from "../Interpreter/resend/utilResend";
import {
  BAD_REQUEST_NAME,
  BEARER_PREFIX,
  BLOCKED_ADDRESS_CODE,
  HTML_ESCAPE_MAP,
  HTML_SPECIAL_CHARACTERS,
  MAX_ERROR_STATUS_CODE,
  MIN_ERROR_STATUS_CODE,
  STATIC_TOKEN_HEADER,
  TEMPLATE_PLACEHOLDER,
} from "../shared/constants";
import {
  STATUS_PAGE_RATE_LIMIT_MAX,
  STATUS_PAGE_RATE_LIMIT_WINDOW_MS,
} from "../db_schema/Status/StatusConstants";
import {
  SLUG_EDGE_DASHES,
  SLUG_FALLBACK_NAME,
  SLUG_INVALID_CHARACTERS,
  SLUG_NAME_PART_MAX_LENGTH,
  SLUG_RANDOM_PART_BYTES,
} from "../db_schema/User/UserConstants";

const { BAD_GATEWAY, BAD_REQUEST, INTERNAL_SERVER_ERROR, TOO_MANY_REQUESTS, UNAUTHORIZED } =
  StatusCodes;
const blockedAddresses = new net.BlockList();
BLOCKED_IPV4_RANGES.forEach(([address, prefix]) =>
  blockedAddresses.addSubnet(address, prefix, "ipv4"),
);
BLOCKED_IPV6_RANGES.forEach(([address, prefix]) =>
  blockedAddresses.addSubnet(address, prefix, "ipv6"),
);

export const createThrowError = <T>(
  code: number,
  name: string,
  msg: string,
  details: T,
): never => {
  throw new ResponseError<T>(code, name, msg, details);
};

export const handleErrorsAxios = <T>(error: unknown, details: T): never => {
  const thrownError = error as IThrownError;
  const isDatabaseError =
    thrownError?.name?.startsWith(PRISMA_ERROR_NAME_START) ||
    thrownError?.name === DRIVER_ADAPTER_ERROR_NAME;
  if (thrownError?.response || thrownError?.request || isDatabaseError) {
    return createThrowError(INTERNAL_SERVER_ERROR, SERVER_ERROR, TRY_AGAIN, details);
  }
  const errorCode = Number(thrownError?.code);
  const isHttpErrorCode =
    errorCode >= MIN_ERROR_STATUS_CODE && errorCode <= MAX_ERROR_STATUS_CODE;
  return createThrowError(
    isHttpErrorCode ? errorCode : BAD_REQUEST,
    thrownError?.name ?? BAD_REQUEST_NAME,
    thrownError?.message ?? TRY_AGAIN,
    details,
  );
};

export function logErrorLocation(
  fileName: string,
  method: string,
  error: unknown,
  message: string,
  context: string,
  params: unknown,
) {
  const thrownError = error as IThrownError;
  const logParams = params as ILogParams;
  const logErrorObject = {
    date: new Date().toISOString(),
    fileName,
    method,
    error,
    message,
    context,
    errorCode: thrownError?.code,
    trace: thrownError?.stack,
    url: logParams?.req?.originalUrl,
    ip: logParams?.req?.ip,
    params: JSON.stringify({
      body: logParams?.req?.body,
      params: logParams?.req?.params,
      other: logParams?.req ? {} : params,
    }),
  };
  errorLogger.error(logErrorObject);
  console.log(logErrorObject);
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const err: IResponse<Record<string, never>> = {
    status: UNAUTHORIZED,
    message: INVALID_TOKEN_MESSAGE,
    data: {
      failure: {},
    },
  };
  try {
    const authorizationHeader = req?.headers?.authorization;
    const token = authorizationHeader?.startsWith(BEARER_PREFIX)
      ? authorizationHeader.slice(BEARER_PREFIX.length)
      : undefined;
    if (!token) {
      throw new Error(INVALID_TOKEN_MESSAGE);
    }
    const payload = await getTokenVerifier().verify(token);
    if (!payload?.sub) {
      throw new Error(INVALID_TOKEN_MESSAGE);
    }
    res.locals.userId = payload.sub;
    next();
  } catch (error) {
    res.status(UNAUTHORIZED).json(err);
  }
};

export function createStatusPageSlug(email: string): string {
  const namePart =
    email
      ?.split("@")?.[0]
      ?.toLowerCase()
      ?.replace(SLUG_INVALID_CHARACTERS, "-")
      ?.slice(0, SLUG_NAME_PART_MAX_LENGTH)
      ?.replace(SLUG_EDGE_DASHES, "") || SLUG_FALLBACK_NAME;
  const randomPart = crypto.randomBytes(SLUG_RANDOM_PART_BYTES).toString("hex");
  return `${namePart}-${randomPart}`;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname?.toLowerCase()?.replace(IPV6_BRACKETS, "")?.replace(TRAILING_DOT, "");
  if (!host) {
    return true;
  }
  if (net.isIP(host)) {
    return isBlockedIpAddress(host);
  }
  return (
    !host.includes(".") ||
    BLOCKED_HOSTNAMES.includes(host) ||
    BLOCKED_HOSTNAME_ENDINGS.some((ending) => host.endsWith(ending))
  );
}

export function normalizeWebsiteUrl(url: string): string {
  const parsedUrl = new URL(url);
  if (parsedUrl.username || parsedUrl.password || isBlockedHostname(parsedUrl.hostname)) {
    createThrowError(BAD_REQUEST, BAD_REQUEST_NAME, BLOCKED_URL, { url });
  }
  return parsedUrl.toString();
}

export function isBlockedIpAddress(address: string): boolean {
  const ipVersion = net.isIP(address);
  if (ipVersion === 4) {
    return blockedAddresses.check(address, "ipv4");
  }
  if (ipVersion === 6) {
    return blockedAddresses.check(address, "ipv6");
  }
  return true;
}

function createBlockedAddressError(hostname: string): NodeJS.ErrnoException {
  const blockedError: NodeJS.ErrnoException = new Error(`${BLOCKED_ADDRESS_CODE} ${hostname}`);
  blockedError.code = BLOCKED_ADDRESS_CODE;
  return blockedError;
}

export const safeLookup = ((
  hostname: string,
  options: dns.LookupOptions,
  callback: (
    error: NodeJS.ErrnoException | null,
    address?: string | dns.LookupAddress[],
    family?: number,
  ) => void,
) => {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) {
      callback(error);
      return;
    }
    const isBlocked =
      !addresses?.length || addresses.some((entry) => isBlockedIpAddress(entry?.address));
    if (isBlocked) {
      callback(createBlockedAddressError(hostname));
      return;
    }
    if (options?.all) {
      callback(null, addresses);
      return;
    }
    callback(null, addresses[0].address, addresses[0].family);
  });
}) as typeof dns.lookup;

function hashSecret(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

export const verifyStaticToken = (req: Request, res: Response, next: NextFunction): void => {
  const err: IResponse<Record<string, never>> = {
    status: UNAUTHORIZED,
    message: INVALID_TOKEN_MESSAGE,
    data: {
      failure: {},
    },
  };
  const sentSecret = req?.headers?.[STATIC_TOKEN_HEADER];
  const isValid =
    typeof sentSecret === "string" &&
    !!config.cronSecret &&
    crypto.timingSafeEqual(hashSecret(sentSecret), hashSecret(config.cronSecret));
  if (isValid) {
    next();
    return;
  }
  res.status(UNAUTHORIZED).json(err);
};

export function escapeHtml(text: string): string {
  return `${text ?? ""}`.replace(
    HTML_SPECIAL_CHARACTERS,
    (character) => HTML_ESCAPE_MAP[character] ?? character,
  );
}

export function fillEmailTemplate(template: string, values: Record<string, string>): string {
  return template.replace(TEMPLATE_PLACEHOLDER, (placeholder, key: string) => values?.[key] ?? "");
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const result = await createResendClient().emails.send({
      from: `${config.email.alertSender}`,
      to,
      subject,
      html,
    });
    if (result?.error) {
      createThrowError(BAD_GATEWAY, SERVER_ERROR, EMAIL_SEND_FAILED, {
        reason: result?.error?.message,
      });
    }
  } catch (error) {
    logErrorLocation(
      "utils.ts",
      "sendEmail",
      error,
      "Error occurred while sending email",
      "",
      { to, subject },
    );
    return handleErrorsAxios(error, {});
  }
}

export const statusPageRateLimiter = rateLimit({
  windowMs: STATUS_PAGE_RATE_LIMIT_WINDOW_MS,
  limit: STATUS_PAGE_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const err: IResponse<Record<string, never>> = {
      status: TOO_MANY_REQUESTS,
      message: TOO_MANY_REQUESTS_MESSAGE,
      data: {
        failure: {},
      },
    };
    res.status(TOO_MANY_REQUESTS).json(err);
  },
});
