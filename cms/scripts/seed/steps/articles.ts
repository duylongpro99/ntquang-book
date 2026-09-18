import type { Core } from '@strapi/strapi';
import { ARTICLES_DATA, type Article } from '../source';
import { parseSeedDate } from '../date';
import { upsertByKey } from '../upsert';

const UID = 'api::article.article';

async function resolveId(strapi: Core.Strapi, uid: string, filters: Record<string, unknown>, label: string): Promise<string> {
  const found = await strapi.documents(uid as any).findFirst({ filters: filters as any });
  if (!found) throw new Error(`Seed articles: missing ${label} for ${JSON.stringify(filters)} — seed its step first / fix source`);
  return found.documentId;
}

/** Upsert articles by slug with author + article-category relations and parsed publishedDate. */
export async function seedArticles(strapi: Core.Strapi, data: Article[] = ARTICLES_DATA): Promise<number> {
  for (const a of data) {
    const authorId = await resolveId(strapi, 'api::author.author', { name: a.author }, 'author');
    const categoryId = await resolveId(strapi, 'api::article-category.article-category', { name: a.category }, 'article-category');

    await upsertByKey(strapi, UID, 'slug', a.slug, {
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content, // verbatim, no trimming
      author: authorId,
      byline: a.author,
      category: categoryId,
      publishedDate: parseSeedDate(a.publishedAt),
      coverUrl: a.cover,
      readTime: a.readTime,
    }, { publish: true });
  }
  return data.length;
}
