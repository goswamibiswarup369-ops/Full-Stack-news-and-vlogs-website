DailyPulse
Stay Informed. Stay Ahead.
I built DailyPulse to bring news into one place with a clean browsing experience, category-based discovery, and automated article updates. This repository contains the React frontend and the Express backend, backed by MongoDB.

Live Demo
Website: https://full-stack-news-and-vlogs-website.vercel.app/

Backend API: https://dailypulse-api.onrender.com

Update Status: https://full-stack-news-and-vlogs-website.vercel.app/api/status

Features
Browse articles by category

Search news and filter by date range

View individual articles and their original sources

Paginated article listings

Freshness indicators and last-update status

Automated ingestion from configured RSS feeds

Optional NewsAPI integration

Duplicate detection and URL normalization

Scheduled daily updates and optional frequent refreshes

Tech Stack
Area	Technologies
Frontend	React, TypeScript, Vite, Tailwind CSS
Backend	Node.js, Express, TypeScript
Database	MongoDB Atlas, Mongoose
Scheduling	node-cron
Testing	Vitest
Hosting	Vercel and Render
How It Works
The backend collects articles from the configured providers, processes them, checks for duplicates, and stores them in MongoDB. The frontend retrieves articles through the API and displays them with category, search, and date-filtering options.

In local development, Vite forwards /api requests to the backend on port 5000. In production, Vercel forwards those requests to the Render backend through a rewrite.

text
React Frontend
      |
      | /api requests
      v
Express Backend
      |
      v
MongoDB
      ^
      |
Scheduled News Ingestion
Project Structure
text
.
├── client/
│   └── dailypulse/
│       └── client/
│           ├── src/
│           ├── index.html
│           ├── package.json
│           ├── vite.config.ts
│           └── vercel.json
├── server/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
Run Locally
Requirements
Node.js and npm

MongoDB Atlas or a running local MongoDB instance

A copy of this repository

Backend Setup
Open a terminal in the repository root:

bash
cd server
npm install
Copy the environment template into the server folder.

Windows PowerShell:

powershell
Copy-Item ..\.env.example .env
macOS / Linux:

bash
cp ../.env.example .env
Configure server/.env with your own MongoDB connection string. Keep private credentials in this local file, not in the repository.

For a local MongoDB instance, the database setting can be:

text
MONGODB_URI=mongodb://127.0.0.1:27017/Dailypulse
For Atlas, use the connection string supplied by Atlas and configure the project's database user and network access.

Run the tests, import articles, and start the API:

bash
npm test
npm run ingest
npm run dev
The backend runs locally at:

text
http://localhost:5000
Frontend Setup
Open another terminal in the repository root:

bash
cd client/dailypulse/client
npm install
npm run dev
Open the address printed by Vite, normally:

text
http://localhost:5173
Keep both development servers running while using the application locally.

Configuration
Variable	Purpose
NODE_ENV	Runtime environment
PORT	Backend port
CLIENT_URL	Frontend origin used by the backend configuration
MONGODB_URI	MongoDB connection string
ENABLE_SCHEDULER	Enables scheduled ingestion
TIMEZONE	Scheduler timezone
DAILY_CRON	Daily ingestion schedule
BREAKING_CRON	Frequent refresh schedule
ENABLE_BREAKING_REFRESH	Enables frequent refreshes
RSS_FEEDS	Comma-separated feed entries in name|url|categorySlug format
NEWSAPI_KEY	Optional NewsAPI credential
The configured scheduler defaults use Asia/Kolkata, with a daily run at 6:00 AM IST and an optional refresh every 30 minutes.

The default RSS configuration includes PIB and RBI. Provider availability and access policies can affect ingestion. NewsAPI is optional; its plan terms should be checked before production use.

API Routes
Method	Route	Description
GET	/api/articles	Paginated articles with search and filters
GET	/api/articles/today	Articles published today using IST date boundaries
GET	/api/articles/:id	Individual article
GET	/api/categories	Available categories
GET	/api/status	Last successful update and stale-data status
Article Filters
The article-list endpoint supports:

page and limit for pagination

category for category filtering

q for text search

range with today, yesterday, week, or month

sort with latest or popular

Example:

text
/api/articles?page=1&limit=10&range=week&sort=latest
Deployment
Backend — Render
The backend is hosted on Render, with its database connection and other private configuration supplied through server-side environment variables.

Frontend — Vercel
The frontend is hosted on Vercel. Its vercel.json forwards API requests to the backend and supports client-side routes:

json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://dailypulse-api.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
This configuration belongs beside the frontend's package.json. The API rule comes before the frontend fallback.

Testing
Run the backend unit tests from the server directory:

bash
npm test
The test suite covers URL normalization, similar-title detection, category classification, IST date handling, and RSS feed configuration parsing.

Operational Notes
Scheduled jobs need the backend process to remain running. Sleeping instances do not provide uninterrupted scheduling.

HTTP 403 or 406 responses from a feed indicate that the provider rejected the request; they do not necessarily mean the database or API is unavailable.

The status endpoint and article endpoint should be checked separately when diagnosing missing news.

Local ingestion can populate the deployed database when both environments use the same MongoDB database.

Security
Environment files and private credentials must stay out of source control.

The example environment file should contain safe placeholders only.

Exposed database passwords, API keys, and secrets should be rotated immediately.

Backend credentials must never be included in frontend code.

Future Improvements
I plan to continue improving the platform with richer personalization, exam-preparation tools, AI-assisted features, multilingual support, and notifications.

