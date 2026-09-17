import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('user extension', () => {
  it('keeps built-in fields and adds profile fields', () => {
    const ct = strapi.contentType('plugin::users-permissions.user');
    expect(ct.attributes.email.type).toBe('email'); // built-in preserved
    expect((ct.attributes.role as any).relation).toBe('manyToOne');
    expect((ct.attributes.role as any).target).toBe('plugin::users-permissions.role');
    expect((ct.attributes.password as any).private).toBe(true);
    expect(ct.attributes.hospital.type).toBe('string');
    expect(ct.attributes.specialty.type).toBe('string');
    expect(ct.attributes.avatar.type).toBe('media');
    expect(ct.attributes.joinedDate.type).toBe('date');
  });
});
