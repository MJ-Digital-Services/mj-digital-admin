'use client';

import { News } from '@/types';
import { formatDate } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

interface NewsTableProps {
  news: News[];
  isLoading: boolean;
  onEdit: (item: News) => void;
  onDelete: (item: News) => void;
}

export function NewsTable({ news, isLoading, onEdit, onDelete }: NewsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">
        Loading news...
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">
        No news articles found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Tags</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Read Time</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Published</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Updated</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {news.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 max-w-[260px]">
                  <p className="font-medium text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.excerpt}</p>
                  <p className="text-xs text-slate-400 mt-0.5">/{item.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="text-xs text-slate-400">+{item.tags.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.readTime ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">
                  {item.publishedAt ? formatDate(item.publishedAt) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.updatedAt ? formatDate(item.updatedAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}