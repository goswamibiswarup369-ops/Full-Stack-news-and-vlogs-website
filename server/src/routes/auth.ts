import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { User } from "../models/User";
import {
  COOKIE,
  requireAuth,
  setAuthCookie,
  signToken,
} from "../middleware/auth";
import { env } from "../config/env";

export const authRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});
const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

const DUMMY_HASH = bcrypt.hashSync("dailypulse-dummy-password", 12); // keeps login timing similar for unknown emails
const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254);
const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long (72 characters maximum)."),
});
const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(72),
});

const pub = (u: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
}) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role });

authRouter.post(
  "/register",
  limiter,
  wrap(async (req, res) => {
    const p = registerSchema.safeParse(req.body);
    if (!p.success)
      return res.status(400).json({ error: p.error.issues[0].message });
    if (await User.exists({ email: p.data.email }))
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    try {
      const user = await User.create({
        name: p.data.name,
        email: p.data.email,
        passwordHash: await bcrypt.hash(p.data.password, 12),
      });
      setAuthCookie(res, signToken(String(user._id)));
      res.status(201).json({ user: pub(user) });
    } catch (e) {
      if ((e as { code?: number }).code === 11000)
        return res
          .status(409)
          .json({ error: "An account with this email already exists." });
      throw e;
    }
  }),
);

authRouter.post(
  "/login",
  limiter,
  wrap(async (req, res) => {
    const p = loginSchema.safeParse(req.body);
    if (!p.success)
      return res.status(400).json({ error: p.error.issues[0].message });
    const user = await User.findOne({ email: p.data.email }).select(
      "+passwordHash",
    );
    const ok = await bcrypt.compare(
      p.data.password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !ok)
      return res.status(401).json({ error: "Incorrect email or password." });
    setAuthCookie(res, signToken(String(user._id)));
    res.json({ user: pub(user) });
  }),
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ ok: true });
});

authRouter.get(
  "/me",
  requireAuth,
  wrap(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: "Please log in." });
    res.json({ user: pub(user) });
  }),
);
