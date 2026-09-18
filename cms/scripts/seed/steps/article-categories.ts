import type { Core } from '@strapi/strapi';
import { ARTICLES_DATA } from '../source';
import { slugify } from '../slugify';
import { upsertByKey } from '../upsert';

const UID = 'api::article-category.article-category';

/** Distinct article.category strings → { name, slug }.
 *  Assumes `slug` (uid) is unique across names: two distinct names that `slugify()` to the same
 *  slug would throw on create (fail-loud) — acceptable; no collision in current data. */
export async function seedArticleCategories(strapi: Core.Strapi): Promise<number> {
  const names = new Set<string>();
  for (const a of ARTICLES_DATA) names.add(a.category);
  for (const name of names) {
    await upsertByKey(strapi, UID, 'slug', slugify(name), { name, slug: slugify(name) });
  }
  return names.size;
}
