import type { Book, Article } from './source';
import { formatSeedDate } from './date';

/** A relation-populated book entry as returned by the Document Service. */
type PopulatedBook = Record<string, any>;
type PopulatedArticle = Record<string, any>;

/** CMS book entry (category/authors/publisher/tableOfContents populated) → frontend Book minus id. */
export function reflattenBook(entry: PopulatedBook): Omit<Book, 'id'> {
  const out: Omit<Book, 'id'> = {
    slug: entry.slug,
    title: entry.title,
    author: entry.byline,
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
    cover: entry.coverUrl,
    description: entry.description,
    downloadCount: entry.downloadCount,
    downloadUrl: entry.downloadUrl,
    dateAdded: entry.dateAdded,
  } as Omit<Book, 'id'>;

  if (entry.editor != null) out.editor = entry.editor;
  const parentSlug = entry.category?.parent?.slug;
  if (parentSlug != null) out.parentCategorySlug = parentSlug;
  const toc = (entry.tableOfContents ?? []).map((t: any) => t.text);
  if (toc.length > 0) out.tableOfContents = toc;
  if (entry.isFeatured) out.isFeatured = true;
  if (entry.isNew) out.isNew = true;

  return out;
}

/** CMS article entry (author/category populated) → frontend Article minus id. */
export function reflattenArticle(entry: PopulatedArticle): Omit<Article, 'id'> {
  return {
    slug: entry.slug,
    title: entry.title,
    category: entry.category?.name,
    excerpt: entry.excerpt,
    content: entry.content,
    author: entry.byline,
    publishedAt: formatSeedDate(entry.publishedDate),
    cover: entry.coverUrl,
    readTime: entry.readTime,
  };
}
