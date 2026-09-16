# MANIFEST — downloadsachyhoc-com

Reference: https://downloadsachyhoc.com/
Goal: Parity clone (simplified) · Depth: full pipeline 00–06 · Access: 1 logged-in account

**Scope decisions:** no membership tiers · no payment · no social login · no marketing-page.
Access is **binary** — browse is public; download requires a username+password login and nothing
more; any logged-in account downloads any book. Reference tier/payment/OAuth machinery is retained
in 00–02 as reconnaissance (marked out-of-scope), not built.

| Step | Skill | Status | When | Key output |
|------|-------|--------|------|------------|
| 00 | cris-re-recon | partial | 2026-09-16 | WP+Woo store; ~1085 books, 79 cats, 666 authors, 4 tiers; auth surface not captured (logged out) |
| 01 | cris-re-features | done | 2026-09-16 | 49 features (19 obs / 27 inf / 3 guess), ratio 1.6:1 |
| 02 | cris-re-domain | done | 2026-09-16 | 18 entities, 5 state machines, 17 events; features→52 (ratio 1.7:1) |
| 03 | cris-re-ia | done | 2026-09-16 | 24 screens, 6 patterns (marketing-page/tier/payment screens removed), 8 orphan routes |
| 04 | cris-re-product | done | 2026-09-16 | PRD + MVP cut (Now 21/52=40%; tiers+payment+social-login+marketing OUT → 15 Never); Gate B approved; + build docs: architecture.md (STACK DECIDED: Next.js 16/TS 7 · Strapi 5 CMS · Postgres · R2 PDFs(private,presigned)+covers(public) · Postgres FTS · own user+pw auth · VPS · no email v1) + roadmap.md (4 phases, R1/R5-gated) |
| 05 | cris-re-ux | partial | 2026-09-16 | UX spec from evidence (public flows observed); binary login-gate; member flows inferred; BRIEF.md handoff for R1 only |
| 06 | cris-re-ui | done | 2026-09-16 | tokens + 24 components + 11 lo-fi (wireframes.html) + 4 hi-fi exemplars (hifi/); no tiers/payment/social-login; all local files |

## Gates
- Gate 0 (before 00): authorization recorded — DONE (see 00-recon/recon-report.md)
- Gate A (after 01): show observed/inferred ratio + total — AT GATE (awaiting user go/no-go)
- Gate B (after 04): MVP cut line approval — APPROVED as-is (2026-09-16); step 05 without login (BRIEF.md handoff)
- Gate C (mid 06): lo-fi wireframe review — APPROVED (2026-09-16); hi-fi built; no payment integration
