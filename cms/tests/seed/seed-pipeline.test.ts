import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { clearSeedData } from '../helpers/clear-seed-data';
import { runSeed } from '../../scripts/seed';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
beforeAll(async () => { await clearSeedData(strapi); });
afterAll(async () => { await teardownStrapi(); });

describe('runSeed (full pipeline)', () => {
  it('seeds every collection to the expected counts', async () => {
    const counts = await runSeed(strapi);
    expect(counts).toMatchObject({
      categories: 56, articleCategories: 3, authors: 15, publishers: 2, books: 12, articles: 3,
    });
    expect(await strapi.documents('api::category.category').findMany({ pagination: { limit: -1 } })).toHaveLength(56);
    expect(await strapi.documents('api::book.book').findMany({ status: 'published', pagination: { limit: -1 } })).toHaveLength(12);
    expect(await strapi.documents('api::article.article').findMany({ status: 'published', pagination: { limit: -1 } })).toHaveLength(3);
  });

  it('is idempotent: a second run produces no duplicates and no drift', async () => {
    const counts = await runSeed(strapi);
    expect(counts).toMatchObject({
      categories: 56, articleCategories: 3, authors: 15, publishers: 2, books: 12, articles: 3,
    });
    expect(await strapi.documents('api::author.author').findMany({ pagination: { limit: -1 } })).toHaveLength(15);
    expect(await strapi.documents('api::book.book').findMany({ status: 'published', pagination: { limit: -1 } })).toHaveLength(12);
    const branding = await strapi.documents('api::branding.branding').findMany({});
    expect(branding.length).toBeLessThanOrEqual(1);
  });
});
