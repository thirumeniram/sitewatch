import { config } from "./config";
import prisma from "../pgConfig";
import { IThrownError } from "../shared/interfaces";
import {
  ALL_CONFIG_VALUES_SET,
  CRON_SECRET_MIN_LENGTH,
  DATABASE_CONNECTED,
} from "../shared/constants";
import {
  CHECK_DATABASE_CONNECTION,
  CHECK_ENVIRONMENT_VARIABLES,
  AI_KEY_MISSING,
  CRON_SECRET_TOO_SHORT,
  DATABASE_CONNECTION_FAILED,
  DATABASE_VALIDATION_FAILED,
  INVALID_CONFIGURATION,
} from "../shared/errorMessages";

export const runValidations = async (): Promise<void> => {
  const allErrors: string[] = [];
  const configErrors = validateConfiguration();
  if (configErrors?.length > 0) {
    allErrors.push(
      INVALID_CONFIGURATION,
      ...configErrors.map((configPath) => `   - ${configPath}`),
      CHECK_ENVIRONMENT_VARIABLES,
    );
  } else {
    const connectionError = await validateDatabaseConnection();
    if (connectionError) {
      allErrors.push(
        DATABASE_VALIDATION_FAILED,
        `   - ${connectionError}`,
        CHECK_DATABASE_CONNECTION,
      );
    }
  }
  if (allErrors.length > 0) {
    throw new Error(allErrors.join("\n"));
  }
  console.log(ALL_CONFIG_VALUES_SET);
  console.log(DATABASE_CONNECTED);
};

export const validateConfiguration = (): string[] => {
  const errors: string[] = [];
  const checkValue = (configPart: object, parentPath: string) => {
    for (const [key, value] of Object.entries(configPart)) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      if (value === undefined || value === null || value === "") {
        errors.push(currentPath);
      } else if (typeof value === "number" && isNaN(value)) {
        errors.push(`${currentPath} (NaN)`);
      } else if (typeof value === "object" && !Array.isArray(value)) {
        checkValue(value as object, currentPath);
      }
    }
  };
  const { ai, ...configToCheck } = config;
  checkValue(configToCheck, "config");
  if (config.cronSecret && config.cronSecret.length < CRON_SECRET_MIN_LENGTH) {
    errors.push(`config.cronSecret ${CRON_SECRET_TOO_SHORT}`);
  }
  if (ai.summaryEnabled && !ai.anthropicApiKey) {
    errors.push(`config.ai.anthropicApiKey ${AI_KEY_MISSING}`);
  }
  return errors;
};

export const validateDatabaseConnection = async (): Promise<string | undefined> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return undefined;
  } catch (error) {
    return (error as IThrownError)?.message?.trim() || DATABASE_CONNECTION_FAILED;
  }
};
