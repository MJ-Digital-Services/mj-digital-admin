'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { blogsApi, newsApi, categoriesApi } from '@/lib/api';
import {
  FileText,
  Newspaper,
  Tag,
  Plus,
  ArrowUpRight,
  CircleCheck,
  CircleDashed,
  Layers,
} from 'lucide-react';

/* ---------------- data helpers ---------------- */

// APIs return { data: { data: {...} } }; the list array key can vary,
// so pick the first array we find.
function extractList(payload: any): any[] {
  const d = payload?.data?.data;
  if (Array.isArray(d)) return d;
  if (!d) return [];
  for (const k of ['blogs', 'news', 'articles', 'items', 'docs', 'results', 'data']) {
    if (Array.isArray(d[k])) return d[k];
  }
  const firstArray = Object.values(d).find(Array.isArray);
  return (firstArray as any[]) ?? [];
}

function extractTotal(payload: any): number {
  return payload?.data?.data?.pagination?.total ?? extractList(payload).length;
}

const fmtDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

/* ---------------- tiny UI atoms ---------------- */

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

function StatusPill({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
      <CircleCheck className="h-3 w-3" /> Published
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      <CircleDashed className="h-3 w-3" /> Draft
    </span>
  );
}

/* ---------------- page ---------------- */

export default function DashboardPage() {
  /* counts */
  const blogStats = useQuery({
    queryKey: ['dash-blog-stats'],
    queryFn: async () => {
      const [all, pub] = await Promise.all([
        blogsApi.getAll({ limit: 1 }),
        blogsApi.getAll({ limit: 1, isPublished: true }),
      ]);
      const total = extractTotal(all);
      const published = extractTotal(pub);
      return { total, published, drafts: total - published };
    },
  });

  const newsStats = useQuery({
    queryKey: ['dash-news-stats'],
    queryFn: async () => {
      const [all, pub] = await Promise.all([
        newsApi.getAll({ limit: 1 }),
        newsApi.getAll({ limit: 1, isPublished: true }),
      ]);
      const total = extractTotal(all);
      const published = extractTotal(pub);
      return { total, published, drafts: total - published };
    },
  });

  /* recent lists + categories */
  const recentBlogs = useQuery({
    queryKey: ['dash-recent-blogs'],
    queryFn: async () => extractList(await blogsApi.getAll({ limit: 5 })),
  });
  const recentNews = useQuery({
    queryKey: ['dash-recent-news'],
    queryFn: async () => extractList(await newsApi.getAll({ limit: 5 })),
  });
  const categories = useQuery({
    queryKey: ['dash-categories'],
    queryFn: async () => extractList(await categoriesApi.getAll({ includeInactive: true })),
  });

  const totalContent = (blogStats.data?.total ?? 0) + (newsStats.data?.total ?? 0);
  const totalPublished = (blogStats.data?.published ?? 0) + (newsStats.data?.published ?? 0);
  const totalDrafts = (blogStats.data?.drafts ?? 0) + (newsStats.data?.drafts ?? 0);
  const statsLoading = blogStats.isLoading || newsStats.isLoading;

  const publishPct = totalContent > 0 ? Math.round((totalPublished / totalContent) * 100) : 0;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Dashboard" description="Welcome to MJ Digital Admin" />

      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        {/* ============ HERO ============ */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white lg:p-10">
          {/* ambient red glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">{today}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">
                Good to see you back
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                {statsLoading
                  ? 'Loading your content overview…'
                  : totalDrafts > 0
                    ? `You have ${totalDrafts} draft${totalDrafts > 1 ? 's' : ''} waiting. Pick one up and get it published.`
                    : totalContent > 0
                      ? 'Everything is published. A good day to start something new.'
                      : 'Your workspace is empty. Start with your first blog post.'}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/blogs/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition-colors hover:bg-red-500"
                >
                  <Plus className="h-4 w-4" /> New blog post
                </Link>
                <Link
                  href="/news/new"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" /> New article
                </Link>
              </div>
            </div>

            {/* hero stats */}
            <div className="relative grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {[
                { label: 'Total content', value: totalContent },
                { label: 'Published', value: totalPublished },
                { label: 'Drafts', value: totalDrafts },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/80 px-6 py-5 backdrop-blur">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-10 bg-white/10" />
                  ) : (
                    <p className="text-3xl font-bold tabular-nums tracking-tight">{s.value}</p>
                  )}
                  <p className="mt-1 whitespace-nowrap text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* --- recent blogs --- */}
          <RecentList
            title="Recent blogs"
            icon={FileText}
            href="/blogs"
            query={recentBlogs}
            emptyLabel="No blog posts yet"
            emptyHref="/blogs/new"
          />

          {/* --- recent news --- */}
          <RecentList
            title="Recent news"
            icon={Newspaper}
            href="/news"
            query={recentNews}
            emptyLabel="No news articles yet"
            emptyHref="/news/new"
          />

          {/* --- right rail: health + categories --- */}
          <div className="flex flex-col gap-6">
            {/* publish health */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Publish health</h2>
              </div>

              <div className="mt-6 flex items-center gap-5">
                {/* donut */}
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" className="stroke-slate-100" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5"
                      strokeLinecap="round"
                      className="stroke-emerald-500 transition-all duration-1000"
                      strokeDasharray={`${publishPct} ${100 - publishPct}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-10" />
                    ) : (
                      <span className="text-xl font-bold tabular-nums text-slate-900">
                        {publishPct}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  <p className="flex items-center gap-2 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold tabular-nums text-slate-900">{totalPublished}</span>
                    published
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="font-semibold tabular-nums text-slate-900">{totalDrafts}</span>
                    in drafts
                  </p>
                  <p className="text-xs leading-relaxed text-slate-400">
                    of your content is live across blogs and news.
                  </p>
                </div>
              </div>
            </div>

            {/* categories */}
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Tag className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900">Categories</h2>
                </div>
                <Link
                  href="/categories"
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-red-600"
                >
                  Manage <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-5">
                {categories.isLoading ? (
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-7 w-16 rounded-full" />
                  </div>
                ) : (categories.data?.length ?? 0) === 0 ? (
                  <Link
                    href="/categories"
                    className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50/50 hover:text-red-600"
                  >
                    <Plus className="h-4 w-4" /> Add your first category
                  </Link>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.data!.slice(0, 12).map((c: any, i: number) => (
                      <span
                        key={c._id ?? c.id ?? i}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          c.isActive === false
                            ? 'border-slate-200 bg-slate-50 text-slate-400'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {c.name ?? c.title ?? 'Untitled'}
                      </span>
                    ))}
                    {(categories.data?.length ?? 0) > 12 && (
                      <span className="rounded-full px-2 py-1 text-xs text-slate-400">
                        +{categories.data!.length - 12} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- recent list card ---------------- */

function RecentList({
  title,
  icon: Icon,
  href,
  query,
  emptyLabel,
  emptyHref,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
  query: { isLoading: boolean; isError: boolean; data?: any[] };
  emptyLabel: string;
  emptyHref: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-red-600"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex-1 divide-y divide-slate-50 px-2 py-2">
        {query.isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : query.isError ? (
          <p className="p-4 text-sm text-slate-400">Couldn't load items. Try refreshing.</p>
        ) : (query.data?.length ?? 0) === 0 ? (
          <Link
            href={emptyHref}
            className="m-4 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50/50 hover:text-red-600"
          >
            <Plus className="h-4 w-4" /> {emptyLabel} — create one
          </Link>
        ) : (
          query.data!.slice(0, 5).map((item: any, i: number) => (
            <div
              key={item._id ?? item.id ?? i}
              className="group flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 group-hover:text-slate-900">
                  {item.title ?? 'Untitled'}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {fmtDate(item.publishedAt ?? item.createdAt ?? item.updatedAt)}
                </p>
              </div>
              <StatusPill published={item.isPublished === true} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}