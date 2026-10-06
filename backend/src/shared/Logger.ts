import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "../config/config";
import { PRODUCTION_ENV } from "./constants";

const transport = new DailyRotateFile({
  filename: "logs/activity-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "150m",
  maxFiles: "10d",
  level: "info",
});

const transportError = new DailyRotateFile({
  filename: "logs/activity-error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "150m",
  maxFiles: "10d",
  level: "error",
});

const addDate = winston.format((info) => {
  info.date = new Date();
  return info;
});

const isProduction = config.nodeEnv === PRODUCTION_ENV;

const logger = winston.createLogger({
  format: winston.format.combine(addDate(), winston.format.json()),
  transports: isProduction ? [new winston.transports.Console()] : [transport],
});

export const errorLogger = winston.createLogger({
  format: winston.format.combine(addDate(), winston.format.json()),
  transports: isProduction ? [new winston.transports.Console()] : [transportError],
});

export default logger;
