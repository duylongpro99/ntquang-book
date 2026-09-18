import type { Core } from '@strapi/strapi';

/**
 * Placeholder to satisfy `scripts/seed.ts`'s `--verify` dynamic import at compile
 * time. The real implementation (per-collection counts + re-flatten deep-equal
 * against source data) lands in Task 12 and will replace this stub in full.
 */
export async function verify(_strapi: Core.Strapi): Promise<{ ok: boolean; errors: string[] }> {
  return { ok: true, errors: [] };
}
