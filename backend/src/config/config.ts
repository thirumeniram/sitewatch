import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(__dirname, "../pre-start/env/development.env"),
});

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8080),
  payloadSizeLimit: Number(process.env.PAYLOAD_SIZE_LIMIT || 1),
  database: {
    url: process.env.DATABASE_URL,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  },
  cronSecret: process.env.CRON_SECRET,
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    alertSender: process.env.ALERT_SENDER_EMAIL,
  },
  ai: {
    summaryEnabled: process.env.AI_SUMMARY_ENABLED === "true",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  },
};
