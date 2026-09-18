import type { Core } from '@strapi/strapi';

const SEED_UIDS = [
  'api::book.book',
  'api::article.article',
  'api::category.category',
  'api::article-category.article-category',
  'api::author.author',
  'api::publisher.publisher',
  'api::branding.branding',
] as const;

/**
 * Reset every seed-owned collection to empty. Used as a per-suite beforeAll
 * so each seed integration test starts from a clean slate on the shared
 * `test-seed.db`, regardless of what sibling suites already wrote.
 * `db.query(...).deleteMany({})` removes rows regardless of draft/publish
 * status, which is exactly the clean-slate behavior a test reset wants.
 */
export async function clearSeedData(strapi: Core.Strapi): Promise<void> {
  for (const uid of SEED_UIDS) {
    await strapi.db.query(uid as any).deleteMany({});
  }
}
