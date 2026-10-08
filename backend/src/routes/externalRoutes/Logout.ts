import StatusCodes from "http-status-codes";
import { Request, Response, Router } from "express";
import { IResponse } from "../../shared/interfaces";
import {
  CLEAR_REFRESH_TOKEN_COOKIE_OPTIONS,
  LOGGED_OUT,
  REFRESH_TOKEN,
  SUCCESS,
} from "../../shared/constants";

const router = Router();
const { OK } = StatusCodes;

/******************************************************************************
 *                    Logout - "POST /api/v1/auth/logout"
 ******************************************************************************/
router.post("/logout", (req: Request, res: Response): void => {
  res.clearCookie(REFRESH_TOKEN, CLEAR_REFRESH_TOKEN_COOKIE_OPTIONS);
  const resData: IResponse<string> = {
    status: OK,
    message: SUCCESS,
    data: {
      success: LOGGED_OUT,
    },
  };
  res.status(OK).json(resData);
});

export default router;
