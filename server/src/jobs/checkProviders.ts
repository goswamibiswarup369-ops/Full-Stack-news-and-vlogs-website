import { RssProvider } from "../services/providers/rss";
import { NewsApiProvider } from "../services/providers/newsapi";

(async () => {
  for (const p of [new RssProvider(), new NewsApiProvider()]) {
    if (!p.isConfigured()) {
      console.log(p.name, "not configured");
      continue;
    }
    try {
      const items = await p.fetch();
      const bySource: Record<string, number> = {};
      items.forEach((i) => {
        bySource[i.sourceName] = (bySource[i.sourceName] || 0) + 1;
      });
      console.log(p.name, items.length, bySource);
    } catch (e) {
      console.log(p.name, "ERROR:", (e as Error).message);
    }
  }
})();
