---
name: cris-re-features
description: Step 01 of the reverse-engineering pipeline. Turn raw recon evidence into a master feature inventory with per-feature confidence, role and pricing tier, and report the inferred-vs-observed ratio that quantifies how much of the system is invisible to casual browsing. Use after cris-re-recon, or when the user asks "what features does this product actually have" / "tinh nang an" / "feature inventory".
---

# cris-re-features — the master inventory

Read `../cris-reverse-engineer/references/conventions.md` first.

**Input:** `out/<slug>/00-recon/`. If it is missing, run `cris-re-recon` first — this step has
nothing to interpret without evidence.

**This is the most important artifact in the whole pipeline.** It is the answer to "what
features exist that I did not notice".

## Procedure

1. **Cluster the string corpus.** Group `strings.txt` by key namespace (or by semantic
   cluster when keys are absent). Each cluster of >8 related strings is a candidate feature.
2. **Cluster the routes.** Each route is a feature or a sub-view of one.
3. **Cluster the endpoints.** Group `endpoints.csv` by resource path. Each resource with
   write verbs is a feature.
4. **Overlay the pricing matrix.** It names features in their own words and assigns tiers.
5. **Overlay the changelog.** Gives ship dates; distinguishes core from recent bolt-on.
6. **Reconcile.** Merge the clusters into one row per feature. A feature usually shows up
   in 3-4 sources at once; that convergence is what makes it `inferred` rather than `guessed`.
7. **Grade every row** with `observed` / `inferred` / `guessed` per conventions.
8. **Write `EVIDENCE-BASIS.md`** in the exact shape given in conventions. This block is
   inlined verbatim by `cris-re-product`, `cris-re-ux` and `cris-re-ui`; it is how the confidence ceiling
   reaches the people making the build decision instead of dying in `coverage.md`.
9. **Write `coverage.md`** — anything from recon that did NOT map to a feature row. Unmapped
   routes, orphan endpoints, string namespaces with no home. These are your blind spots and
   they matter as much as the inventory itself.

## Output

`out/<slug>/01-features/features.csv` — use `templates/features.csv` as the header.

Columns:

| Column | Meaning |
|---|---|
| `id` | stable slug, e.g. `billing.invoices` |
| `area` | top-level grouping (matches i18n namespace where possible) |
| `feature` | short name, in YOUR words not their marketing words |
| `description` | one line: what a user can do |
| `evidence` | semicolon-joined sources: `strings:billing.*(47); route:/billing; endpoint:GET /api/invoices; pricing:Pro` |
| `entity` | primary domain object touched (fills in during `cris-re-domain`; leave blank if unknown) |
| `roles` | which roles can use it, or `unknown` |
| `tier` | pricing tier that gates it, or `all` / `unknown` |
| `confidence` | `observed` \| `inferred` \| `guessed` |
| `proof` | **required when `confidence=observed`** — screenshot path, flow doc section, or captured request. Empty proof means the row is not observed; downgrade it. |
| `first_seen` | changelog date if known |
| `verdict` | `copy` \| `drop` \| `differentiate` \| `undecided` — the user's call, default `undecided` |
| `notes` | anything odd |

Expect **80-200 rows** for a mature SaaS.

## The headline number

**Load-bearing — see conventions.** This is the deliverable, not a footnote. It goes in `EVIDENCE-BASIS.md`, `coverage.md` and
MANIFEST.md:

```
observed   48   (29%)   <- what you would find by clicking around
inferred  115   (70%)
guessed     2   ( 1%)
ratio  inferred+guessed : observed  =  2.4 : 1
```

Typical is 2:1 to 3:1. If you got close to 1:1, either the product is genuinely small or
recon under-delivered — check `recon-report.md` for blocked sources and say which.

## Definition of done

- Every route in `routes.txt` maps to a feature row, or is listed in `coverage.md` with a reason.
- Every string namespace with >8 keys maps to a row, or appears in `coverage.md`.
- Every write-verb endpoint maps to a row, or appears in `coverage.md`.
- No row is `observed` unless it was genuinely exercised in a live session **and** carries a
  non-empty `proof`. Verify mechanically:
  `awk -F, '$9=="observed" && $10==""' features.csv` must return nothing.
- `EVIDENCE-BASIS.md` exists and names every blocked source from `recon-report.md`.
- MANIFEST.md updated with the headline counts.

## Do not

- Do not use their marketing names for features. Rename in neutral terms — it keeps you
  from inheriting their framing, and it is the first small step of the clean-room boundary.
- Do not silently drop low-confidence rows. A `guessed` row flagged as such is useful;
  a deleted one is a blind spot you cannot see.
