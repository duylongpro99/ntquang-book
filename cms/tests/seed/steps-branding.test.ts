import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { clearSeedData } from '../helpers/clear-seed-data';
import { seedBranding } from '../../scripts/seed/steps/branding';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
beforeAll(async () => { await clearSeedData(strapi); });
afterAll(async () => { await teardownStrapi(); });

describe('seedBranding', () => {
  it('populates the single type with light/dark token sets', async () => {
    await seedBranding(strapi);
    const b = await strapi.documents('api::branding.branding').findFirst({ populate: ['light', 'dark'] });
    expect(b?.name).toBe('Oxford Medical Sapphire');
    expect(b?.accentLabel).toBe('Xanh Sapphire Y Khoa');
    expect((b as any).light.primary).toBe('#1d4ed8');
    expect((b as any).light.focusRing).toBe('#3b82f6');
    expect((b as any).dark.primary).toBe('#3b82f6');
    expect((b as any).dark.accentContrast).toBe('#0b1120');
  });

  it('is idempotent (single type stays single)', async () => {
    await seedBranding(strapi);
    const all = await strapi.documents('api::branding.branding').findMany({});
    expect(all.length).toBeLessThanOrEqual(1);
    const b = await strapi.documents('api::branding.branding').findFirst({ populate: ['light'] });
    expect((b as any).light.primary).toBe('#1d4ed8'); // converged, not duplicated
  });
});
