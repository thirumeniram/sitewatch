import StatusCodes from "http-status-codes";
import { Request, Response, Router } from "express";
import logger from "../../shared/Logger";
import { IResponse, IRollupSummary, ResponseError } from "../../shared/interfaces";
import { CHECK_RUN_STARTED, SUCCESS } from "../../shared/constants";
import { verifyStaticToken } from "../../library/utils";
import { rollUpAndCleanChecks, runDueChecks } from "../../service/internalService/CheckService";

const router = Router();
const { ACCEPTED, OK } = StatusCodes;

/******************************************************************************
 *                 Run Due Checks - "POST /api/v1/internal/check/run"
 ******************************************************************************/
router.post("/run", verifyStaticToken, (req: Request, res: Response): void => {
  runDueChecks()
    .then((summary) => logger.info({ checkRun: summary }))
    .catch((err: ResponseError<Record<string, never>>) =>
      logger.error({ checkRunFailed: err?.message }),
    );
  const resData: IResponse<string> = {
    status: ACCEPTED,
    message: SUCCESS,
    data: {
      success: CHECK_RUN_STARTED,
    },
  };
  res.status(ACCEPTED).json(resData);
});

/******************************************************************************
 *            Roll Up And Clean Checks - "POST /api/v1/internal/check/rollup"
 ******************************************************************************/
router.post("/rollup", verifyStaticToken, (req: Request, res: Response): void => {
  rollUpAndCleanChecks()
    .then((data) => {
      const resData: IResponse<IRollupSummary> = {
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
