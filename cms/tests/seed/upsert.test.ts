import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { upsertByKey } from '../../scripts/seed/upsert';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('upsertByKey', () => {
  it('creates a non-draft entity, then updates it in place (no duplicate)', async () => {
    const first = await upsertByKey(strapi, 'api::publisher.publisher', 'name', 'Upsert Pub',
      { name: 'Upsert Pub', slug: 'upsert-pub' });
    const second = await upsertByKey(strapi, 'api::publisher.publisher', 'name', 'Upsert Pub',
      { name: 'Upsert Pub', slug: 'upsert-pub-v2' });
    expect(second.documentId).toBe(first.documentId);
    const rows = await strapi.documents('api::publisher.publisher').findMany({ filters: { name: 'Upsert Pub' } });
    expect(rows).toHaveLength(1);
    expect(rows[0].slug).toBe('upsert-pub-v2'); // converged to latest data
  });

  it('creates a draft/publish entity as published and finds it on re-run', async () => {
    const a = await upsertByKey(strapi, 'api::book.book', 'sku', 'SKU-UPS-1',
      { title: 'Ups Book', slug: 'ups-book', sku: 'SKU-UPS-1', downloadCount: 1 }, { publish: true });
    const b = await upsertByKey(strapi, 'api::book.book', 'sku', 'SKU-UPS-1',
      { title: 'Ups Book', slug: 'ups-book', sku: 'SKU-UPS-1', downloadCount: 2 }, { publish: true });
    expect(b.documentId).toBe(a.documentId);
    const published = await strapi.documents('api::book.book').findMany({ status: 'published', filters: { sku: 'SKU-UPS-1' } });
    expect(published).toHaveLength(1);
    expect(published[0].downloadCount).toBe(2);
  });
});
