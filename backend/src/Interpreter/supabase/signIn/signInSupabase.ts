import StatusCodes from "http-status-codes";
import { Session, User } from "@supabase/supabase-js";
import { createSupabaseAuthClient } from "../utilSupabase";
import { createThrowError, handleErrorsAxios, logErrorLocation } from "../../../library/utils";
import { ISupabaseSession } from "../../../shared/interfaces";
import { SIGN_IN_FAILED } from "../../../shared/errorMessages";

const { BAD_REQUEST } = StatusCodes;

function toSupabaseSession(session: Session | null, user: User | null): ISupabaseSession {
  if (!session?.access_token || !session?.refresh_token || !user?.id) {
    throw new Error(SIGN_IN_FAILED);
  }
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user_id: user.id,
    email: user?.email ?? "",
  };
}

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<ISupabaseSession> => {
  try {
    const { data, error } = await createSupabaseAuthClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      createThrowError(error?.status ?? BAD_REQUEST, error?.name, error?.message, { email });
    }
    return toSupabaseSession(data?.session, data?.user);
  } catch (error) {
    logErrorLocation(
      "signInSupabase.ts",
      "authenticateUser",
      error,
      "Error occurred while signing in user in Supabase",
      "",
      { email },
    );
    return handleErrorsAxios(error, { email });
  }
};

export async function getAccessTokenFromRefreshToken(
  refreshToken: string,
): Promise<ISupabaseSession> {
  try {
    const { data, error } = await createSupabaseAuthClient().auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error) {
      createThrowError(error?.status ?? BAD_REQUEST, error?.name, error?.message, {});
    }
    return toSupabaseSession(data?.session, data?.user);
  } catch (error) {
    logErrorLocation(
      "signInSupabase.ts",
      "getAccessTokenFromRefreshToken",
      error,
      "Error occurred while refreshing the Supabase session",
      "",
      {},
    );
    return handleErrorsAxios(error, {});
  }
}
