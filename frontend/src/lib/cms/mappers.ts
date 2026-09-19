import { absolute } from "./client";
import type { Article, Book, CategoryItem } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: Strapi response entries are intentionally dynamically shaped (spec §4)
export type StrapiEntry = Record<string, any>;

/** 'yyyy-mm-dd' → 'dd/mm/yyyy'. Inverse of the seed's parseSeedDate. */
export function formatCmsDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) throw new Error(`Unexpected CMS date (want yyyy-mm-dd): ${iso}`);
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

export function mapBook(e: StrapiEntry): Book {
  const parentSlug = e.category?.parent?.slug;
  const toc: string[] = (e.tableOfContents ?? []).map((t: { text: string }) => t.text);
  const book: Book = {
    id: e.documentId,
    slug: e.slug,
    title: e.title,
    author: e.byline,
    publisher: e.publisher?.name,
    year: e.year,
    pages: e.pages,
    fileSize: e.fileSize,
    format: e.format,
    language: e.language,
    sku: e.sku,
    rating: e.rating,
    ratingCount: e.ratingCount,
    categorySlug: e.category?.slug,
    categoryName: e.category?.name,
    cover: e.coverUrl ?? absolute(e.cover?.url) ?? "",
    description: e.description,
    downloadCount: e.downloadCount,
    downloadUrl: e.downloadUrl ?? absolute(e.file?.url) ?? "",
    dateAdded: e.dateAdded,
  };
  if (e.editor != null) book.editor = e.editor;
  if (parentSlug != null) book.parentCategorySlug = parentSlug;
  if (toc.length > 0) book.tableOfContents = toc;
  if (e.isFeatured) book.isFeatured = true;
  if (e.isNew) book.isNew = true;
  return book;
}

export function mapArticle(e: StrapiEntry): Article {
  return {
    id: e.documentId,
    slug: e.slug,
    title: e.title,
    category: e.category?.name,
    excerpt: e.excerpt,
    content: e.content,
    author: e.byline,
    publishedAt: formatCmsDate(e.publishedDate),
    cover: e.coverUrl ?? absolute(e.cover?.url) ?? "",
    readTime: e.readTime,
  };
}

export function mapCategoryNode(e: StrapiEntry, children?: CategoryItem[], count?: number): CategoryItem {
  const node: CategoryItem = { id: e.slug, name: e.name, slug: e.slug };
  if (count != null) node.count = count;
  if (children && children.length > 0) node.children = children;
  return node;
}
