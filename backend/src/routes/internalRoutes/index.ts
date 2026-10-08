import StatusCodes from "http-status-codes";
import { Request, Response, Router } from "express";
import { HEALTH_CHECK_MESSAGE, HEALTH_CHECK_STATUS } from "../../shared/constants";
import { IResponse } from "../../shared/interfaces";
import checkRouter from "./Check";

const router = Router();
const { ACCEPTED } = StatusCodes;

router.use("/check", checkRouter);

/**********************************************************************************************
 *    Health Check - "GET /api/v1/internal/health-check"
 *******************************************************************************************/
router.get("/health-check", (req: Request, res: Response): void => {
  const resData: IResponse<string> = {
    status: ACCEPTED,
    message: HEALTH_CHECK_MESSAGE,
    data: {
      success: HEALTH_CHECK_STATUS,
    },
  };
  res.status(ACCEPTED).json(resData);
});

export default router;
