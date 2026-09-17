import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('category content type', () => {
  it('has a plain-string path slug and a self parent relation', () => {
    const ct = strapi.contentType('api::category.category');
    expect(ct.attributes.slug.type).toBe('string');
    expect(ct.attributes.parent.type).toBe('relation');
    expect((ct.attributes.parent as any).target).toBe('api::category.category');
  });

  it('preserves a path-style slug and links parent → child', async () => {
    const parent = await strapi.documents('api::category.category').create({
      data: { name: 'Nội Khoa', slug: 'noi-khoa' },
    });
    const child = await strapi.documents('api::category.category').create({
      data: { name: 'Nội tim mạch', slug: 'noi-khoa/noi-tim-mach', parent: parent.documentId },
      populate: ['parent'],
    });
    expect(child.slug).toBe('noi-khoa/noi-tim-mach');
    expect((child as any).parent.slug).toBe('noi-khoa');
  });
});
