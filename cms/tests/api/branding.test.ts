import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('branding single type', () => {
  it('is a single type with light/dark token components', () => {
    const ct = strapi.contentType('api::branding.branding');
    expect(ct.kind).toBe('singleType');
    expect((ct.attributes.light as any).component).toBe('branding.theme-tokens');
    expect((ct.attributes.dark as any).component).toBe('branding.theme-tokens');
  });

  it('accepts a full light/dark token set', async () => {
    const tokens = {
      bg: '#f8fafc', surface: '#ffffff', surfaceMuted: '#f1f5f9', border: '#e2e8f0',
      text: '#0f172a', textMuted: '#475569', primary: '#1d4ed8', primaryHover: '#1e40af',
      primaryContrast: '#ffffff', accent: '#d97706', accentContrast: '#ffffff', success: '#16a34a',
      warning: '#d97706', danger: '#dc2626', info: '#0284c7', focusRing: '#3b82f6',
    };
    // NOTE: strapi.documents('api::branding.branding').update({ documentId: undefined, ... })
    // returns null for this single type in the installed API version (Strapi 5's document
    // service does not create-or-update the singleton via that form here), and the brief's
    // other suggested fallback, strapi.db.query(...).create(), does not populate/persist
    // component data at all (it returns light/dark as null immediately). We fall back to
    // strapi.entityService.create(), which correctly creates the nested components, then
    // read it back via the document service to keep the assertions identical.
    await (strapi as any).entityService.create('api::branding.branding', {
      data: { name: 'Oxford Medical Sapphire', accentLabel: 'Xanh Sapphire Y Khoa', light: tokens, dark: tokens },
      populate: ['light', 'dark'],
    });
    const entry = await strapi.documents('api::branding.branding').findFirst({
      populate: ['light', 'dark'],
    });
    expect((entry as any).light.primary).toBe('#1d4ed8');
    expect((entry as any).dark.focusRing).toBe('#3b82f6');
  });
});
