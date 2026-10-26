# DailyPulse — Stay Informed. Stay Ahead.

Status: **Phase 1 complete** (server foundation + automated ingestion). See "Roadmap".

## Run locally
```bash
cd server
cp ../.env.example .env      # set MONGODB_URI (local Mongo or Atlas) and optionally NEWSAPI_KEY
npm install
npm run ingest               # one-off ingestion (needs RSS_FEEDS and/or NEWSAPI_KEY)
npm run dev                  # API on :5000 with the scheduler running
npm test                     # unit tests (no database required)
```

## How automatic updates work
`node-cron` runs inside the server (timezone `Asia/Kolkata`): `DAILY_CRON` (default 06:00) and an optional `BREAKING_CRON` (every 30 min).
A MongoDB lock (`JobLock`) prevents overlapping/duplicate runs. On boot, a catch-up run executes (useful on hosts that sleep).
**Hosting note:** the scheduler needs an always-on process. On Render's free tier the service sleeps; use a paid instance, or ping the service with an external cron service.

## API (so far)
| Endpoint | Purpose |
|---|---|
| `GET /api/articles?page&limit&category&q&range=today\|yesterday\|week\|month&sort=latest\|popular` | Paginated list + text search |
| `GET /api/articles/today` | Published today (IST), by publication date |
| `GET /api/articles/:id` | Single article |
| `GET /api/categories` | The 20 categories |
| `GET /api/status` | Last successful update + `stale` flag |

## Sources & keys
- **NewsAPI.org** — https://newsapi.org (free plan is development-only; production needs a paid plan).
- **RSS** — set `RSS_FEEDS`. Defaults point to PIB and RBI feeds; verify each URL and its terms of use before relying on them.

## Roadmap
1. ✅ Server, models, ingestion, dedupe, scheduler, read API, tests
2. Auth (JWT cookies, bcrypt, CSRF), bookmarks, admin routes + manual refresh
3. React/Vite/Tailwind UI (homepage, category/article pages, dark mode)
4. Quiz + exam prep  5. AI features + Bengali  6. Notifications, analytics, SEO, deployment
