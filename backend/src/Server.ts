import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import "express-async-errors";
import externalRouter from "./routes/externalRoutes";
import internalRoutes from "./routes/internalRoutes";
import logger from "./shared/Logger";
import { config } from "./config/config";
import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  DEVELOPMENT_ENV,
  PRODUCTION_ENV,
  TRUST_PROXY_HOPS,
} from "./shared/constants";

const app = express();
const { BAD_REQUEST } = StatusCodes;
const corsOptions = {
  origin: true,
  credentials: true,
  methods: CORS_ALLOWED_METHODS,
  allowedHeaders: CORS_ALLOWED_HEADERS,
};

app.use(express.json({ limit: config.payloadSizeLimit + "mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
if (config.nodeEnv === DEVELOPMENT_ENV) {
  app.use(morgan("dev"));
}
if (config.nodeEnv === PRODUCTION_ENV) {
  app.set("trust proxy", TRUST_PROXY_HOPS);
  app.use(helmet());
}
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    const logLine =
      `${req.method} ${req.originalUrl} ${res.statusCode} ` +
      ` ${res.statusMessage} --${responseTime}ms`;
    console.log(logLine);
    logger.info(logLine);
  });
  next();
});
app.use("/api/v1", externalRouter);
app.use("/api/v1/internal", internalRoutes);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(BAD_REQUEST).json({
    error: err.message,
  });
});

export default app;
