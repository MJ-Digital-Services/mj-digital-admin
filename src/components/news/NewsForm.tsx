'use client';

import { useState, useEffect, useRef } from 'react';
import { News } from '@/types';
import { newsApi } from '@/lib/api';
import { toast } from 'sonner';
import { ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { TipTapEditor } from '@/components/shared/TipTapEditor';

export interface NewsFormData {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  tags: string[];
  readTime?: string;
  content: string;
  relatedPosts: string[];
  isPublished: boolean;
  faqs: { question: string; answer: string }[];
  faqsTitle: string;
  metaTitle: string;
  metaDescription: string;
}

interface NewsFormProps {
  news?: News | null;
  existingNews: News[];
  onSubmit: (data: NewsFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white';

function Field({ label, children, span2 = false }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={`space-y-1.5 ${span2 ? 'sm:col-span-2' : ''}`}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export function NewsForm({ news, existingNews, onSubmit, isSubmitting, onCancel }: NewsFormProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [readTime, setReadTime] = useState('');
  const [content, setContent] = useState('');
  const [relatedPosts, setRelatedPosts] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [faqsTitle, setFaqsTitle] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const coverRef = useRef<HTMLInputElement>(null);
  const newsId = news?._id ?? '';

  useEffect(() => {
    if (news) {
      setTitle(news.title);
      setSlug(news.slug);
      setExcerpt(news.excerpt);
      setCoverImage(news.coverImage ?? null);
      setTagsInput(news.tags.join(', '));
      setReadTime(news.readTime ?? '');
      setContent(news.content ?? '');
      setRelatedPosts((news.relatedPosts ?? []).map((p: any) => typeof p === 'string' ? p : p._id));
      setIsPublished(news.isPublished);
      setFaqs(news.faqs && news.faqs.length > 0 ? news.faqs : [{ question: '', answer: '' }]);
      setFaqsTitle(news.faqsTitle ?? '');
      setMetaTitle(news.metaTitle ?? '');
      setMetaDescription(news.metaDescription ?? '');
    }
  }, [news]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!news) setSlug(generateSlug(val));
  };

  const handleCoverUpload = async (file: File) => {
    if (!newsId) { toast.error('Save the article first before uploading a cover image'); return; }
    setCoverUploading(true);
    try {
      const result = await newsApi.uploadImage(file, newsId);
      setCoverImage(result.imageUrl);
      toast.success('Cover image uploaded');
    } catch (e: any) {
      toast.error(e.message || 'Cover upload failed');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!newsId) { toast.error('Save the article first before uploading images'); throw new Error('No newsId'); }
    const result = await newsApi.uploadImage(file, newsId);
    return result.imageUrl;
  };

  const toggleRelated = (id: string) =>
    setRelatedPosts((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);

  const updateFaq = (index: number, field: 'question' | 'answer', val: string) =>
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: val } : f)));
    const addFaq = () => setFaqs((prev) => [...prev, { question: '', answer: '' }]);
    const removeFaq = (index: number) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!title || !slug || !excerpt) {
        toast.error('Title, slug and excerpt are required');
        return;
    }
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const cleanFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    await onSubmit({
        title, slug, excerpt, coverImage, tags,
        readTime: readTime || undefined, content, relatedPosts,
        isPublished, faqs: cleanFaqs, faqsTitle, metaTitle, metaDescription,
    });
    };

  const otherNews = existingNews.filter((n) => n._id !== news?._id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title *" span2>
            <input className={inputCls} value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="News title" />
          </Field>
          <Field label="Slug *">
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="news-slug" />
          </Field>
          <Field label="Read Time">
            <input className={inputCls} value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="3 min read" />
          </Field>
          <Field label="Excerpt *" span2>
            <textarea className={inputCls} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description shown on listing page" rows={2} />
          </Field>
          <Field label="Tags (comma separated)" span2>
            <input className={inputCls} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Launch, Milestone, Press" />
          </Field>
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cover Image</h2>
        {!newsId ? (
          <p className="text-xs text-slate-400">Save the article first to enable cover image upload.</p>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              disabled={coverUploading}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              {coverUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {coverUploading ? 'Uploading...' : 'Upload Cover'}
            </button>
            <input ref={coverRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleCoverUpload(file); }} />
            {coverImage && <span className="text-xs text-green-600">✓ Cover uploaded</span>}
          </div>
        )}
        {coverImage && <img src={coverImage} alt="Cover" className="w-full max-h-60 object-cover rounded-lg mt-2" />}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Content</h2>
        {!newsId && <p className="text-xs text-slate-400">Save the article first to enable inline image uploads.</p>}
        <TipTapEditor value={content} onChange={setContent} onImageUpload={handleEditorImageUpload} />
      </div>

      {/* Related News */}
      {otherNews.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Related Articles</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {otherNews.map((n) => (
              <label key={n._id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={relatedPosts.includes(n._id)}
                  onChange={() => toggleRelated(n._id)} className="accent-red-600" />
                <span className="text-sm text-slate-700">{n.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">FAQs</h2>
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Section Heading</label>
            <input className={inputCls} value={faqsTitle} onChange={(e) => setFaqsTitle(e.target.value)} placeholder="Frequently asked questions" />
        </div>
        {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">FAQ {i + 1}</span>
                <button type="button" onClick={() => removeFaq(i)} disabled={faqs.length <= 1}
                className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30">
                <Trash2 className="h-3 w-3" />
                </button>
            </div>
            <input className={inputCls} value={faq.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} placeholder="Question" />
            <textarea className={inputCls} value={faq.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} placeholder="Answer" rows={3} />
            </div>
        ))}
        <button type="button" onClick={addFaq}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
            <Plus className="h-3 w-3" /> Add FAQ
        </button>
        </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO</h2>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Meta Title</label>
          <input className={inputCls} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Leave empty to use article title" />
          <p className="text-xs text-slate-400">
            {metaTitle.length}/60 characters
            {metaTitle.length > 60 && <span className="text-red-500"> — too long</span>}
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Meta Description</label>
          <textarea className={inputCls} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Leave empty to use excerpt" rows={3} />
          <p className="text-xs text-slate-400">
            {metaDescription.length}/160 characters
            {metaDescription.length > 160 && <span className="text-red-500"> — too long</span>}
          </p>
        </div>
      </div>

      {/* Publish + Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-red-600 w-4 h-4" />
          <span className="text-sm font-medium text-slate-700">Publish immediately</span>
        </label>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60 transition-colors">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {news ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </div>
    </div>
  );
}