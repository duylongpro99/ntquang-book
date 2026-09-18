/** Refuse to seed against a non-sqlite DB unless explicitly forced. */
export function assertSafeDatabase(
  client: string,
  opts: { force?: boolean; allowProd?: boolean },
): void {
  if (client === 'sqlite') return;
  if (opts.force || opts.allowProd) return;
  throw new Error(
    `Refusing to seed against DATABASE_CLIENT="${client}". ` +
      `Pass --force or set SEED_ALLOW_PROD=1 to override.`,
  );
}
