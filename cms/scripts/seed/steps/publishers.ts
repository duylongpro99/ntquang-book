import type { Core } from '@strapi/strapi';
import { BOOKS_DATA } from '../source';
import { slugify } from '../slugify';
import { upsertByKey } from '../upsert';

const UID = 'api::publisher.publisher';

/** Distinct verbatim book.publisher strings.
 *  Assumes `slug` (uid) is unique across names: two distinct names that `slugify()` to the same
 *  slug would throw on create (fail-loud) — acceptable; no collision in current data. */
export async function seedPublishers(strapi: Core.Strapi): Promise<number> {
  const names = new Set<string>();
  for (const b of BOOKS_DATA) names.add(b.publisher);
  for (const name of names) {
    await upsertByKey(strapi, UID, 'name', name, { name, slug: slugify(name) });
  }
  return names.size;
}
