import { useEffect, useState } from "react";

export interface Article {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  category: string;
  snippet?: string;
  summary?: string;
  aiGenerated: boolean;
  imageUrl?: string;
  publishedAt: string;
  firstSeenAt: string;
  lastCheckedAt: string;
  verificationStatus: string;
  freshness: "new" | "older";
}
export interface PageResult {
  items: Article[];
  page: number;
  pages: number;
  total: number;
}
export interface Status {
  lastSuccessfulUpdate: string | null;
  stale: boolean;
  message: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
export interface Category {
  slug: string;
  name: string;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch("/api" + path);
  if (!r.ok)
    throw new Error(`The server answered with an error (${r.status}).`);
  return r.json() as Promise<T>;
}

async function send<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const r = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = (await r.json().catch(() => ({}))) as { error?: string };
  if (!r.ok) throw new Error(j.error ?? `Request failed (${r.status}).`);
  return j as T;
}

export const api = {
  me: () => send<{ user: User }>("GET", "/auth/me"),
  login: (b: { email: string; password: string }) =>
    send<{ user: User }>("POST", "/auth/login", b),
  register: (b: { name: string; email: string; password: string }) =>
    send<{ user: User }>("POST", "/auth/register", b),
  logout: () => send<{ ok: boolean }>("POST", "/auth/logout"),
  articles: (qs: string) => get<PageResult>("/articles?" + qs),
  today: () => get<{ items: Article[] }>("/articles/today"),
  article: (id: string) => get<Article>("/articles/" + id),
  categories: () => get<Category[]>("/categories"),
  status: () => get<Status>("/status"),
};

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, set] = useState<{ data?: T; error?: string; loading: boolean }>(
    { loading: true },
  );
  useEffect(() => {
    let alive = true;
    set((s) => ({ ...s, loading: true, error: undefined }));
    fn()
      .then((data) => alive && set({ data, loading: false }))
      .catch((e: Error) => alive && set({ error: e.message, loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
