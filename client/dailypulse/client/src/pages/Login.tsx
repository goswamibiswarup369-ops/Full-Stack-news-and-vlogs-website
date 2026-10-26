import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Newspaper } from "lucide-react";
import { useAuth } from "../auth";

const points = [
  "News refreshed automatically every day",
  "Real publication times, never relabelled as today",
  "Every story links to its original source",
];

export default function Login({ mode }: { mode: "login" | "register" }) {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const isReg = mode === "register";

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (isReg && name.trim().length < 2)
      return setErr("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setErr("Enter a valid email address.");
    if (isReg && pw.length < 8)
      return setErr("Password must be at least 8 characters.");
    setBusy(true);
    try {
      if (isReg) await register(name.trim(), email, pw);
      else await login(email, pw);
      nav("/");
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const input =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 transition focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/30 dark:border-charcoal-line dark:bg-charcoal-card dark:text-white";

  return (
    <div className="grid min-h-screen bg-paper dark:bg-charcoal md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-navy p-12 text-white md:flex md:flex-col md:justify-between">
        <div
          aria-hidden
          className="orb absolute -left-20 top-10 h-96 w-96 rounded-full bg-electric/40 blur-3xl"
        />
        <div
          aria-hidden
          className="orb-slow absolute -bottom-24 -right-10 h-96 w-96 rounded-full bg-teal/30 blur-3xl"
        />
        <Link
          to="/"
          className="relative flex items-center gap-2 font-serif text-2xl font-bold"
        >
          <Newspaper className="text-teal-soft" aria-hidden /> DailyPulse
        </Link>
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-5xl font-bold leading-tight"
          >
            Stay Informed.
            <br />
            Stay Ahead.
          </motion.h1>
          <ul className="mt-8 space-y-3 text-white/80">
            {points.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <span
                  className="h-2 w-2 rounded-full bg-teal-soft"
                  aria-hidden
                />
                {p}
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/50">
          Current affairs for students, aspirants and curious readers.
        </p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <motion.form
          onSubmit={submit}
          noValidate
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link
            to="/"
            className="mb-8 flex items-center gap-2 font-serif text-xl font-bold text-navy dark:text-white md:hidden"
          >
            <Newspaper size={20} aria-hidden /> DailyPulse
          </Link>
          <h2 className="font-serif text-3xl font-bold text-navy dark:text-white">
            {isReg ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isReg ? "It takes less than a minute." : "Log in to continue."}
          </p>

          {isReg && (
            <label className="mt-6 block text-sm font-medium">
              Name
              <input
                className={input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}
          <label
            className={`${isReg ? "mt-4" : "mt-6"} block text-sm font-medium`}
          >
            Email
            <input
              className={input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <span className="relative block">
              <input
                className={`${input} pr-10`}
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete={isReg ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {isReg && (
            <p className="mt-1 text-xs text-slate-500">
              At least 8 characters.
            </p>
          )}

          {err && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-electric px-4 py-2.5 font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {isReg ? "Create account" : "Log in"}
          </button>
          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
            {isReg ? "Already have an account?" : "New to DailyPulse?"}{" "}
            <Link
              to={isReg ? "/login" : "/register"}
              className="font-medium text-electric hover:underline dark:text-blue-300"
            >
              {isReg ? "Log in" : "Create an account"}
            </Link>
          </p>
        </motion.form>
      </main>
    </div>
  );
}
