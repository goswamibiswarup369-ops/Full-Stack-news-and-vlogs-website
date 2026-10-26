import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { articlesRouter } from "./routes/articles";
import { authRouter } from "./routes/auth";
import { originGuard } from "./middleware/auth";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(originGuard);
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.get("/", (_req, res) =>
    res.json({
      name: "DailyPulse API",
      endpoints: [
        "/health",
        "/api/articles",
        "/api/articles/today",
        "/api/status",
        "/api/categories",
        "/api/auth/me",
      ],
    }),
  );
  app.use("/api/auth", authRouter);
  app.use("/api", articlesRouter);

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" }); // safe message, details only in logs
  });
  return app;
}
