import { cleanText } from "../utils/text";
import { Article } from "../models/Article";
import { IngestionLog } from "../models/IngestionLog";
import { classify } from "../config/categories";
import { canonicalizeUrl, isSimilarTitle, titleKey } from "../utils/dedupe";
import { withRetry } from "../utils/retry";
import { acquireLock, releaseLock } from "./lock";
import { NewsProvider, RawArticle } from "./providers/types";
import { RssProvider } from "./providers/rss";
import { NewsApiProvider } from "./providers/newsapi";

export type Trigger = "daily" | "breaking" | "manual" | "cli";
export interface IngestionResult {
  skipped?: boolean;
  fetched: number;
  inserted: number;
  duplicates: number;
  errors: { provider: string; message: string }[];
}

const LOCK = "news-ingestion";
const MAX_AGE_DAYS = 7;

export function defaultProviders(): NewsProvider[] {
  return [new RssProvider(), new NewsApiProvider()].filter((p) =>
    p.isConfigured(),
  );
}

export async function runIngestion(
  trigger: Trigger,
  providers: NewsProvider[] = defaultProviders(),
): Promise<IngestionResult> {
  if (!(await acquireLock(LOCK, 15 * 60))) {
    console.log("[ingest] another run holds the lock; skipping");
    return {
      skipped: true,
      fetched: 0,
      inserted: 0,
      duplicates: 0,
      errors: [],
    };
  }
  const log = await IngestionLog.create({
    trigger,
    status: "running",
    startedAt: new Date(),
  });
  const result: IngestionResult = {
    fetched: 0,
    inserted: 0,
    duplicates: 0,
    errors: [],
  };

  try {
    const raws: RawArticle[] = [];
    for (const p of providers) {
      try {
        raws.push(...(await withRetry(() => p.fetch())));
      } catch (e) {
        result.errors.push({ provider: p.name, message: (e as Error).message });
        console.error(
          `[ingest] provider ${p.name} failed:`,
          (e as Error).message,
        );
      }
    }
    result.fetched = raws.length;

    const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 3600 * 1000);
    const recent = await Article.find(
      { publishedAt: { $gte: cutoff } },
      { title: 1 },
    ).lean();
    const seenTitles = recent.map((r) => r.title);

    for (const raw of raws) {
      if (
        raw.publishedAt < cutoff ||
        raw.publishedAt > new Date(Date.now() + 3600 * 1000)
      )
        continue;
      const canonicalUrl = canonicalizeUrl(raw.url);
      const now = new Date();

      const existing = await Article.findOneAndUpdate(
        { canonicalUrl },
        { $set: { lastCheckedAt: now } },
      );
      if (existing || seenTitles.some((t) => isSimilarTitle(t, raw.title))) {
        result.duplicates++;
        continue;
      }

      try {
        await Article.create({
          title: cleanText(raw.title, 500) ?? raw.title,
          url: raw.url,
          canonicalUrl,
          providerId: raw.providerId,
          provider: raw.provider,
          sourceName: raw.sourceName,
          category: classify(
            `${raw.title} ${raw.snippet ?? ""}`,
            raw.categoryHint,
          ),
          sourceSnippet: cleanText(raw.snippet),
          imageUrl: raw.imageUrl,
          language: raw.language ?? "en",
          publishedAt: raw.publishedAt,
          firstSeenAt: now,
          lastCheckedAt: now,
          titleKey: titleKey(raw.title),
        });
        seenTitles.push(raw.title);
        result.inserted++;
      } catch (e) {
        if ((e as { code?: number }).code === 11000) result.duplicates++;
        else
          result.errors.push({
            provider: raw.provider,
            message: (e as Error).message,
          });
      }
    }

    const status =
      !providers.length || (result.errors.length && !result.fetched)
        ? "failed"
        : result.errors.length
          ? "partial"
          : "success";
    await IngestionLog.updateOne(
      { _id: log._id },
      { status, finishedAt: new Date(), ...result },
    );
    console.log(
      `[ingest] ${status}: fetched=${result.fetched} inserted=${result.inserted} dup=${result.duplicates}`,
    );
    return result;
  } catch (e) {
    await IngestionLog.updateOne(
      { _id: log._id },
      {
        status: "failed",
        finishedAt: new Date(),
        errors: [{ provider: "pipeline", message: (e as Error).message }],
      },
    );
    throw e;
  } finally {
    await releaseLock(LOCK);
  }
}
