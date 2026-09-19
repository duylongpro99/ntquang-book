// Seed source data — vendored into the CMS so the seed is self-contained and
// reproducible on a fresh checkout/deploy. These files were the frontend's
// original hardcoded catalog (removed from the frontend in Phase 3 once the
// site became CMS-driven); the CMS now owns them as the one-time seed source.
export { BOOKS_DATA, type Book } from './data/books';
export { ARTICLES_DATA, type Article } from './data/articles';
export { CATEGORIES_TREE, type CategoryItem } from './data/categories';
export { DEFAULT_THEME, type ThemeConfig, type ColorTokens } from './data/theme';
