import StatusCodes from "http-status-codes";
import { User } from "../../generated/prisma/client";
import { createThrowError, handleErrorsAxios, logErrorLocation } from "../../library/utils";
import { fetchUserById } from "../../Interpreter/PostgreSQL/fetchCalls";
import { NOT_FOUND_NAME } from "../../shared/constants";
import { USER_NOT_FOUND } from "../../shared/errorMessages";

const { NOT_FOUND } = StatusCodes;

export async function getUserProfile(userId: string): Promise<User> {
  try {
    const user = await fetchUserById(userId);
    if (!user) {
      return createThrowError(NOT_FOUND, NOT_FOUND_NAME, USER_NOT_FOUND, {});
    }
    return user;
  } catch (error) {
    logErrorLocation(
      "UserService.ts",
      "getUserProfile",
      error,
      "Error occurred while fetching the user profile",
      userId,
      { userId },
    );
    return handleErrorsAxios(error, {});
  }
}
