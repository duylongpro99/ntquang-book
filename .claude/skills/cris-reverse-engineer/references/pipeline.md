# Pipeline contracts

## Step contracts

Each step declares what it reads, what it writes, and what makes it done. A step that cannot
meet its contract writes `partial` to MANIFEST.md and names the blocker.

| Step | Reads | Writes | Done when |
|---|---|---|---|
| 00 `cris-re-recon` | reference URL | `00-recon/*` | `AUTHORIZATION` block recorded; `strings.txt` greppable; every route marked nav or orphan-candidate; blocked sources listed |
| 01 `cris-re-features` | `00-recon/*` | `01-features/*` incl. `EVIDENCE-BASIS.md` | every route, string namespace >8 keys, and write-endpoint maps to a row or to `coverage.md`; no `observed` row without `proof` |
| 02 `cris-re-domain` | `00-recon/*`, `features.csv` | `02-domain/*`, updates `features.csv.entity` | every endpoint maps to one (entity, action); every enum has a state machine |
| 03 `cris-re-ia` | `routes.txt`, `features.csv`, `entities.csv` | `03-ia/*` | every route is a screen row or an orphan entry; ≤8 patterns |
| 04 `cris-re-product` | 01-03 + user answers | `04-product/*` | basis block inlined as §0; every feature in exactly one MVP column with a reason; `Now` <40% or justified; naive-reader check run |
| 05 `cris-re-ux` | 01-03, `strings.txt` | `05-ux/*` or `05-ux/BRIEF.md` | ≥4 branches per probed feature; step counts recorded |
| 06 `cris-re-ui` | `patterns.md`, `screens.csv`, `states.md` | `06-ui/*` + canvas URL | every MVP screen maps to a pattern with a hi-fi exemplar |

## Gates

Hard stops requiring user input before proceeding:

**Gate 0 — before 00 fetches anything.** Authorization. Fill the `AUTHORIZATION` block from
conventions with the user and write it into `recon-report.md`. Relationship to the target,
whether the ToS was reviewed, whether automated access and competitive analysis are
permitted, prohibited or silent, and the basis to proceed.

"Silent" is a normal answer people proceed on, and the decision is the user's. But it must be
*recorded*, because it is the first question a legal reviewer asks and it costs one line now
versus a reconstruction later. Where automated access is prohibited, 00 runs manual-only and
the restriction becomes a blocked source like any other.

**Gate A — after 01.** Present:
```
Features found:  163
  observed        48  (29%)
  inferred       115  (70%)
  guessed          2  ( 1%)
Blind spots (coverage.md): 7 unmapped routes, 3 orphan endpoints
```
Then ask: continue to the domain model, or is this already enough to make the go/no-go call?

Also confirm `EVIDENCE-BASIS.md` reads accurately — it is about to be inlined, unchanged,
into every downstream artifact.

**Gate B — after 04.** Present the three MVP columns with counts. The cut line is a business
decision. Do not proceed to UX/UI against an unapproved scope.

**Gate C — mid-06.** Lo-fi wireframe review before hi-fi.

Soft checkpoints (report, then continue): after 00, 02, 03, 05.

## Prerequisite failures

If a step's input is missing, say which step produces it and offer to run that first. Do not
improvise the missing artifact — a fabricated `features.csv` poisons every downstream step
and the damage is invisible until the build starts.

## Large targets — chunking and budget

A mature SaaS yields 2,000-4,000 strings, 150-300 endpoints and 100-200 features. That does
not fit one context, and naive linear processing burns budget producing worse results than
chunked processing.

**Chunk `strings.txt` by namespace, never by line count.** Namespaces are the natural feature
boundary; splitting mid-namespace destroys the clustering signal that step 01 depends on.

```bash
cut -f1 strings.txt | cut -d. -f1 | sort | uniq -c | sort -rn   # namespace census first
```

Process the top ~20 namespaces as units; sweep the long tail together in one pass.

**Per-subagent slice for concurrent 01/02/03:** give each a namespace slice plus the *whole*
`routes.txt` and `endpoints.csv` (both small, and both needed for cross-referencing). Never
slice routes or endpoints — a subagent that sees a partial route list will report false
orphans.

**Rough budget per run:** 00 is cheap and mostly shell. 01-03 scale with corpus size — expect
the bulk of the spend here on a large target; chunk before parallelizing, not after. 05 is the
most expensive per feature because it is live browsing; that is why it delegates via `BRIEF.md`.

If the corpus is large enough that step 01 would need more than ~6 subagent slices, say so to
the user before starting and offer to restrict scope to the top N namespaces by key count —
a deliberately partial inventory beats an exhausted one.

## Known failure modes

| Symptom | Likely cause | Response |
|---|---|---|
| `strings.txt` under 200 lines | inline string table, not the real corpus | try locale-file paths again; record as `partial` |
| observed:inferred near 1:1 | recon under-delivered | re-check blocked sources before trusting the ratio |
| >8 layout patterns in 03 | over-splitting | merge until ≤8 |
| `Now` column >40% in 04 | cloning, not scoping | tell the user plainly |
| <4 branches per flow in 05 | shallow probing | re-run the skipped probes from the 12-probe protocol |
| >50 components in 06 | cataloguing instances | abstract and merge |
| `observed` rows with empty `proof` | silent promotion during unattended 00-03 | downgrade to `inferred`, regenerate `EVIDENCE-BASIS.md`; run the awk check in `cris-re-features` |
| PRD reads authoritative on a mostly-inferred base | basis block missing or stale | regenerate and re-inline into §0, ux-spec, design-notes |
| Basis block disagrees with `features.csv` | a later step exercised features and the block was not regenerated | regenerate; stale is worse than absent |

## Cost shape

Rough effort, for setting expectations:

- 00-01: hours. Mostly automated. Highest value per unit of effort in the pipeline.
- 02-03: hours to a day. Needs judgement; parallelizes well.
- 04: a working session with the user. Cannot be automated — it encodes their decisions.
- 05: a day of live probing per 5-7 features. The most expensive step; delegate to a
  dedicated browsing agent via `BRIEF.md`.
- 06: days. Bounded by pattern count, not screen count.
