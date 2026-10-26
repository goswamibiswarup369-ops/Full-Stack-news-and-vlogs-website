import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, Link2 } from 'lucide-react';
import { api, useAsync } from '../api';
import { Freshness, Notice, Skeleton } from '../components/ui';
import { catName, fmtDateTime } from '../utils';

export default function ArticlePage() {
  const { id = '' } = useParams();
  const { data: a, loading, error } = useAsync(() => api.article(id), [id]);

  if (loading) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-4 w-40" /><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /></div>;
  if (error || !a) return <Notice title="Story not found">It may have been removed. <Link to="/" className="text-electric underline">Back to the homepage</Link></Notice>;

  const share = () => navigator.clipboard?.writeText(window.location.href).catch(() => undefined);

  return (
    <article className="mx-auto max-w-3xl">
      <Link to={`/category/${a.category}`} className="text-sm text-electric hover:underline dark:text-blue-300">{catName(a.category)}</Link>
      <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-navy dark:text-white md:text-4xl">{a.title}</h1>
      <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-400">
        <p>Published by {a.sourceName} on {fmtDateTime(a.publishedAt)}</p>
        <Freshness a={a} />
        <p>Added to DailyPulse {fmtDateTime(a.firstSeenAt)}</p>
      </div>

      {a.summary && (
        <section className="mt-6 rounded-xl border border-teal/40 bg-teal/5 p-5">
          <h2 className="font-serif text-lg font-bold">Summary</h2>
          <p className="mt-2 leading-relaxed">{a.summary}</p>
          <p className="mt-2 text-xs text-slate-500">AI-generated summary. Check the original report for details.</p>
        </section>
      )}

      {a.snippet ? (
        <section className="mt-6">
          <h2 className="font-serif text-lg font-bold text-navy dark:text-white">Excerpt from the source</h2>
          <p className="mt-2 leading-relaxed">{a.snippet}</p>
        </section>
      ) : <p className="mt-6 text-slate-600">The source did not provide an excerpt. Open the original for the full story.</p>}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-electric px-5 py-2 font-medium text-white hover:bg-blue-500">
          Read the original on {a.sourceName} <ArrowUpRight size={14} aria-hidden />
        </a>
        <button onClick={share} className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-2 dark:border-charcoal-line"><Link2 size={14} aria-hidden /> Copy link</button>
      </div>
      <p className="mt-6 text-xs text-slate-500">Verification: {a.verificationStatus}. Summaries, exam notes and quizzes arrive in a later phase and will be labelled as AI-assisted.</p>
    </article>
  );
}
