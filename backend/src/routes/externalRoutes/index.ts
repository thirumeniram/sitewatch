import { Router } from "express";
import signUpRouter from "./SignUp";
import signInRouter from "./SignIn";
import logoutRouter from "./Logout";
import userRouter from "./User";
import websiteRouter from "./Website";
import statusRouter from "./Status";

const router = Router();

router.use("/auth", signUpRouter, signInRouter, logoutRouter);
router.use("/user", userRouter);
router.use("/website", websiteRouter);
router.use("/status", statusRouter);

export default router;
