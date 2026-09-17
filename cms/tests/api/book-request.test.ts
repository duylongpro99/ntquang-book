import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('book-request content type', () => {
  it('has the status enum defaulting to submitted', () => {
    const ct = strapi.contentType('api::book-request.book-request');
    expect(ct.attributes.status.type).toBe('enumeration');
    expect((ct.attributes.status as any).enum).toEqual(['submitted', 'in_review', 'fulfilled', 'rejected']);
    expect((ct.attributes.status as any).default).toBe('submitted');
  });
  it('defaults status when omitted', async () => {
    const r = await strapi.documents('api::book-request.book-request').create({
      data: { title: 'Sách cần tìm', language: 'Tiếng Việt' },
    });
    expect(r.status).toBe('submitted');
  });
});
