import prisma from "../../pgConfig";
import { handleErrorsAxios, logErrorLocation } from "../../library/utils";
import { ONE_DAY_IN_MILLISECONDS } from "../../shared/constants";

export async function deleteChecksOlderThan(days: number): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - days * ONE_DAY_IN_MILLISECONDS);
    const result = await prisma.check.deleteMany({ where: { checked_at: { lt: cutoff } } });
    return result.count;
  } catch (error) {
    logErrorLocation(
      "deleteCalls.ts",
      "deleteChecksOlderThan",
      error,
      "Error while deleting old checks",
      "",
      { days },
    );
    return handleErrorsAxios(error, {});
  }
}

export async function deleteHourlyRowsOlderThan(days: number): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - days * ONE_DAY_IN_MILLISECONDS);
    const result = await prisma.checkHourly.deleteMany({ where: { hour_start: { lt: cutoff } } });
    return result.count;
  } catch (error) {
    logErrorLocation(
      "deleteCalls.ts",
      "deleteHourlyRowsOlderThan",
      error,
      "Error while deleting old hourly rows",
      "",
      { days },
    );
    return handleErrorsAxios(error, {});
  }
}
