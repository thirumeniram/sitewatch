import StatusCodes from "http-status-codes";
import { Response, Router } from "express";
import { IAuthRequest, IEmail, IResponse, ResponseError } from "../../shared/interfaces";
import { SUCCESS } from "../../shared/constants";
import { signUpUser } from "../../service/externalService/SignUpService";

const router = Router();
const { OK } = StatusCodes;

/******************************************************************************
 *                    Sign Up - "POST /api/v1/auth/signup"
 ******************************************************************************/
router.post("/signup", (req: IAuthRequest, res: Response): void => {
  signUpUser(req)
    .then((data) => {
      const resData: IResponse<IEmail> = {
        status: OK,
        message: SUCCESS,
        data: {
          success: data,
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

export default router;
