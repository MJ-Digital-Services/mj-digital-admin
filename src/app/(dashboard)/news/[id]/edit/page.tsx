'use client';

import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { NewsForm, NewsFormData } from '@/components/news/NewsForm';
import { newsApi } from '@/lib/api';
import { News } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function EditNewsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: newsItem, isLoading } = useQuery({
    queryKey: ['news-item', id],
    queryFn: async () => {
      const res = await newsApi.getById(id);
      return res.data.data;
    },
  });

  const { data: allNewsData } = useQuery({
    queryKey: ['news-all'],
    queryFn: async () => {
      const res = await newsApi.getPublished();
      return res.data.data;
    },
  });

  const allNews: News[] = allNewsData?.news ?? [];

  const updateMutation = useMutation({
    mutationFn: (data: NewsFormData) => newsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Article updated');
      router.push('/news');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Edit Article" />
        <div className="p-6 text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Edit Article" description={newsItem?.title} />
      <div className="p-6 space-y-6">
        <button
          onClick={() => router.push('/news')}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </button>
        <NewsForm
          news={newsItem}
          existingNews={allNews}
          onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
          isSubmitting={updateMutation.isPending}
          onCancel={() => router.push('/news')}
        />
      </div>
    </div>
  );
}