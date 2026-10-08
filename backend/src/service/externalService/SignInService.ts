import StatusCodes from "http-status-codes";
import { Request } from "express";
import { authBodySchema, IAuthBody, IAuthRequest, ISignInRes } from "../../shared/interfaces";
import { createThrowError, handleErrorsAxios, logErrorLocation } from "../../library/utils";
import { saveUserIfMissing } from "../../Interpreter/PostgreSQL/insertCalls";
import {
  authenticateUser,
  getAccessTokenFromRefreshToken,
} from "../../Interpreter/supabase/signIn/signInSupabase";
import { REFRESH_TOKEN, UNAUTHORIZED_NAME } from "../../shared/constants";
import { REFRESH_TOKEN_MISSING } from "../../shared/errorMessages";

const { UNAUTHORIZED } = StatusCodes;

export async function signInUser(req: IAuthRequest): Promise<ISignInRes> {
  let email = "";
  try {
    const signInValues = (await authBodySchema.validateAsync(req?.body)) as IAuthBody;
    email = signInValues?.email;
    const session = await authenticateUser(email, signInValues?.password);
    await saveUserIfMissing(session?.user_id, session?.email || email);
    return {
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
    };
  } catch (error) {
    logErrorLocation(
      "SignInService.ts",
      "signInUser",
      error,
      "Error occurred while signing in user",
      email,
      { email },
    );
    return handleErrorsAxios(error, { email });
  }
}

export async function getNewAccessToken(req: Request): Promise<ISignInRes> {
  try {
    const refreshToken = req?.cookies?.[REFRESH_TOKEN] as string | undefined;
    if (!refreshToken) {
      createThrowError(UNAUTHORIZED, UNAUTHORIZED_NAME, REFRESH_TOKEN_MISSING, {});
    }
    const session = await getAccessTokenFromRefreshToken(`${refreshToken}`);
    return {
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
    };
  } catch (error) {
    logErrorLocation(
      "SignInService.ts",
      "getNewAccessToken",
      error,
      "Error occurred while getting a new access token",
      "",
      {},
    );
    return handleErrorsAxios(error, {});
  }
}
