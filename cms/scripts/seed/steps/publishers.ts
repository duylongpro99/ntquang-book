import type { Core } from '@strapi/strapi';
import { BOOKS_DATA } from '../source';
import { slugify } from '../slugify';
import { upsertByKey } from '../upsert';

const UID = 'api::publisher.publisher';

/** Distinct verbatim book.publisher strings. */
export async function seedPublishers(strapi: Core.Strapi): Promise<number> {
  const names = new Set<string>();
  for (const b of BOOKS_DATA) names.add(b.publisher);
  for (const name of names) {
    await upsertByKey(strapi, UID, 'name', name, { name, slug: slugify(name) });
  }
  return names.size;
}
