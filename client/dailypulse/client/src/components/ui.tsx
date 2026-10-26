import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Article } from "../api";
import { catName, fmtDateTime, timeAgo } from "../utils";

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
export const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-charcoal-line ${className}`}
    />
  );
}

export function CardSkeletons({ n = 6 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }, (_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-xl border border-slate-200 p-5 dark:border-charcoal-line"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function Notice({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-charcoal-line">
      <p className="font-serif text-lg font-bold text-navy dark:text-white">
        {title}
      </p>
      {children && (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          {children}
        </p>
      )}
    </div>
  );
}

/** Teal dot = published within the last 36 hours. Grey dot = older story still on the list. */
export function Freshness({ a }: { a: Article }) {
  const isNew = a.freshness === "new";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
      title={fmtDateTime(a.publishedAt)}
    >
      <span
        className={`h-2 w-2 rounded-full ${isNew ? "bg-teal" : "bg-slate-400"}`}
        aria-hidden
      />
      <span>
        {isNew
          ? timeAgo(a.publishedAt)
          : `Older story, ${timeAgo(a.publishedAt)}`}
      </span>
    </span>
  );
}

export function ArticleCard({ a }: { a: Article }) {
  return (
    <motion.article
      variants={rise}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-electric/60 dark:border-charcoal-line dark:bg-charcoal-card"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-electric to-teal transition-transform duration-300 group-hover:scale-x-100"
      />
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          to={`/category/${a.category}`}
          className="rounded-full bg-electric/10 px-2.5 py-0.5 text-xs font-medium text-electric hover:bg-electric/20 dark:text-blue-300"
        >
          {catName(a.category)}
        </Link>
        <Freshness a={a} />
      </div>
      <h3 className="font-serif text-lg font-bold leading-snug text-navy dark:text-white">
        <Link
          to={`/article/${a.id}`}
          className="hover:text-electric dark:hover:text-blue-300"
        >
          {a.title}
        </Link>
      </h3>
      {a.snippet && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {a.snippet}
        </p>
      )}
      <p className="mt-auto pt-4 text-xs text-slate-500 dark:text-slate-400">
        Source: {a.sourceName}
      </p>
    </motion.article>
  );
}
