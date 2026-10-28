import { Resend } from "resend";
import { config } from "../../config/config";

export function createResendClient(): Resend {
  return new Resend(`${config.email.resendApiKey}`);
}
