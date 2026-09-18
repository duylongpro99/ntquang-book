import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { clearSeedData } from '../helpers/clear-seed-data';
import { runSeed } from '../../scripts/seed';
import { verify } from '../../scripts/seed-verify';

let strapi: Core.Strapi;
beforeAll(async () => {
  strapi = await setupStrapi();
  await clearSeedData(strapi);
  await runSeed(strapi);
});
afterAll(async () => { await teardownStrapi(); });

describe('verify', () => {
  it('passes cleanly after a real seed', async () => {
    const result = await verify(strapi);
    if (!result.ok) throw new Error('verify errors:\n' + result.errors.join('\n'));
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
