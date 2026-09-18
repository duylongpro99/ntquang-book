import { BOOKS_DATA, ARTICLES_DATA, CATEGORIES_TREE, DEFAULT_THEME } from '../../scripts/seed/source';

describe('seed source re-export', () => {
  it('imports the frontend arrays with expected sizes', () => {
    expect(BOOKS_DATA).toHaveLength(12);
    expect(ARTICLES_DATA).toHaveLength(3);
    expect(CATEGORIES_TREE).toHaveLength(9); // top-level nodes
  });
  it('exposes DEFAULT_THEME with light and dark token sets', () => {
    expect(DEFAULT_THEME.name).toBe('Oxford Medical Sapphire');
    expect(DEFAULT_THEME.light.primary).toBe('#1d4ed8');
    expect(DEFAULT_THEME.dark.primary).toBe('#3b82f6');
  });
});
