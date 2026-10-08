import StatusCodes from "http-status-codes";
import { Request, Response, Router } from "express";
import { IResponse, ResponseError } from "../../shared/interfaces";
import { SUCCESS } from "../../shared/constants";
import { verifyToken } from "../../library/utils";
import {
  IWebsiteId,
  IWebsiteReply,
} from "../../db_schema/Website/WebsiteInterface";
import { IIncidentReply } from "../../db_schema/Incident/IncidentInterface";
import { IWebsiteStats } from "../../db_schema/Check/CheckInterface";
import {
  addWebsite,
  editWebsite,
  getWebsite,
  getWebsiteIncidents,
  getWebsiteStats,
  getWebsites,
  removeWebsite,
} from "../../service/externalService/WebsiteService";

const router = Router();
const { CREATED, OK } = StatusCodes;

function sendFailure(res: Response, err: ResponseError<Record<string, never>>): void {
  const errData: IResponse<Record<string, never> | undefined> = {
    status: err.code,
    message: err.message,
    data: {
      failure: err.details,
    },
  };
  res.status(err.code).json(errData);
}

/******************************************************************************
 *                    Add Website - "POST /api/v1/website"
 ******************************************************************************/
router.post("/", verifyToken, (req: Request, res: Response): void => {
  addWebsite(res.locals.userId as string, req?.body)
    .then((data) => {
      const resData: IResponse<IWebsiteReply> = {
        status: CREATED,
        message: SUCCESS,
        data: {
          success: data,
        },
      };
      res.status(CREATED).json(resData);
    })
    .catch((err: ResponseError<Record<string, never>>) => sendFailure(res, err));
});

/******************************************************************************
 *                    List Websites - "GET /api/v1/website"
 ******************************************************************************/
router.get("/", verifyToken, (req: Request, res: Response): void => {
  getWebsites(res.locals.userId as string)
    .then((data) => {
      const resData: IResponse<IWebsiteReply[]> = {
        status: OK,
        message: SUCCESS,
        data: {
          success: data,
        },
      };
      res.status(OK).json(resData);
    })
    .catch((err: ResponseError<Record<string, never>>) => sendFailure(res, err));
});

/******************************************************************************
 *                    Get Website - "GET /api/v1/website/:websiteId"
 ******************************************************************************/
router.get(
  "/:websiteId",
  verifyToken,
  (req: Request, res: Response): void => {
    getWebsite(res.locals.userId as string, req?.params?.websiteId)
      .then((data) => {
        const resData: IResponse<IWebsiteReply> = {
          status: OK,
          message: SUCCESS,
          data: {
            success: data,
          },
        };
        res.status(OK).json(resData);
      })
      .catch((err: ResponseError<Record<string, never>>) => sendFailure(res, err));
  },
);

/******************************************************************************
 *          List Website Incidents - "GET /api/v1/website/:websiteId/incidents"
 ******************************************************************************/
router.get(
  "/:websiteId/incidents",
  verifyToken,
  (req: Request, res: Response): void => {
    getWebsiteIncidents(res.locals.userId as string, req?.params?.websiteId)
      .then((data) => {
        const resData: IResponse<IIncidentReply[]> = {
          status: OK,
          message: SUCCESS,
          data: {
            success: data,
          },
        };
        res.status(OK).json(resData);
      })
      .catch((err: ResponseError<Record<string, never>>) => sendFailure(res, err));
  },
);

/******************************************************************************
 *             Get Website Stats - "GET /api/v1/website/:websiteId/stats"
 ******************************************************************************/
router.get(
  "/:websiteId/stats",
  verifyToken,
  (req: Request, res: Response): void => {
    getWebsiteStats(res.locals.userId as string, req?.params?.websiteId)
      .then((data) => {
        const resData: IResponse<IWebsiteStats> = {
          status: OK,
          message: SUCCESS,
          data: {
            success: data,
          },
        };
        res.status(OK).json(resData);
      })
      .catch((err: ResponseError<Record<string, never>>) => sendFailure(res, err));
  },
);

/******************************************************************************
 *                    Edit Website - "PATCH /api/v1/website/:websiteId"
 ******************************************************************************/
router.patch(
  "/:websiteId",
  verifyToken,
  (req: Request, res: Response): void => {
    editWebsite(res.locals.userId as string, req?.params?.websiteId, req?.body)
      .then((data) => {
        const resData: IResponse<IWebsiteReply> = {
          status: OK,
          message: SUCCESS,
          data: {
            success: data,
          },
        };
        res.status(OK).json(resData);
      })
      .catch((err: ResponseError<Record<string, never>>) => sendFailure(res, err));
  },
);

/******************************************************************************
 *                    Archive Website - "DELETE /api/v1/website/:websiteId"
 ******************************************************************************/
router.delete(
  "/:websiteId",
  verifyToken,
  (req: Request, res: Response): void => {
    removeWebsite(res.locals.userId as string, req?.params?.websiteId)
      .then((data) => {
        const resData: IResponse<IWebsiteId> = {
          status: OK,
          message: SUCCESS,
          data: {
            success: data,
          },
        };
        res.status(OK).json(resData);
      })
      .catch((err: ResponseError<Record<string, never>>) => sendFailure(res, err));
  },
);

export default router;
