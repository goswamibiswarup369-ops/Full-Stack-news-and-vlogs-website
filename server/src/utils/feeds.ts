export interface FeedConfig { name: string; url: string; category: string }

export function parseFeedConfig(raw: string): FeedConfig[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean).map((entry) => {
    const [name, url, category] = entry.split('|').map((x) => x?.trim());
    return { name, url, category: category || 'national-affairs' };
  }).filter((f) => f.name && /^https?:\/\//.test(f.url));
}

