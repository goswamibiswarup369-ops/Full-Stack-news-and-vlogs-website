export interface CategoryDef { slug: string; name: string; keywords: string[] }

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "national-affairs",
    name: "National Affairs",
    keywords: ["lok sabha", "rajya sabha", "supreme court", "union cabinet"],
  },
  {
    slug: "international-affairs",
    name: "International Affairs",
    keywords: [
      "united nations",
      "un ",
      "g20",
      "brics",
      "foreign minister",
      "bilateral",
    ],
  },
  {
    slug: "politics-government",
    name: "Politics and Government",
    keywords: [
      "election",
      "parliament",
      "chief minister",
      "bill passed",
      "ordinance",
    ],
  },
  {
    slug: "economy-banking",
    name: "Economy and Banking",
    keywords: [
      "rbi",
      "reserve bank",
      "repo rate",
      "gdp",
      "inflation",
      "bank",
      "sebi",
      "budget",
      "monetary policy",
      "auction",
      "government security",
      "government stock",
      "money market",
      "balance of payments",
    ],
  },
  {
    slug: "science-technology",
    name: "Science and Technology",
    keywords: [
      "research",
      "scientists",
      "technology",
      "semiconductor",
      "quantum",
    ],
  },
  {
    slug: "ai-innovation",
    name: "Artificial Intelligence and Innovation",
    keywords: [
      "artificial intelligence",
      " ai ",
      "machine learning",
      "startup",
      "chatbot",
    ],
  },
  {
    slug: "space-isro",
    name: "Space and ISRO",
    keywords: [
      "isro",
      "satellite",
      "rocket",
      "chandrayaan",
      "gaganyaan",
      "nasa",
      "launch vehicle",
    ],
  },
  {
    slug: "environment-climate",
    name: "Environment and Climate",
    keywords: [
      "climate",
      "emission",
      "pollution",
      "wildlife",
      "cop",
      "forest",
      "biodiversity",
    ],
  },
  {
    slug: "defence-security",
    name: "Defence and Security",
    keywords: [
      "army",
      "navy",
      "air force",
      "defence",
      "missile",
      "drdo",
      "border",
    ],
  },
  {
    slug: "sports",
    name: "Sports",
    keywords: [
      "cricket",
      "olympic",
      "fifa",
      "tournament",
      "medal",
      "bcci",
      "tennis",
      "hockey",
    ],
  },
  {
    slug: "awards-honours",
    name: "Awards and Honours",
    keywords: ["award", "padma", "nobel", "bharat ratna", "honoured", "prize"],
  },
  {
    slug: "appointments",
    name: "Important Appointments",
    keywords: [
      "appointed",
      "takes charge",
      "new chairman",
      "named as",
      "assumes office",
    ],
  },
  {
    slug: "government-schemes",
    name: "Government Schemes",
    keywords: ["scheme", "yojana", "mission", "pm-", "subsidy", "launched by"],
  },
  {
    slug: "summits-conferences",
    name: "Summits and Conferences",
    keywords: ["summit", "conference", "forum", "dialogue", "expo"],
  },
  {
    slug: "important-days",
    name: "Important Days",
    keywords: [
      "world day",
      "international day",
      "observed on",
      "awareness day",
      "diwas",
    ],
  },
  {
    slug: "business-industry",
    name: "Business and Industry",
    keywords: [
      "company",
      "merger",
      "acquisition",
      "ipo",
      "shares",
      "industry",
      "exports",
    ],
  },
  {
    slug: "education-employment",
    name: "Education and Employment",
    keywords: [
      "exam",
      "university",
      "recruitment",
      "jobs",
      "nep",
      "students",
      "unemployment",
    ],
  },
  {
    slug: "reports-indexes",
    name: "Reports and Indexes",
    keywords: ["index", "ranking", "report released", "ranked", "survey"],
  },
  {
    slug: "books-authors",
    name: "Books and Authors",
    keywords: ["book", "author", "novel", "literary", "autobiography"],
  },
  {
    slug: "west-bengal",
    name: "West Bengal Current Affairs",
    keywords: ["west bengal", "kolkata", "bengal", "wbcs", "mamata"],
  },
];

/** Rule-based fallback classifier. The AI phase will refine this; this never invents data. */
export function classify(text: string, hint?: string): string {
  const hay = ` ${text.toLowerCase()} `;
  let best = hint ?? 'national-affairs';
  let bestScore = 0;
  for (const c of CATEGORIES) {
    const score = c.keywords.reduce((n, k) => n + (hay.includes(k) ? 1 : 0), 0);
    if (score > bestScore) { best = c.slug; bestScore = score; }
  }
  return best;
}
