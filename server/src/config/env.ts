import dotenv from "dotenv";
dotenv.config({ override: true });
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  ENABLE_SCHEDULER: z.enum(["true", "false"]).default("true"),
  ENABLE_BREAKING_REFRESH: z.enum(["true", "false"]).default("true"),
  TIMEZONE: z.string().default("Asia/Kolkata"),
  DAILY_CRON: z.string().default("0 6 * * *"),
  BREAKING_CRON: z.string().default("*/30 * * * *"),
  NEWSAPI_KEY: z.string().optional(),
  RSS_FEEDS: z.string().default(""),
});

export const env = schema.parse(process.env);
