# Prompt template — Build a Next.js page from its wireframe + design system

Use this to instruct a coding agent to implement **one** page. Fill in `{{PAGE_ID}}` (an `id` from
`page-wireframe-map.json`) and paste the whole thing as the task. The agent resolves everything else
from the referenced files — do not paraphrase the wireframe or tokens into the prompt.

---

## TASK

Build the Next.js (App Router) page **`{{PAGE_ID}}`** for this project.

## INPUTS (read these first, in order)

1. **`page-wireframe-map.json`** → find the object in `pages[]` (or `modals[]`) where `id == "{{PAGE_ID}}"`.
   It gives you: `route`, `appFile`, `pattern`, `auth`, `wireframes`, `components`, `states`,
   `dynamicParams`, `data`, `primaryAction`, and `notes`. This is your build order.
2. **The wireframe file(s)** named in that entry's `wireframes` — under `out/downloadsachyhoc-com/06-ui/wireframes/`.
   Open each (`default`, and any `loading` / `empty` / `error`). Read them for **structure and layout
   only**: what regions exist, their order, and how they nest.
3. **`design.md`** — the design system. Tokens, Tailwind config, typography, the component API for
   each component listed in the map entry, responsive rules, and interaction rules.
4. **`out/downloadsachyhoc-com/06-ui/components.md`** — the variants/states each component must support.

## HARD RULES

- **Wireframe = structure, `design.md` = style.** The `.dc.html` files are lo-fi. Their inline CSS,
  hex colors, gray placeholder boxes, and bars are **placeholders**. Never copy them. Colors come
  only from Tailwind tokens (`bg-surface`, `text-content`, `bg-primary`, …); **no inline hex, no
  `bg-[#...]` arbitrary values.**
- **Reuse components, don't re-invent.** Every region maps to a component named in the entry's
  `components` array. Import from `src/components/`. If a component doesn't exist yet, build it in
  `src/components/` per its API in `design.md` §3, with all its variants/states — then use it. Do not
  inline one-off markup for something that is a listed component.
- **Respect scope:** no membership tiers, no payment, no social login, no tier badges. If the
  wireframe seems to imply any of these, it does not — the scope note in `design.md` and the map wins.
- **States:** implement every state in the entry's `states`. `loading` → a `loading.tsx` that renders
  the matching `*Loading` wireframe as a **skeleton** (`bg-surface-muted animate-pulse`, same
  dimensions, no layout shift). `empty` → render the `*Empty` wireframe's message + CTA via
  `EmptyState`. `error` → inline field errors (`FormField error`), never a bare string or alert.
- **Responsive:** follow the per-pattern breakpoint behavior in `design.md` §4 (e.g. list-grid filter
  sidebar → 'Bộ lọc' drawer < 768px; product-detail CTA sticks to bottom on mobile). Mobile-first.
- **One primary CTA per screen** (`design.md` §5). If `primaryAction` is set, wire exactly that flow.
- **Auth:** if `auth == "protected"`, gate the route (redirect to trigger AuthModal / login when
  unauthenticated). If `public`, no gate.
- **Accessibility:** `design.md` §6 — labels, focus rings (`ring-focus`), alt text, dialog semantics,
  `prefers-reduced-motion`. Copy is Vietnamese; use the `titleVi` and any Vietnamese labels as given.
- **Data:** use the `data` field as the contract. Fetch in a Server Component where possible; mark
  interactive pieces (search input, filters, modal triggers, download CTA) as Client Components.
- **Files marked `"default": null` with a `reuse` hint** have no wireframe — assemble the layout from
  the named shell + components per the `reuse` note and the pattern skeleton in `patterns.md`.

## DELIVERABLES

1. The page at the entry's `appFile` (+ `loading.tsx` / `error.tsx` if the states require them).
2. Any missing components created under `src/components/` per `design.md`, with their full
   variant/state API — not just the states this page happens to use.
3. No new colors, fonts, radii, or shadows outside the tokens. No new dependencies without noting why.

## SELF-CHECK BEFORE FINISHING

- [ ] Every region in the wireframe maps to a real component from the entry's `components` list.
- [ ] Zero inline hex / arbitrary color values; all styling via Tailwind tokens.
- [ ] Every state in `states` is implemented (default, and loading/empty/error where listed).
- [ ] Responsive behavior matches `design.md` §4 for this pattern at <768 / 768–1023 / ≥1024.
- [ ] Exactly one primary CTA; the `primaryAction` flow works (if any).
- [ ] No tiers / payment / social-login UI anywhere.
- [ ] Keyboard + focus-ring + labels present; Vietnamese copy correct.
- [ ] `notes` (esp. any "INFERRED — confirm against live member area") are honored or flagged.

---

### Example fill-in

> Build the Next.js (App Router) page **`book-detail`** for this project.
> [...rest of template unchanged...]

The agent then reads `pages[]` where `id=="book-detail"`, opens `BookDetail.dc.html` +
`BookLoading.dc.html`, builds `app/sach/[slug]/page.tsx` + `loading.tsx`, wires the `Tải sách`
PrimaryCTA (logged-out → AuthModal → resume), and creates any missing components (MediaViewer,
MetaList, TabGroup, …) in `src/components/`.
