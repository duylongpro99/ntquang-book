import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;

beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('author content type', () => {
  it('is registered with the expected attributes', () => {
    const ct = strapi.contentType('api::author.author');
    expect(ct).toBeTruthy();
    expect(ct.attributes.name.type).toBe('string');
    expect(ct.attributes.slug.type).toBe('uid');
    expect(ct.attributes.bio.type).toBe('text');
    expect(ct.attributes.avatar.type).toBe('media');
  });

  it('accepts a create via the document service', async () => {
    const created = await strapi.documents('api::author.author').create({
      data: { name: 'Author T1', slug: 'author-t1' },
    });
    expect(created.name).toBe('Author T1');
    expect(created.slug).toBe('author-t1');
  });
});
