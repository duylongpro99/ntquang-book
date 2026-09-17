import type { Schema, Struct } from '@strapi/strapi';

export interface BrandingThemeTokens extends Struct.ComponentSchema {
  collectionName: 'components_branding_theme_tokens';
  info: {
    displayName: 'Theme Tokens';
    icon: 'paint';
  };
  attributes: {
    accent: Schema.Attribute.String & Schema.Attribute.Required;
    accentContrast: Schema.Attribute.String & Schema.Attribute.Required;
    bg: Schema.Attribute.String & Schema.Attribute.Required;
    border: Schema.Attribute.String & Schema.Attribute.Required;
    danger: Schema.Attribute.String & Schema.Attribute.Required;
    focusRing: Schema.Attribute.String & Schema.Attribute.Required;
    info: Schema.Attribute.String & Schema.Attribute.Required;
    primary: Schema.Attribute.String & Schema.Attribute.Required;
    primaryContrast: Schema.Attribute.String & Schema.Attribute.Required;
    primaryHover: Schema.Attribute.String & Schema.Attribute.Required;
    success: Schema.Attribute.String & Schema.Attribute.Required;
    surface: Schema.Attribute.String & Schema.Attribute.Required;
    surfaceMuted: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.String & Schema.Attribute.Required;
    textMuted: Schema.Attribute.String & Schema.Attribute.Required;
    warning: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TocLine extends Struct.ComponentSchema {
  collectionName: 'components_toc_lines';
  info: {
    displayName: 'TOC Line';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'branding.theme-tokens': BrandingThemeTokens;
      'toc.line': TocLine;
    }
  }
}
