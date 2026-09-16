# Interaction rules — downloadsachyhoc-com

System-wide conventions inferred from repeated behavior (public pass).

| Rule | Reference behavior | Our decision | Why |
|---|---|---|---|
| Auth gate | Site-wide **modal** over the current page (not a full-page redirect) | Adopt — **username + password only, no Google button** | keeps context; user resumes the download after login |
| Primary action placement | Single high-contrast CTA ("Tải sách") | Adopt | one obvious action per screen (no "kích hoạt"/tier CTAs — no tiers) |
| Feedback for async widgets | Inline area that shows a raw **error string** on failure ("Lỗi tải nội dung.") | Reject | must show empty/skeleton or hide, never a leaked error |
| Navigation | Server page loads; mega-menu for the deep taxonomy | Adopt menu, add search/facets | flatten depth-4 (Bet 1) |
| Save model | n/a for catalog; forms (contact/details) are explicit submit | Keep explicit submit for forms | predictability |
| Social proof | Live **toast** (bottom-left) at decision moments | Adopt cautiously | effective, but must be truthful, not fabricated |
| Support entry | Persistent **Messenger chat** (bottom-right) | Adopt or swap for own chat | low-friction help |
| URL / back button | Real URLs for catalog; modals have no URL | Give auth/quick-view shareable state where useful | deep-linkability |
| Destructive actions | Not observed (member area) | Prefer undo over confirm where safe | — |

## Inconsistencies (findings)
- Two blog indexes (`/blog/` + `/tin-tuc/`) — retrofitted, pick one.
- Native search vs Google CSE (`/search_gcse/`) coexist — two search systems, confusing; unify.
- Recommendation rails behave differently logged-in vs out (error vs content) — the logged-out
  error is an un-owned state.
