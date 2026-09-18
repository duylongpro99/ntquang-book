import type { Core } from '@strapi/strapi';

/**
 * Upsert a document by a natural key.
 * - Looks up an existing doc by { [key]: keyValue }.
 * - Updates it in place if found, else creates it (merging the key into data).
 * - For draft/publish types, pass { publish: true } to write status:'published'.
 * Returns the stable documentId so callers can wire relations.
 */
export async function upsertByKey(
  strapi: Core.Strapi,
  uid: string,
  key: string,
  keyValue: string,
  data: Record<string, unknown>,
  opts: { publish?: boolean } = {},
): Promise<{ documentId: string }> {
  const status = opts.publish ? ('published' as const) : undefined;
  const existing = await strapi
    .documents(uid as any)
    .findFirst({ filters: { [key]: keyValue } as any });

  if (existing) {
    const updated = await strapi
      .documents(uid as any)
      .update({ documentId: existing.documentId, data: data as any, ...(status ? { status } : {}) });
    // `update` can type as nullable even though we just confirmed the doc exists;
    // documentId is stable across updates, so fall back to the id we already have.
    return { documentId: updated?.documentId ?? existing.documentId };
  }

  const created = await strapi
    .documents(uid as any)
    .create({ data: { ...data, [key]: keyValue } as any, ...(status ? { status } : {}) });
  return { documentId: created.documentId };
}
