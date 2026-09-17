import { createStrapi, compileStrapi } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

let instance: Core.Strapi | null = null;

export async function setupStrapi(): Promise<Core.Strapi> {
  if (!instance) {
    const appContext = await compileStrapi();
    instance = await createStrapi(appContext).load();
    await instance.server.mount();
  }
  return instance;
}

export async function teardownStrapi(): Promise<void> {
  if (instance) {
    await instance.destroy();
    instance = null;
  }
}
