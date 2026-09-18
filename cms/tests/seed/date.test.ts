import { parseSeedDate, formatSeedDate } from '../../scripts/seed/date';

describe('parseSeedDate', () => {
  it.each([
    ['25/02/2024', '2024-02-25'],
    ['05/02/2024', '2024-02-05'],
    ['18/02/2024', '2024-02-18'],
  ])('%s → %s', (input, expected) => {
    expect(parseSeedDate(input)).toBe(expected);
  });
  it('throws on a malformed date', () => {
    expect(() => parseSeedDate('2024-02-25')).toThrow();
    expect(() => parseSeedDate('bogus')).toThrow();
  });
});

describe('formatSeedDate (inverse)', () => {
  it('round-trips', () => {
    expect(formatSeedDate('2024-02-25')).toBe('25/02/2024');
    expect(parseSeedDate(formatSeedDate('2024-02-05'))).toBe('2024-02-05');
  });
});
