import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('article-category content type', () => {
  it('is registered with name + slug', () => {
    const ct = strapi.contentType('api::article-category.article-category');
    expect(ct.attributes.name.type).toBe('string');
    expect(ct.attributes.slug.type).toBe('uid');
  });
  it('accepts a create', async () => {
    const c = await strapi.documents('api::article-category.article-category').create({
      data: { name: 'Kiến thức y học', slug: 'kien-thuc-y-hoc' },
    });
    expect(c.name).toBe('Kiến thức y học');
  });
});
