import type { Core } from '@strapi/strapi';
import { CATEGORIES_TREE, type CategoryItem } from '../source';
import { upsertByKey } from '../upsert';

const UID = 'api::category.category';

/**
 * Two-pass seed of the book category tree.
 * Pass 1: upsert every node by slug (name + slug only; `count` is ignored — derived in Phase 3).
 * Pass 2: set each child's `parent` relation from the tree nesting.
 */
export async function seedCategories(strapi: Core.Strapi): Promise<number> {
  // Pass 1 — create/update all nodes, remember documentId by slug.
  const idBySlug = new Map<string, string>();
  const upsertNode = async (node: CategoryItem) => {
    const { documentId } = await upsertByKey(strapi, UID, 'slug', node.slug, {
      name: node.name,
      slug: node.slug,
    });
    idBySlug.set(node.slug, documentId);
  };

  for (const top of CATEGORIES_TREE) {
    await upsertNode(top);
    for (const child of top.children ?? []) {
      await upsertNode(child);
    }
  }

  // Pass 2 — link children to their top-level parent.
  for (const top of CATEGORIES_TREE) {
    const parentId = idBySlug.get(top.slug)!;
    for (const child of top.children ?? []) {
      const childId = idBySlug.get(child.slug)!;
      await strapi.documents(UID).update({ documentId: childId, data: { parent: parentId } as any });
    }
  }

  return idBySlug.size;
}
