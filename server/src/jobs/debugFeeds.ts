import "dotenv/config";
import Parser from "rss-parser";
import { parseFeedConfig } from "../utils/feeds";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "DailyPulseBot/0.1" },
});

(async () => {
  for (const f of parseFeedConfig(process.env.RSS_FEEDS ?? "")) {
    try {
      const r = await parser.parseURL(f.url);
      const noDate = r.items.filter((i) => !i.isoDate).length;
      console.log(
        `${f.name}: ${r.items.length} items, ${noDate} without a readable date`,
      );
      r.items
        .slice(0, 2)
        .forEach((i) =>
          console.log(
            "  ",
            i.title,
            "| pubDate:",
            i.pubDate,
            "| iso:",
            i.isoDate,
          ),
        );
    } catch (e) {
      console.log(`${f.name}: ERROR`, (e as Error).message);
    }
  }
})();
