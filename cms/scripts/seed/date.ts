/** 'dd/mm/yyyy' → 'yyyy-mm-dd'. Throws on anything else. */
export function parseSeedDate(input: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) throw new Error(`Unparseable seed date (expected dd/mm/yyyy): ${input}`);
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

/** 'yyyy-mm-dd' → 'dd/mm/yyyy'. Inverse of parseSeedDate; used by reflatten/verify. */
export function formatSeedDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) throw new Error(`Unparseable ISO date (expected yyyy-mm-dd): ${iso}`);
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
}
