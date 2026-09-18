import type { Book, Article } from './source';
import { formatSeedDate } from './date';

/** A relation-populated book entry as returned by the Document Service. */
type PopulatedBook = Record<string, any>;
type PopulatedArticle = Record<string, any>;

/**
 * CMS book entry (category/authors/publisher/tableOfContents populated) → frontend Book minus id.
 *
 * Key insertion order matters: the re-flatten diff (`scripts/seed-verify.ts`) compares this
 * against the source `Book` object with `JSON.stringify`, which is order-sensitive. The keys
 * below — including where each optional field is conditionally spread in — mirror the exact
 * property order used in every entry of `frontend/src/data/books.ts` (itself the `Book`
 * interface's declaration order), so a faithful round-trip stringifies identically.
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
    categoryName: entry.categoryName,
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

/**
 * CMS article entry (author/category populated) → frontend Article minus id.
 *
 * Key order mirrors every entry in `frontend/src/data/articles.ts` (slug, title, category,
 * excerpt, author, publishedAt, readTime, cover, content) rather than the `Article` interface's
 * declaration order, since the re-flatten diff compares via order-sensitive `JSON.stringify`.
 */
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
