import request from 'supertest';
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('public read permissions', () => {
  it('serves published books but hides drafts over public REST', async () => {
    await strapi.documents('api::book.book').create({ data: { title: 'Vis', slug: 'vis-book', sku: 'SKU-VIS-1' }, status: 'published' });
    await strapi.documents('api::book.book').create({ data: { title: 'Hid', slug: 'hid-book', sku: 'SKU-HID-1' }, status: 'draft' });
    const res = await request(strapi.server.httpServer)
      .get('/api/books?filters[sku][$in][0]=SKU-VIS-1&filters[sku][$in][1]=SKU-HID-1');
    expect(res.status).toBe(200);
    const skus = res.body.data.map((b: any) => b.sku);
    expect(skus).toContain('SKU-VIS-1');
    expect(skus).not.toContain('SKU-HID-1');
  });

  it('forbids public access to downloads', async () => {
    const res = await request(strapi.server.httpServer).get('/api/downloads');
    expect(res.status).toBe(403);
  });

  it('answers a GraphQL query for books', async () => {
    const res = await request(strapi.server.httpServer)
      .post('/graphql')
      .send({ query: '{ books { documentId title } }' });
    expect(res.status).toBe(200);
    expect(res.body.data.books).toBeDefined();
  });
});
