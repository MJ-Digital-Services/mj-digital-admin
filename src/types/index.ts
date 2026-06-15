export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive: boolean;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: Category | string;
  coverImage?: string | null;
  tags: string[];
  readTime?: string | null;
  content?: string;
  relatedPosts?: Blog[] | string[];
  faqs?: { question: string; answer: string }[];
  faqsTitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdBy?: { name: string; email: string };
  createdAt?: string;
  updatedAt?: string;
}