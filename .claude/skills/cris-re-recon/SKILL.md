---
name: cris-re-recon
description: Step 00 of the reverse-engineering pipeline. Harvest raw evidence from a reference webapp - i18n string corpus, route manifest, source maps, API endpoints, pricing matrix, changelog, tech observations. Use when the user gives a reference URL and wants to discover what a webapp actually contains, including features not visible in the UI. Triggers on "recon", "thu thap bang chung", "phan tich site tham chieu", "what features does this site have".
---

# cris-re-recon — harvest the evidence

Read `../cris-reverse-engineer/references/conventions.md` first (slug, output layout, evidence
discipline, boundaries, browser rules). Then read `references/extraction-playbook.md` for
the concrete techniques.

**Goal of this step: raw material, not interpretation.** Do not classify features here.
Do not decide what matters. Dump everything, greppable, with provenance.

## Input

A reference URL. If the user has not given one, ask for it — this step cannot start without it.

Also settle these up front — they change the method, not just the output:

1. **Authorization.** Run the `AUTHORIZATION` block from conventions and write the answers
   into `recon-report.md` **before fetching anything**. This is a gate, not a formality: if
   the target's ToS prohibits automated access, step 00 drops to manual browsing with the
   user's own account plus public pages, and that restriction is recorded as a blocked source.
2. Do they have a login / trial account? If yes, is there a second account with a different role?
3. Is this a public SaaS, or something internal they own or are engaged to inspect?

## Procedure

Work the sources in ROI order. Each is independently valuable — a blocked source is a
recorded finding (`recon-report.md`), never a reason to abandon the step.

1. **Unauthenticated surface** — `robots.txt`, `sitemap.xml`, marketing pages, `/pricing`,
   docs/help center, changelog, status page.
2. **Bundle harvest** — fetch the app shell, extract script URLs, download them to `raw/`.
3. **Source maps** — try `<bundle>.js.map` for every bundle. If present, recover the module
   tree; this is the single highest-value artifact when available.
4. **i18n corpus** — locate locale files or inline string tables. Produce `strings.txt`.
5. **Route manifest** — framework-specific extraction into `routes.txt`.
6. **API surface** — schema endpoints first, then live traffic capture. Produce `endpoints.csv`.
7. **Feature flags** — grep bundles for flag names and flag-provider SDKs.
8. **Authenticated walkthrough** (only if the user has an account) — drive the browser
   through the app, capture network traffic, visit every settings page.

`references/extraction-playbook.md` has the commands and grep patterns for each.

## Outputs

Write to `out/<slug>/00-recon/` exactly as laid out in conventions. The required set:

| File | Must contain |
|---|---|
| `raw/` | every fetched bundle, map, sitemap, HAR |
| `strings.txt` | one label per line, deduped, sorted; prefix `key<TAB>value` when keys exist |
| `routes.txt` | one route per line; mark `[nav]` if reachable from primary navigation |
| `endpoints.csv` | `method,path,request_shape,response_shape,seen_from,auth_required` |
| `pricing-matrix.md` | feature x tier table, transcribed from the pricing page |
| `changelog.md` | dated feature list if a public changelog exists |
| `tech-observations.md` | polling vs websocket, pagination style, sync vs background jobs, auth model, multi-tenancy signals, file handling |
| `recon-report.md` | the `AUTHORIZATION` block, what was found, what was blocked and why, headline counts |

## Definition of done

- `recon-report.md` opens with a completed `AUTHORIZATION` block. An unrecorded answer fails
  this step even if every artifact is present.
- `strings.txt` is greppable and non-trivial (a real app yields 800-3,000 lines; under 200
  means you found an inline table, not the real corpus — say so).
- Every route in `routes.txt` is either marked `[nav]` or flagged as a candidate orphan.
- `recon-report.md` states the headline counts AND every source that was unavailable.
- MANIFEST.md updated.

## Do not

- Do not interpret, rank, or name features. That is `cris-re-features`.
- Do not fabricate counts. If source maps were stripped, say "source maps stripped" —
  an honest blocked source beats an invented module tree.
