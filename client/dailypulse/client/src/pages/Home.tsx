import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { api, useAsync } from "../api";
import {
  ArticleCard,
  CardSkeletons,
  Notice,
  Skeleton,
  rise,
  stagger,
} from "../components/ui";
import { catName, fmtDateTime, timeAgo } from "../utils";

const viewport = { once: true, margin: "-60px" };

export default function Home() {
  const today = useAsync(api.today, []);
  const latest = useAsync(() => api.articles("limit=16"), []);
  const cats = useAsync(api.categories, []);

  const hero = today.data?.items[0] ?? latest.data?.items[0];
  const todayRest = (today.data?.items ?? [])
    .filter((a) => a.id !== hero?.id)
    .slice(0, 6);
  const shown = new Set([hero?.id, ...todayRest.map((a) => a.id)]);
  const more = (latest.data?.items ?? []).filter((a) => !shown.has(a.id));
  const side = (todayRest.length ? todayRest : more).slice(0, 3);
  const grid = more.filter((a) => !side.some((s) => s.id === a.id)).slice(0, 6);

  if (latest.error)
    return (
      <Notice title="News could not be loaded">
        {latest.error} Check that the backend is running on port 5000.
      </Notice>
    );

  return (
    <div className="space-y-14">
      {latest.loading ? (
        <Skeleton className="h-80 w-full" />
      ) : !hero ? (
        <Notice title="No stories yet">
          Run npm run ingest in the server folder to fetch the first batch of
          news.
        </Notice>
      ) : (
        <section className="relative overflow-hidden rounded-3xl bg-navy text-white">
          <div
            aria-hidden
            className="orb absolute -left-24 -top-24 h-96 w-96 rounded-full bg-electric/40 blur-3xl"
          />
          <div
            aria-hidden
            className="orb-slow absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal/30 blur-3xl"
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative grid gap-8 p-8 md:p-12 lg:grid-cols-[1.6fr_1fr]"
          >
            <div>
              <motion.div
                variants={rise}
                className="flex flex-wrap items-center gap-3 text-sm"
              >
                <Link
                  to={`/category/${hero.category}`}
                  className="rounded-full bg-white/10 px-3 py-1 backdrop-blur hover:bg-white/20"
                >
                  {catName(hero.category)}
                </Link>
                <span className="text-white/70">
                  {fmtDateTime(hero.publishedAt)}
                </span>
              </motion.div>
              <motion.h1
                variants={rise}
                className="mt-5 line-clamp-4 font-serif text-3xl font-bold leading-tight md:text-5xl"
              >
                <Link
                  to={`/article/${hero.id}`}
                  className="hover:text-teal-soft"
                >
                  {hero.title}
                </Link>
              </motion.h1>
              {hero.snippet && (
                <motion.p
                  variants={rise}
                  className="mt-4 line-clamp-3 max-w-2xl text-white/80"
                >
                  {hero.snippet}
                </motion.p>
              )}
              <motion.div
                variants={rise}
                className="mt-7 flex flex-wrap items-center gap-4 text-sm"
              >
                <Link
                  to={`/article/${hero.id}`}
                  className="rounded-full bg-electric px-5 py-2.5 font-medium transition hover:bg-blue-500"
                >
                  Read the details
                </Link>
                <a
                  href={hero.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white/80 hover:text-white"
                >
                  Original from {hero.sourceName}{" "}
                  <ArrowUpRight size={14} aria-hidden />
                </a>
              </motion.div>
            </div>
            {side.length > 0 && (
              <motion.aside
                variants={rise}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <h2 className="mb-3 font-serif text-lg font-bold">
                  Also making news
                </h2>
                <ul className="space-y-4">
                  {side.map((a) => (
                    <li key={a.id}>
                      <Link
                        to={`/article/${a.id}`}
                        className="line-clamp-2 text-sm font-medium leading-snug hover:text-teal-soft"
                      >
                        {a.title}
                      </Link>
                      <p className="mt-1 text-xs text-white/60">
                        {a.sourceName}, {timeAgo(a.publishedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.aside>
            )}
          </motion.div>
        </section>
      )}

      <section aria-labelledby="today-h">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewport}
          className="mb-4 flex items-baseline justify-between"
        >
          <h2
            id="today-h"
            className="font-serif text-2xl font-bold text-navy dark:text-white"
          >
            Published today
          </h2>
          <Link
            to="/search?range=today"
            className="text-sm text-electric hover:underline dark:text-blue-300"
          >
            See all of today
          </Link>
        </motion.div>
        {today.loading ? (
          <CardSkeletons n={3} />
        ) : todayRest.length ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {todayRest.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </motion.div>
        ) : (
          <Notice title="No other stories published today yet">
            New items appear here as sources publish them. The latest stories
            are below.
          </Notice>
        )}
      </section>

      <section aria-labelledby="latest-h">
        <motion.h2
          id="latest-h"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewport}
          className="mb-4 font-serif text-2xl font-bold text-navy dark:text-white"
        >
          Latest stories
        </motion.h2>
        {latest.loading ? (
          <CardSkeletons />
        ) : grid.length ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {grid.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </motion.div>
        ) : (
          <Notice title="That is everything for now">
            There are no further saved stories.
          </Notice>
        )}
      </section>

      <section aria-labelledby="cat-h">
        <h2
          id="cat-h"
          className="mb-4 font-serif text-2xl font-bold text-navy dark:text-white"
        >
          Browse by topic
        </h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="flex flex-wrap gap-2"
        >
          {cats.data?.map((c) => (
            <motion.div key={c.slug} variants={rise}>
              <Link
                to={`/category/${c.slug}`}
                className="block rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm transition hover:-translate-y-0.5 hover:border-electric hover:text-electric dark:border-charcoal-line dark:bg-charcoal-card dark:hover:text-blue-300"
              >
                {c.name}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
