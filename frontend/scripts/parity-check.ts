// Compares repository output against the (about-to-be-removed) hardcoded arrays.
import { BOOKS_DATA } from "@/src/data/books";
import { ARTICLES_DATA } from "@/src/data/articles";
import { getBookBySlug } from "@/src/lib/cms/books";
import { getArticleBySlug } from "@/src/lib/cms/articles";

function sortObj(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortObj);
  if (v && typeof v === "object")
    return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, sortObj((v as any)[k])]));
  return v;
}
const eq = (a: unknown, b: unknown) => JSON.stringify(sortObj(a)) === JSON.stringify(sortObj(b));

async function main() {
  const errors: string[] = [];
  for (const src of BOOKS_DATA) {
    const got = await getBookBySlug(src.slug);
    const { id: _s, ...srcNoId } = src;
    const { id: _g, ...gotNoId } = got ?? ({} as any);
    if (!got) { errors.push(`book ${src.slug}: not found`); continue; }
    if (!eq(gotNoId, srcNoId)) errors.push(`book ${src.slug}: mismatch\n  src: ${JSON.stringify(srcNoId)}\n  got: ${JSON.stringify(gotNoId)}`);
  }
  for (const src of ARTICLES_DATA) {
    const got = await getArticleBySlug(src.slug);
    const { id: _s, ...srcNoId } = src;
    const { id: _g, ...gotNoId } = got ?? ({} as any);
    if (!got) { errors.push(`article ${src.slug}: not found`); continue; }
    if (!eq(gotNoId, srcNoId)) errors.push(`article ${src.slug}: mismatch\n  src: ${JSON.stringify(srcNoId)}\n  got: ${JSON.stringify(gotNoId)}`);
  }
  if (errors.length) { console.error(`PARITY FAILED (${errors.length}):\n${errors.join("\n")}`); process.exit(1); }
  console.log(`Parity OK: ${BOOKS_DATA.length} books, ${ARTICLES_DATA.length} articles match.`);
}
main();
