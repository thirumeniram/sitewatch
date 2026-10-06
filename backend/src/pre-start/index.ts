import { runValidations } from "../config/validation";
import { VALIDATION_PASSED, VALIDATION_STARTED } from "../shared/constants";

async function runValidation() {
  console.log(VALIDATION_STARTED);
  await runValidations();
  console.log(VALIDATION_PASSED);
}

export const startupValidation = runValidation();
