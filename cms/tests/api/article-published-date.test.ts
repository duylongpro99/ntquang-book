import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('article.publishedDate', () => {
  it('is an additive date attribute', () => {
    const ct = strapi.contentType('api::article.article');
    expect(ct.attributes.publishedDate).toBeDefined();
    expect(ct.attributes.publishedDate.type).toBe('date');
  });

  it('stores an ISO date and returns it verbatim', async () => {
    const a = await strapi.documents('api::article.article').create({
      data: { title: 'PD One', slug: 'pd-one', publishedDate: '2024-02-25' },
      status: 'published',
    });
    expect(a.publishedDate).toBe('2024-02-25');
  });
});
