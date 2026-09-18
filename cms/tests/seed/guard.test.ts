import { assertSafeDatabase } from '../../scripts/seed/guard';

describe('assertSafeDatabase', () => {
  it('allows sqlite', () => {
    expect(() => assertSafeDatabase('sqlite', {})).not.toThrow();
  });
  it('refuses postgres by default', () => {
    expect(() => assertSafeDatabase('postgres', {})).toThrow(/refus|prod|force/i);
  });
  it('allows postgres with --force', () => {
    expect(() => assertSafeDatabase('postgres', { force: true })).not.toThrow();
  });
  it('allows postgres with allowProd', () => {
    expect(() => assertSafeDatabase('postgres', { allowProd: true })).not.toThrow();
  });
});
