'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { BlogForm, BlogFormData } from '@/components/blogs/BlogForm';
import { blogsApi } from '@/lib/api';
import { Blog } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function NewBlogPage() {
  const router = useRouter();

  const { data: allBlogsData } = useQuery({
    queryKey: ['blogs-all'],
    queryFn: async () => {
      const res = await blogsApi.getPublished();
      return res.data.data;
    },
  });

  const allBlogs: Blog[] = allBlogsData?.blogs ?? [];

  const createMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogsApi.create(data),
    onSuccess: (res) => {
      toast.success('Blog created');
      const newId = res.data.data._id;
      router.push(`/blogs/${newId}/edit`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <Header title="New Blog" description="Create a new blog post" />
      <div className="p-6 space-y-6">
        <button
          onClick={() => router.push('/blogs')}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </button>
        <BlogForm
          blog={null}
          existingBlogs={allBlogs}
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          isSubmitting={createMutation.isPending}
          onCancel={() => router.push('/blogs')}
        />
      </div>
    </div>
  );
}