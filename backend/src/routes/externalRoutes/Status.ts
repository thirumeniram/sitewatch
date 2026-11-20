import StatusCodes from "http-status-codes";
import { Request, Response, Router } from "express";
import { IResponse, ResponseError } from "../../shared/interfaces";
import { SUCCESS } from "../../shared/constants";
import { statusPageRateLimiter } from "../../library/utils";
import { IStatusPage } from "../../db_schema/Status/StatusInterface";
import { getStatusPage } from "../../service/externalService/StatusService";

const router = Router();
const { OK } = StatusCodes;

/******************************************************************************
 *          Public Status Page - "GET /api/v1/status/:slug" (no login)
 ******************************************************************************/
router.get("/:slug", statusPageRateLimiter, (req: Request, res: Response): void => {
  getStatusPage(req?.params?.slug)
    .then((data) => {
      const resData: IResponse<IStatusPage> = {
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
