'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { BlogsTable } from '@/components/blogs/BlogsTable';
import { blogsApi } from '@/lib/api';
import { Blog } from '@/types';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';

export default function BlogsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const queryParams: Record<string, unknown> = { page, limit: 10 };
  if (search) queryParams.search = search;
  if (publishedFilter !== 'all') queryParams.isPublished = publishedFilter === 'published';

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', queryParams],
    queryFn: async () => {
      const res = await blogsApi.getAll(queryParams);
      return res.data.data;
    },
  });

  const blogs: Blog[] = data?.blogs ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: 10 };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      setConfirmOpen(false);
      setDeleteTarget(null);
      toast.success('Blog deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <Header title="Blogs" description="Manage blog posts" />

      <div className="p-6 space-y-5">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
            </div>
            <select
              value={publishedFilter}
              onChange={(e) => { setPublishedFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button
            onClick={() => router.push('/blogs/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Blog
          </button>
        </div>

        {/* Table */}
        <BlogsTable
          blogs={blogs}
          isLoading={isLoading}
          onEdit={(blog) => router.push(`/blogs/${blog._id}/edit`)}
          onDelete={(blog) => { setDeleteTarget(blog); setConfirmOpen(true); }}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{pagination.total} total blogs</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Blog</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold">"{deleteTarget?.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setConfirmOpen(false); setDeleteTarget(null); }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget._id); }}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60 transition-colors"
              >
                {deleteMutation.isPending && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}