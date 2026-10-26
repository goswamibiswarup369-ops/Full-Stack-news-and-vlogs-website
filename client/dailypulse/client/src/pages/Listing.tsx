import { useSearchParams, useParams } from 'react-router-dom';
import { api, useAsync } from '../api';
import { ArticleCard, CardSkeletons, Notice } from '../components/ui';
import { catName } from '../utils';

const RANGES = [['', 'Any time'], ['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'This week'], ['month', 'This month']];

export default function Listing({ mode }: { mode: 'category' | 'search' }) {
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') ?? '';
  const range = sp.get('range') ?? '';
  const sort = sp.get('sort') ?? 'latest';
  const page = Number(sp.get('page') ?? '1') || 1;

  const qs = new URLSearchParams({ page: String(page), limit: '12', sort });
  if (mode === 'category' && slug) qs.set('category', slug);
  if (q) qs.set('q', q);
  if (range) qs.set('range', range);

  const res = useAsync(() => api.articles(qs.toString()), [qs.toString()]);
  const update = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    if (k !== 'page') n.delete('page');
    setSp(n);
  };

  const title = mode === 'category' && slug ? catName(slug) : q ? `Results for "${q}"` : 'All stories';
  const select = 'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-charcoal-line dark:bg-charcoal-card';

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy dark:text-white">{title}</h1>
      <div className="my-5 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">Date
          <select className={select} value={range} onChange={(e) => update('range', e.target.value)}>
            {RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">Sort
          <select className={select} value={sort} onChange={(e) => update('sort', e.target.value)}>
            <option value="latest">Latest</option><option value="popular">Most read</option>
          </select>
        </label>
        {(range || sort !== 'latest') && (
          <button onClick={() => setSp(q ? { q } : {})} className="text-electric hover:underline dark:text-blue-300">Clear filters</button>
        )}
        {res.data && <span className="ml-auto text-slate-500">{res.data.total} {res.data.total === 1 ? 'story' : 'stories'}</span>}
      </div>

      {res.loading ? <CardSkeletons /> : res.error ? (
        <Notice title="Stories could not be loaded">{res.error}</Notice>
      ) : !res.data?.items.length ? (
        <Notice title="No matching stories">Try a different keyword, widen the date range, or clear the filters. Only saved stories can be searched.</Notice>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{res.data.items.map((a) => <ArticleCard key={a.id} a={a} />)}</div>
          {res.data.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
              <button disabled={page <= 1} onClick={() => update('page', String(page - 1))} className="rounded-full border px-4 py-1.5 disabled:opacity-40 dark:border-charcoal-line">Previous</button>
              <span>Page {page} of {res.data.pages}</span>
              <button disabled={page >= res.data.pages} onClick={() => update('page', String(page + 1))} className="rounded-full border px-4 py-1.5 disabled:opacity-40 dark:border-charcoal-line">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
