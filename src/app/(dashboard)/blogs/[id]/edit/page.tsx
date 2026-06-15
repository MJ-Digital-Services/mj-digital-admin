'use client';

import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { BlogForm, BlogFormData } from '@/components/blogs/BlogForm';
import { blogsApi } from '@/lib/api';
import { Blog } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: blogData, isLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const res = await blogsApi.getById(id);
      return res.data.data;
    },
  });

  const { data: allBlogsData } = useQuery({
    queryKey: ['blogs-all'],
    queryFn: async () => {
      const res = await blogsApi.getPublished();
      return res.data.data;
    },
  });

  const allBlogs: Blog[] = allBlogsData?.blogs ?? [];

  const updateMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog updated');
      router.push('/blogs');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Edit Blog" />
        <div className="p-6 text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Edit Blog" description={blogData?.title} />
      <div className="p-6 space-y-6">
        <button
          onClick={() => router.push('/blogs')}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </button>
        <BlogForm
          blog={blogData}
          existingBlogs={allBlogs}
          onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
          isSubmitting={updateMutation.isPending}
          onCancel={() => router.push('/blogs')}
        />
      </div>
    </div>
  );
}