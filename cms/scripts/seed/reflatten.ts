import type { Book, Article } from './source';
import { formatSeedDate } from './date';

/** A relation-populated book entry as returned by the Document Service. */
type PopulatedBook = Record<string, any>;
type PopulatedArticle = Record<string, any>;

/**
 * CMS book entry (category/authors/publisher/tableOfContents populated) → frontend Book minus id.
 *
 * `categoryName` is re-derived from the populated `category` relation's canonical name
 * (spec §3: the book-level `categoryName` field is dropped and re-derived, not stored).
 * The re-flatten diff (`scripts/seed-verify.ts`) compares the result key-order-insensitively,
 * so key order here is cosmetic only.
 */
export function reflattenBook(entry: PopulatedBook): Omit<Book, 'id'> {
  const parentSlug = entry.category?.parent?.slug;
  const toc = (entry.tableOfContents ?? []).map((t: any) => t.text);

  const out: Omit<Book, 'id'> = {
    slug: entry.slug,
    title: entry.title,
    author: entry.byline,
    ...(entry.editor != null && { editor: entry.editor }),
    publisher: entry.publisher?.name,
    year: entry.year,
    pages: entry.pages,
    fileSize: entry.fileSize,
    format: entry.format,
    language: entry.language,
    sku: entry.sku,
    rating: entry.rating,
    ratingCount: entry.ratingCount,
    categorySlug: entry.category?.slug,
    categoryName: entry.category?.name,
    ...(parentSlug != null && { parentCategorySlug: parentSlug }),
    cover: entry.coverUrl,
    description: entry.description,
    ...(toc.length > 0 && { tableOfContents: toc }),
    downloadCount: entry.downloadCount,
    downloadUrl: entry.downloadUrl,
    dateAdded: entry.dateAdded,
    ...(entry.isFeatured && { isFeatured: true }),
    ...(entry.isNew && { isNew: true }),
  } as Omit<Book, 'id'>;

  return out;
}

/** CMS article entry (author/category populated) → frontend Article minus id. */
export function reflattenArticle(entry: PopulatedArticle): Omit<Article, 'id'> {
  return {
    slug: entry.slug,
    title: entry.title,
    category: entry.category?.name,
    excerpt: entry.excerpt,
    author: entry.byline,
    publishedAt: formatSeedDate(entry.publishedDate),
    readTime: entry.readTime,
    cover: entry.coverUrl,
    content: entry.content,
  };
}
