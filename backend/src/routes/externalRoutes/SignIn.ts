import StatusCodes from "http-status-codes";
import { Request, Response, Router } from "express";
import {
  IAuthRequest,
  IEmail,
  IResponse,
  ISignInResData,
  ResponseError,
} from "../../shared/interfaces";
import {
  CLEAR_REFRESH_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  SUCCESS,
} from "../../shared/constants";
import { getNewAccessToken, signInUser } from "../../service/externalService/SignInService";

const router = Router();
const { OK } = StatusCodes;

/******************************************************************************
 *                    Sign In - "POST /api/v1/auth/signin"
 ******************************************************************************/
router.post("/signin", (req: IAuthRequest, res: Response): void => {
  signInUser(req)
    .then((data) => {
      res.cookie(REFRESH_TOKEN, data.refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);
      const resData: IResponse<ISignInResData> = {
        status: OK,
        message: SUCCESS,
        data: {
          success: {
            access_token: data.access_token,
          },
        },
      };
      res.status(OK).json(resData);
    })
    .catch((err: ResponseError<IEmail>) => {
      const errData: IResponse<IEmail | undefined> = {
        status: err.code,
        message: err.message,
        data: {
          failure: err.details,
        },
      };
      res.status(err.code).json(errData);
    });
});

/******************************************************************************
 *              Get New Access Token - "GET /api/v1/auth/getNewAccessToken"
 ******************************************************************************/
router.get("/getNewAccessToken", (req: Request, res: Response): void => {
  getNewAccessToken(req)
    .then((data) => {
      res.cookie(REFRESH_TOKEN, data.refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);
      const resData: IResponse<ISignInResData> = {
        status: OK,
        message: SUCCESS,
        data: {
          success: {
            access_token: data.access_token,
          },
        },
      };
      res.status(OK).json(resData);
    })
    .catch((err: ResponseError<Record<string, never>>) => {
      res.clearCookie(REFRESH_TOKEN, CLEAR_REFRESH_TOKEN_COOKIE_OPTIONS);
      const errData: IResponse<Record<string, never> | undefined> = {
        status: err.code,
        message: err.message,
        data: {
          failure: err.details,
        },
      };
      res.status(err.code).json(errData);
    });
});

export default router;
