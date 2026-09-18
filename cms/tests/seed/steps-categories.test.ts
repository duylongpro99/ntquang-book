import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedCategories } from '../../scripts/seed/steps/categories';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('seedCategories', () => {
  it('creates all nodes and links children to their parent', async () => {
    const count = await seedCategories(strapi);
    expect(count).toBe(56);
    const all = await strapi.documents('api::category.category').findMany({ pagination: { limit: -1 } });
    expect(all).toHaveLength(56);

    const child = await strapi.documents('api::category.category').findFirst({
      filters: { slug: 'noi-khoa/noi-tong-quat' }, populate: ['parent'],
    });
    expect(child?.name).toBe('Nội tổng quát');
    expect((child as any)?.parent?.slug).toBe('noi-khoa');

    const top = await strapi.documents('api::category.category').findFirst({
      filters: { slug: 'sach-tieng-anh' }, populate: ['parent'],
    });
    expect((top as any)?.parent ?? null).toBeNull(); // top-level, no parent
  });

  it('is idempotent (second run: still 56, no duplicates)', async () => {
    await seedCategories(strapi);
    const all = await strapi.documents('api::category.category').findMany({ pagination: { limit: -1 } });
    expect(all).toHaveLength(56);
  });
});
