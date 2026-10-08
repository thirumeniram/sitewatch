import StatusCodes from "http-status-codes";
import { Request, Response, Router } from "express";
import { User } from "../../generated/prisma/client";
import { IResponse, ResponseError } from "../../shared/interfaces";
import { SUCCESS } from "../../shared/constants";
import { verifyToken } from "../../library/utils";
import { getUserProfile } from "../../service/externalService/UserService";

const router = Router();
const { OK } = StatusCodes;

/******************************************************************************
 *                    User Profile - "GET /api/v1/user/profile"
 ******************************************************************************/
router.get("/profile", verifyToken, (req: Request, res: Response): void => {
  getUserProfile(res.locals.userId as string)
    .then((data) => {
      const resData: IResponse<User> = {
        status: OK,
        message: SUCCESS,
        data: {
          success: data,
        },
      };
      res.status(OK).json(resData);
    })
    .catch((err: ResponseError<Record<string, never>>) => {
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
