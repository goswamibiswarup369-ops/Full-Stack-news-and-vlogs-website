import Parser from 'rss-parser';
import { env } from '../../config/env';
import { NewsProvider, RawArticle } from './types';
import { FeedConfig, parseFeedConfig } from '../../utils/feeds';

const parser = new Parser({ timeout: 15_000, headers: { 'User-Agent': 'DailyPulseBot/0.1 (+contact: set-your-site-url)' } });

export class RssProvider implements NewsProvider {
  name = 'rss';
  constructor(private feeds: FeedConfig[] = parseFeedConfig(env.RSS_FEEDS)) {}
  isConfigured() { return this.feeds.length > 0; }

  async fetch(): Promise<RawArticle[]> {
    const out: RawArticle[] = [];
    const errors: string[] = [];
    for (const feed of this.feeds) {
      try {
        const res = await parser.parseURL(feed.url);
        for (const item of res.items) {
          if (!item.title || !item.link) continue;
          const date = item.isoDate ? new Date(item.isoDate) : null;
          if (!date || isNaN(date.getTime())) continue; // never guess a publication date
          out.push({
            provider: 'rss', providerId: item.guid, sourceName: feed.name, title: item.title,
            url: item.link, snippet: (item.contentSnippet ?? '').slice(0, 500),
            imageUrl: item.enclosure?.url, publishedAt: date, categoryHint: feed.category,
          });
        }
      } catch (e) {
        errors.push(`${feed.name}: ${(e as Error).message}`);
      }
    }

     if (errors.length)
          console.warn("[rss] feed errors:", errors.join("; "));
    if (!out.length && errors.length) throw new Error(errors.join('; '));
    return out;
  }
}
