import StatusCodes from "http-status-codes";
import { createSupabaseAuthClient } from "../utilSupabase";
import { createThrowError, handleErrorsAxios, logErrorLocation } from "../../../library/utils";
import { SIGN_UP_FAILED } from "../../../shared/errorMessages";

const { BAD_REQUEST } = StatusCodes;

export const signUpUserSupabase = async (email: string, password: string): Promise<string> => {
  try {
    const { data, error } = await createSupabaseAuthClient().auth.signUp({ email, password });
    if (error) {
      createThrowError(error?.status ?? BAD_REQUEST, error?.name, error?.message, { email });
    }
    const userId = data?.user?.id;
    if (!userId) {
      throw new Error(SIGN_UP_FAILED);
    }
    return userId;
  } catch (error) {
    logErrorLocation(
      "signUpSupabase.ts",
      "signUpUserSupabase",
      error,
      "Error occurred while signing up user in Supabase",
      "",
      { email },
    );
    return handleErrorsAxios(error, { email });
  }
};
