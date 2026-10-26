import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const COOKIE = "dp_token";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export const signToken = (id: string) =>
  jwt.sign({ sub: id }, env.JWT_SECRET, { expiresIn: "7d" });

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 3600 * 1000,
    path: "/",
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: "Please log in." });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub?: string };
    if (!payload.sub) throw new Error("bad token");
    req.userId = payload.sub;
    next();
  } catch {
    res
      .status(401)
      .json({ error: "Your session has expired. Please log in again." });
  }
}

/** CSRF defence for cookie auth: state-changing requests must come from our own site (SameSite=Lax cookie plus this check). */
export function originGuard(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && origin !== env.CLIENT_URL)
    return res.status(403).json({ error: "Request blocked." });
  next();
}
