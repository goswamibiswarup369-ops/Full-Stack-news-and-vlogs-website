import { FormEvent, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AlertTriangle,
  LogOut,
  Moon,
  Newspaper,
  Search,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";
import { api, Article, Category, Status } from "../api";
import { useAuth } from "../auth";
import { fmtDateTime } from "../utils";

function initialDark() {
  try {
    const t = localStorage.getItem("theme");
    return t
      ? t === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export default function Layout() {
  const [dark, setDark] = useState(initialDark);
  const [cats, setCats] = useState<Category[]>([]);
  const [ticker, setTicker] = useState<Article[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  }, [dark]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    api
      .categories()
      .then(setCats)
      .catch(() => undefined);
    api
      .articles("limit=10")
      .then((r) => setTicker(r.items))
      .catch(() => undefined);
    api
      .status()
      .then(setStatus)
      .catch(() =>
        setStatus({
          lastSuccessfulUpdate: null,
          stale: true,
          message:
            "Cannot reach the news server. Start the backend (npm run dev in the server folder).",
        }),
      );
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {status?.stale && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900"
        >
          <AlertTriangle size={16} aria-hidden />
          <span>
            {status.message}
            {status.lastSuccessfulUpdate &&
              ` Last successful update: ${fmtDateTime(status.lastSuccessfulUpdate)}.`}
          </span>
        </div>
      )}
      <header
        className={`sticky top-0 z-20 bg-navy/95 text-white backdrop-blur transition-shadow ${scrolled ? "shadow-lg shadow-navy/30" : ""}`}
      >
        {ticker.length > 0 && (
          <div className="flex items-center border-b border-white/10 text-sm">
            <span className="z-10 shrink-0 bg-teal px-3 py-1.5 font-medium">
              Latest
            </span>
            <div className="relative flex-1 overflow-hidden">
              <div className="marquee flex w-max gap-12 py-1.5 pl-6">
                {[...ticker, ...ticker].map((a, i) => (
                  <Link
                    key={i}
                    to={`/article/${a.id}`}
                    className="whitespace-nowrap text-white/90 hover:text-teal-soft"
                  >
                    {a.title.slice(0, 110)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-xl font-bold"
          >
            <Newspaper size={22} className="text-teal-soft" aria-hidden />{" "}
            DailyPulse
          </Link>
          <form
            onSubmit={onSearch}
            role="search"
            className="ml-auto hidden max-w-xs flex-1 items-center rounded-full bg-white/10 px-3 transition focus-within:bg-white/20 sm:flex"
          >
            <Search size={16} aria-hidden className="text-white/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search news"
              placeholder="Search headlines"
              className="w-full bg-transparent px-2 py-2 text-sm placeholder:text-white/60 focus:outline-none"
            />
          </form>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-auto rounded-full p-2 hover:bg-white/10 sm:ml-0"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-electric text-sm font-semibold"
                title={user.email}
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
              <button
                onClick={() => {
                  void logout();
                }}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm hover:bg-white/10"
              >
                <LogOut size={15} aria-hidden />
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/login"
                className="rounded-full px-3 py-1.5 hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-electric px-4 py-1.5 font-medium hover:bg-blue-500"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
        <nav aria-label="Categories" className="border-t border-white/10">
          <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 text-sm">
            {cats.map((c) => (
              <li key={c.slug} className="shrink-0">
                <NavLink
                  to={`/category/${c.slug}`}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1 transition hover:bg-white/10 ${isActive ? "bg-electric text-white" : "text-white/80"}`
                  }
                >
                  {c.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <motion.div
          key={loc.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-600 dark:border-charcoal-line dark:bg-charcoal-card dark:text-slate-400">
        <div className="mx-auto max-w-6xl space-y-1 px-4">
          <p className="font-serif text-base font-bold text-navy dark:text-white">
            DailyPulse. Stay Informed. Stay Ahead.
          </p>
          <p>
            Headlines come from the original publishers and official sources.
            Every story links back to its source.
          </p>
          {status && !status.stale && status.lastSuccessfulUpdate && (
            <p>News last updated {fmtDateTime(status.lastSuccessfulUpdate)}.</p>
          )}
        </div>
      </footer>
    </div>
  );
}
