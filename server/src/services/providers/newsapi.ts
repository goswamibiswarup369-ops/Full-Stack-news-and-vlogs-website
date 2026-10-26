import { env } from "../../config/env";
import { NewsProvider, RawArticle } from "./types";

interface NewsApiResponse {
  status: string;
  message?: string;
  articles?: {
    source: { name: string };
    title: string | null;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string | null;
  }[];
}

export class NewsApiProvider implements NewsProvider {
  name = "newsapi";
  isConfigured() {
    return !!env.NEWSAPI_KEY;
  }

  private async call(
    endpoint: string,
    params: Record<string, string>,
  ): Promise<RawArticle[]> {
    const url = new URL(`https://newsapi.org/v2/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url, {
      headers: { "X-Api-Key": env.NEWSAPI_KEY! },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`);
    const data = (await res.json()) as NewsApiResponse;
    if (data.status !== "ok")
      throw new Error(`NewsAPI: ${data.message ?? "unknown error"}`);
    const out: RawArticle[] = [];
    for (const a of data.articles ?? []) {
      if (!a.title || !a.url || !a.publishedAt || a.title === "[Removed]")
        continue;
      out.push({
        provider: "newsapi",
        sourceName: a.source.name,
        title: a.title,
        url: a.url,
        snippet: a.description?.slice(0, 500) ?? undefined,
        imageUrl: a.urlToImage ?? undefined,
        publishedAt: new Date(a.publishedAt),
      });
    }
    return out;
  }

  async fetch(): Promise<RawArticle[]> {
    const items = await this.call("top-headlines", {
      country: "in",
      pageSize: "50",
    });
    if (items.length) return items;

    console.log(
      "[newsapi] top-headlines returned 0 items; querying each publisher separately",
    );
    const DOMAINS = [
      "thehindu.com",
      "indianexpress.com",
      "ndtv.com",
      "hindustantimes.com",
      "livemint.com",
      "business-standard.com",
    ];
    for (const d of DOMAINS) {
      try {
        items.push(
          ...(await this.call("everything", {
            domains: d,
            language: "en",
            sortBy: "publishedAt",
            pageSize: "10",
          })),
        );
      } catch (e) {
        console.warn(`[newsapi] ${d} failed: ${(e as Error).message}`);
      }
    }
    return items;
  }
}
