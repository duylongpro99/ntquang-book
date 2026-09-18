import type { Core } from '@strapi/strapi';
import { BOOKS_DATA, ARTICLES_DATA } from '../source';
import { slugify } from '../slugify';
import { upsertByKey } from '../upsert';

const UID = 'api::author.author';

/** Distinct verbatim author strings across BOOKS_DATA and ARTICLES_DATA. */
export async function seedAuthors(strapi: Core.Strapi): Promise<number> {
  const names = new Set<string>();
  for (const b of BOOKS_DATA) names.add(b.author);
  for (const a of ARTICLES_DATA) names.add(a.author);
  for (const name of names) {
    await upsertByKey(strapi, UID, 'name', name, { name, slug: slugify(name) });
  }
  return names.size;
}
