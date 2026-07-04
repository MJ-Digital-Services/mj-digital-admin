'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { NewsForm, NewsFormData } from '@/components/news/NewsForm';
import { newsApi } from '@/lib/api';
import { News } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function NewNewsPage() {
  const router = useRouter();

  const { data: allNewsData } = useQuery({
    queryKey: ['news-all'],
    queryFn: async () => {
      const res = await newsApi.getPublished();
      return res.data.data;
    },
  });

  const allNews: News[] = allNewsData?.news ?? [];

  const createMutation = useMutation({
    mutationFn: (data: NewsFormData) => newsApi.create(data),
    onSuccess: (res) => {
      toast.success('Article created');
      const newId = res.data.data._id;
      router.push(`/news/${newId}/edit`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <Header title="New Article" description="Create a new news article" />
      <div className="p-6 space-y-6">
        <button
          onClick={() => router.push('/news')}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </button>
        <NewsForm
          news={null}
          existingNews={allNews}
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          isSubmitting={createMutation.isPending}
          onCancel={() => router.push('/news')}
        />
      </div>
    </div>
  );
}