import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('publisher content type', () => {
  it('is registered with name + slug', () => {
    const ct = strapi.contentType('api::publisher.publisher');
    expect(ct.attributes.name.type).toBe('string');
    expect(ct.attributes.slug.type).toBe('uid');
  });
  it('accepts a create', async () => {
    const p = await strapi.documents('api::publisher.publisher').create({
      data: { name: 'NXB Test', slug: 'nxb-test' },
    });
    expect(p.name).toBe('NXB Test');
  });
});
