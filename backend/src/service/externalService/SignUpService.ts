import StatusCodes from "http-status-codes";
import { authBodySchema, IAuthBody, IAuthRequest, IEmail } from "../../shared/interfaces";
import { createThrowError, handleErrorsAxios, logErrorLocation } from "../../library/utils";
import { fetchUserCount } from "../../Interpreter/PostgreSQL/fetchCalls";
import { saveUserIfMissing } from "../../Interpreter/PostgreSQL/insertCalls";
import { signUpUserSupabase } from "../../Interpreter/supabase/signUp/signUpSupabase";
import { MAX_USERS } from "../../db_schema/User/UserConstants";
import { FORBIDDEN_NAME } from "../../shared/constants";
import { SIGN_UP_LIMIT_REACHED } from "../../shared/errorMessages";

const { FORBIDDEN } = StatusCodes;

export async function signUpUser(req: IAuthRequest): Promise<IEmail> {
  let email = "";
  try {
    const signUpValues = (await authBodySchema.validateAsync(req?.body)) as IAuthBody;
    email = signUpValues?.email;
    const userCount = await fetchUserCount();
    if (userCount >= MAX_USERS) {
      createThrowError(FORBIDDEN, FORBIDDEN_NAME, SIGN_UP_LIMIT_REACHED, { email });
    }
    const userId = await signUpUserSupabase(email, signUpValues?.password);
    await saveUserIfMissing(userId, email);
    return { email };
  } catch (error) {
    logErrorLocation(
      "SignUpService.ts",
      "signUpUser",
      error,
      "Error occurred while signing up user",
      email,
      { email },
    );
    return handleErrorsAxios(error, { email });
  }
}
