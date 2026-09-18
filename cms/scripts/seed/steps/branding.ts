import type { Core } from '@strapi/strapi';
import { DEFAULT_THEME } from '../source';

const UID = 'api::branding.branding';

/**
 * Populate the branding single type from DEFAULT_THEME. The theme's light/dark
 * ColorTokens are a 1:1 match for the branding.theme-tokens component's 16 fields,
 * so they can be assigned directly. Upsert-in-place (single type).
 */
export async function seedBranding(strapi: Core.Strapi): Promise<void> {
  const data = {
    name: DEFAULT_THEME.name,
    description: DEFAULT_THEME.description,
    accentLabel: DEFAULT_THEME.accentLabel,
    light: { ...DEFAULT_THEME.light },
    dark: { ...DEFAULT_THEME.dark },
  };

  const existing = await strapi.documents(UID).findFirst({});
  if (existing) {
    await strapi.documents(UID).update({ documentId: existing.documentId, data: data as any });
  } else {
    await strapi.documents(UID).create({ data: data as any });
  }
}
