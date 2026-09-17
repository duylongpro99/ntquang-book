import type { Core } from '@strapi/strapi';

const PUBLIC_READ: Record<string, string[]> = {
  'api::book.book': ['find', 'findOne'],
  'api::article.article': ['find', 'findOne'],
  'api::category.category': ['find', 'findOne'],
  'api::article-category.article-category': ['find', 'findOne'],
  'api::author.author': ['find', 'findOne'],
  'api::publisher.publisher': ['find', 'findOne'],
  'api::branding.branding': ['find'],
};

async function setPublicReadPermissions(strapi: Core.Strapi): Promise<void> {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  for (const [uid, actions] of Object.entries(PUBLIC_READ)) {
    for (const action of actions) {
      const actionId = `${uid}.${action}`;
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: actionId, role: publicRole.id } });
      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action: actionId, role: publicRole.id } });
      }
    }
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setPublicReadPermissions(strapi);
  },
};
