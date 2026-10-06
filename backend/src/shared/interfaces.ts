import Joi from "joi";
import { Request } from "express";
import StatusCodes from "http-status-codes";
import { CheckStatus } from "../generated/prisma/enums";
import { BAD_REQUEST_NAME } from "./constants";
import { TRY_AGAIN } from "./errorMessages";
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../db_schema/User/UserConstants";

export interface IResponse<T> {
  status: number;
  message: string;
  data: {
    success?: T;
    failure?: T;
  };
}

export interface IThrownError {
  code?: string | number;
  name?: string;
  message?: string;
  stack?: string;
  response?: unknown;
  request?: unknown;
}

export interface ILogParams {
  req?: Request;
  [key: string]: unknown;
}

export interface IAuthBody {
  email: string;
  password: string;
}

export interface IAuthRequest extends Request {
  body: IAuthBody;
}

export interface IEmail {
  email: string;
}

export interface ISupabaseSession {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

export interface ISignInRes {
  access_token: string;
  refresh_token: string;
}

export interface ISignInResData {
  access_token: string;
}

export interface IPingResult {
  status: CheckStatus;
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
}

export interface ICheckResult extends IPingResult {
  website_id: string;
}

export interface IDueWebsite {
  id: string;
  url: string;
}

export interface ICheckRunSummary {
  checked: number;
  up: number;
  down: number;
  emails_sent: number;
  summaries_written: number;
}

export interface IRollupSummary {
  hourly_rows_saved: number;
  raw_checks_deleted: number;
  hourly_rows_deleted: number;
}

export class ResponseError<T> extends Error {
  code: number;
  name: string;
  details: T | undefined;
  constructor(code?: number, name?: string, message = TRY_AGAIN, details?: T) {
    super(message);
    this.code = code ?? StatusCodes.BAD_REQUEST;
    this.name = name ?? BAD_REQUEST_NAME;
    this.message = message ?? TRY_AGAIN;
    this.details = details;
  }
}

export const authBodySchema = Joi.object<IAuthBody>({
  email: Joi.string().trim().lowercase().email().max(EMAIL_MAX_LENGTH).required(),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).required(),
});
