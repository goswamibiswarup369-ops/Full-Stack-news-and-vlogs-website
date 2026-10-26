import { Router } from 'express';
import { z } from 'zod';
import { Article } from '../models/Article';
import { IngestionLog } from '../models/IngestionLog';
import { rangeStart, startOfIstDay } from '../utils/dates';
import { CATEGORIES } from '../config/categories';

export const articlesRouter = Router();

const FRESH_HOURS = 36;
const STALE_HOURS = 36;

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().max(60).optional(),
  q: z.string().trim().max(100).optional(),
  range: z.enum(['today', 'yesterday', 'week', 'month']).optional(),
  sort: z.enum(['latest', 'popular']).default('latest'),
});

function present(a: any) {
  const ageH = (Date.now() - new Date(a.publishedAt).getTime()) / 3600000;
  return {
    id: a._id, title: a.title, url: a.url, sourceName: a.sourceName, category: a.category,
    snippet: a.sourceSnippet, summary: a.summary, aiGenerated: !!a.summary, imageUrl: a.imageUrl,
    publishedAt: a.publishedAt, firstSeenAt: a.firstSeenAt, lastCheckedAt: a.lastCheckedAt,
    verificationStatus: a.verificationStatus,
    freshness: ageH <= FRESH_HOURS ? 'new' : 'older', // an old story is never presented as today's news
  };
}

articlesRouter.get('/categories', (_req, res) => {
  res.json(CATEGORIES.map(({ slug, name }) => ({ slug, name })));
});

articlesRouter.get('/status', async (_req, res) => {
  const last = await IngestionLog.findOne({ status: { $in: ['success', 'partial'] } }).sort({ finishedAt: -1 }).lean();
  const lastAt = last?.finishedAt ?? null;
  const stale = !lastAt || Date.now() - lastAt.getTime() > STALE_HOURS * 3600000;
  res.json({
    lastSuccessfulUpdate: lastAt, stale,
    message: stale ? 'News is temporarily unavailable or out of date. Showing previously saved articles.' : 'Up to date',
  });
});

articlesRouter.get('/articles', async (req, res) => {
  const p = listQuery.safeParse(req.query);
  if (!p.success) return res.status(400).json({ error: 'Invalid query', details: p.error.flatten().fieldErrors });
  const { page, limit, category, q, range, sort } = p.data;

  const filter: Record<string, unknown> = { verificationStatus: { $ne: 'rejected' } };
  if (category) filter.category = String(category);
  if (q) filter.$text = { $search: q };
  if (range) {
    const { from, to } = rangeStart(range);
    filter.publishedAt = to ? { $gte: from, $lt: to } : { $gte: from };
  }
  const order: Record<string, 1 | -1> = sort === 'popular' ? { views: -1, publishedAt: -1 } : { publishedAt: -1 };

  const [items, total] = await Promise.all([
    Article.find(filter).sort(order).skip((page - 1) * limit).limit(limit).lean(),
    Article.countDocuments(filter),
  ]);
  res.json({ items: items.map(present), page, limit, total, pages: Math.ceil(total / limit) });
});

// "Today" = published today in IST (by publication date, NOT import date)
articlesRouter.get('/articles/today', async (_req, res) => {
  const items = await Article.find({ publishedAt: { $gte: startOfIstDay() }, verificationStatus: { $ne: 'rejected' } })
    .sort({ publishedAt: -1 }).limit(50).lean();
  res.json({ items: items.map(present) });
});

articlesRouter.get('/articles/:id', async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const a = await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).lean();
  if (!a) return res.status(404).json({ error: 'Article not found' });
  res.json(present(a));
});
