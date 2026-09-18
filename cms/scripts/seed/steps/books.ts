import type { Core } from '@strapi/strapi';
import { BOOKS_DATA, type Book } from '../source';
import { upsertByKey } from '../upsert';

const UID = 'api::book.book';

async function resolveId(strapi: Core.Strapi, uid: string, filters: Record<string, unknown>, label: string): Promise<string> {
  const found = await strapi.documents(uid as any).findFirst({ filters: filters as any });
  if (!found) throw new Error(`Seed books: missing ${label} for ${JSON.stringify(filters)} — seed its step first / fix source`);
  return found.documentId;
}

/** Upsert books by sku with resolved category/authors/publisher relations. */
export async function seedBooks(strapi: Core.Strapi, data: Book[] = BOOKS_DATA): Promise<number> {
  for (const b of data) {
    const categoryId = await resolveId(strapi, 'api::category.category', { slug: b.categorySlug }, 'category');
    const authorId = await resolveId(strapi, 'api::author.author', { name: b.author }, 'author');
    const publisherId = await resolveId(strapi, 'api::publisher.publisher', { name: b.publisher }, 'publisher');

    await upsertByKey(strapi, UID, 'sku', b.sku, {
      title: b.title,
      slug: b.slug,
      byline: b.author,
      editor: b.editor,
      authors: [authorId],
      publisher: publisherId,
      category: categoryId,
      description: b.description,
      tableOfContents: (b.tableOfContents ?? []).map((text) => ({ text })),
      year: b.year,
      pages: b.pages,
      fileSize: b.fileSize,
      format: b.format,
      language: b.language,
      sku: b.sku,
      rating: b.rating,
      ratingCount: b.ratingCount,
      downloadCount: b.downloadCount,
      dateAdded: b.dateAdded,
      isFeatured: b.isFeatured ?? false,
      isNew: b.isNew ?? false,
      coverUrl: b.cover,
      downloadUrl: b.downloadUrl,
    }, { publish: true });
  }
  return data.length;
}
