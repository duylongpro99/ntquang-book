export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  editor?: string;
  publisher: string;
  year: number;
  pages: number;
  fileSize: string;
  format: "PDF" | "EPUB" | "Chm";
  language: "Tiếng Việt" | "English" | "Song ngữ";
  sku: string;
  rating: number;
  ratingCount: number;
  categorySlug: string;
  categoryName: string;
  parentCategorySlug?: string;
  cover: string;
  description: string;
  tableOfContents?: string[];
  downloadCount: number;
  downloadUrl: string;
  dateAdded: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  cover: string;
  readTime: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
  children?: CategoryItem[];
}
