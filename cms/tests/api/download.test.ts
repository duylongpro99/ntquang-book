import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('download content type', () => {
  it('relates to user and book with a snapshot title', () => {
    const ct = strapi.contentType('api::download.download');
    expect((ct.attributes.user as any).target).toBe('plugin::users-permissions.user');
    expect((ct.attributes.book as any).target).toBe('api::book.book');
    expect(ct.attributes.downloadedAt.type).toBe('datetime');
    expect(ct.attributes.bookTitle.type).toBe('string');
  });
});
