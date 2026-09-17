# Design System — Medical Book Library Frontend

Concrete style guide for the frontend build. **Stack: TailwindCSS + reusable components.** This is
the single source of truth for tokens, component APIs, layout, and interaction rules. It is derived
from the reverse-engineering artifacts in `out/downloadsachyhoc-com/06-ui/` (tokens, components,
design-notes) and `03-ia/patterns.md`.

**Language:** UI copy is Vietnamese (`vi`). Book content is bilingual (VN/EN). Use `lang="vi"` on
`<html>`.

**Scope (build target):** no membership tiers, no payment, no social login. Access is binary —
browse is public; **download requires a username/email + password login; a logged-in user downloads
any book.** Do not build tier badges, pricing tables, checkout, or Google-login buttons.

---

## 1. Design tokens & CMS Color Management

Central configuration source: `src/config/theme.ts`. Palette is our own proprietary **Oxford Medical Sapphire + Precision Slate & Caduceus Amber** (clinical-academic authority, replacing reference site clones).

**CMS-Ready Architecture:** All color tokens are decoupled and managed via `src/config/theme.ts` & `CmsThemeManager.tsx`. Themes can be updated, extended, or selected dynamically from a CMS without touching individual component files.

### 1.1 CSS variables (light + dark)

Defined in `/app/globals.css` and bound to Tailwind utility classes via `@theme`. Dark mode is opt-in via `class` strategy (`<html class="dark">`).

```css
/* app/globals.css */
@layer base {
  :root {
    /* Proprietary Clinical Palette: Oxford Medical Sapphire & Precision Slate */
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface-muted: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --text-muted: #475569;
    --primary: #1d4ed8;
    --primary-hover: #1e40af;
    --primary-contrast: #ffffff;
    --accent: #d97706;
    --accent-contrast: #ffffff;
    --success: #16a34a;
    --warning: #d97706;
    --danger: #dc2626;
    --info: #0284c7;
    --focus-ring: #3b82f6;
  }
  .dark {
    /* Night Shift Clinical Navy Slate */
    --bg: #0b1120;
    --surface: #111c33;
    --surface-muted: #1e293b;
    --border: #25334d;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --primary: #3b82f6;
    --primary-hover: #60a5fa;
    --primary-contrast: #ffffff;
    --accent: #f59e0b;
    --accent-contrast: #0b1120;
    --success: #22c55e;
    --warning: #fbbf24;
    --danger: #ef4444;
    --info: #38bdf8;
    --focus-ring: #60a5fa;
  }
  html { background: var(--bg); color: var(--text); }
  body { font-family: theme('fontFamily.sans'); }
}
```

**Why CSS variables + Tailwind (not raw Tailwind palette):** one theme switch flips light/dark with
zero class churn, and the token names stay traceable back to `tokens.json`.

### 1.2 Tailwind config

Map the variables into Tailwind so utilities like `bg-surface`, `text-muted`, `text-primary` work.

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: { DEFAULT: 'var(--surface)', muted: 'var(--surface-muted)' },
        border: 'var(--border)',
        content: { DEFAULT: 'var(--text)', muted: 'var(--text-muted)' }, // text-content / text-content-muted
        primary: { DEFAULT: 'var(--primary)', hover: 'var(--primary-hover)', contrast: 'var(--primary-contrast)' },
        accent: { DEFAULT: 'var(--accent)', contrast: 'var(--accent-contrast)' },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans: ['Inter', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
        heading: ['Be Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // token name -> [size, lineHeight]
        xs: ['12px', '1.5'],
        sm: ['14px', '1.5'],
        base: ['16px', '1.5'],
        lg: ['20px', '1.4'],
        xl: ['24px', '1.3'],
        '2xl': ['30px', '1.2'],
        '3xl': ['38px', '1.2'],
      },
      spacing: {
        // 4px rhythm mirrors token scale (Tailwind default already 4px-based; these are the named steps)
        1: '4px', 2: '8px', 3: '12px', 4: '16px',
        5: '24px', 6: '32px', 7: '48px', 8: '64px', 9: '96px',
      },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', pill: '999px' },
      boxShadow: {
        e1: '0 1px 2px rgba(16,42,48,0.06)',
        e2: '0 2px 8px rgba(16,42,48,0.10)',
        e3: '0 8px 24px rgba(16,42,48,0.14)',
      },
      screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px' },
      ringColor: { focus: 'var(--focus-ring)' },
    },
  },
  plugins: [],
}
```

### 1.3 Token usage cheatsheet

| Purpose | Utility |
|---|---|
| Page background | `bg-bg` |
| Card / panel | `bg-surface shadow-e1 rounded-md border border-border` |
| Muted panel / skeleton base | `bg-surface-muted` |
| Body text / muted text | `text-content` / `text-content-muted` |
| Primary CTA | `bg-primary hover:bg-primary-hover text-primary-contrast` |
| Accent (rating, "new" tag, links) | `text-accent` / `bg-accent` |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2` |
| Headings | `font-heading font-semibold` |

**Rule:** never hardcode a hex value in a component. Only the two blocks in §1.1 name colors; every
component reaches them through a Tailwind utility.

---

## 2. Typography

- **Heading font:** Be Vietnam Pro (Vietnamese diacritics render cleanly). **Body:** Inter, with
  Be Vietnam Pro fallback for VN glyphs.
- Load via `@fontsource` or a `<link>` to Google Fonts with `display=swap`. Preload the heading weight.
- Scale (use the `fontSize` keys above): page title `text-2xl`/`3xl`, section `text-xl`, card title
  `text-base font-medium`, meta/caption `text-sm text-content-muted`, legal fine print `text-xs`.
- **Measure:** prose/article body caps at `max-w-prose` (~65ch), `leading-relaxed`.
- Weights: regular 400 body, medium 500 card titles / labels, semibold 600 headings & CTAs, bold 700
  reserved for page H1.

---

## 3. Component library

24 components across 6 layout patterns (`patterns.md`). Build them as a shared package
(`src/components/`) with a strict variant/state API. **Card/course/article are variants of one
`BookCard`, not separate components.** No tier/membership/checkout/social-login components exist.

### 3.1 Conventions for every component

- **Props shape:** `{ variant, size?, state?, ...content }`. States are driven by prop, not ad-hoc classes.
- **Variant styling:** centralize class maps (use `cva` / `clsx` / `tailwind-variants` — pick one and
  standardize). Do not scatter conditional class strings.
- **States to support** (where applicable): `default · hover · focus · active · disabled · loading · error`.
  Every interactive element needs a **visible focus ring** (`ring-focus`) and a disabled style.
- **Loading = skeleton**, never a spinner-in-place for content. Skeleton base `bg-surface-muted
  animate-pulse rounded`.
- **A11y:** semantic elements first; ARIA only to fill gaps. All icons that carry meaning get labels.

### 3.2 Global chrome (all patterns)

| Component | Purpose | Variants | Key states | Notes |
|---|---|---|---|---|
| **AppHeader** | logo, nav, search, auth links | `logged-out` / `member` | default, sticky | sticky on scroll; collapses to hamburger < 768px |
| **MegaMenu** | 79-category specialty tree | — | default, hover, open | ≥1024px dropdown; < 768px → full-screen category sheet |
| **GlobalSearch** | catalog search input | `inline` / `full` | default, focus, loading, no-results | debounce 300ms; `role="search"` |
| **AppFooter** | about, links, socials | — | default | — |
| **AuthModal** | login/register overlay | `login` / `register` | default, validating, error | **username/email + password + toggle only — no social button** |
| **SocialProofToast** | live signup notification | — | enter, auto-dismiss | slide-in, auto-dismiss ~5s; no tier wording |
| **ChatLauncher** | support chat entry | — | default | fixed bottom-right |
| **Breadcrumb** | taxonomy path | — | default | list-grid + product-detail |

### 3.3 list-grid

| Component | Purpose | Variants | States |
|---|---|---|---|
| **BookCard** | cover, title, editor, rating, quick-view | `book` / `course` / `compact` | default, hover, loading(skeleton) |
| **RatingStars** | X/5 stars | `display` / `input` | default, half, empty |
| **FilterSidebar** | category/author/language facets | — | default, applied, empty |
| **Pagination** | page through results | `numbered` / `load-more` | default, disabled |
| **CardGrid** | responsive grid wrapper | `2` / `3` / `4`-col | default, empty, loading |
| **Rail** | horizontal curated strip | — | default, loading, error |
| **EmptyState** | no-results / no-data | `search` / `category` / `generic` | default (with CTA) |
| **SortControl** | order results | — | default, open |

### 3.4 product-detail

| Component | Purpose | Variants | States |
|---|---|---|---|
| **MediaViewer** | cover + lightbox zoom | — | default, zoomed |
| **MetaList** | editor/language/publisher/SKU fields | — | default |
| **PrimaryCTA** | **"Tải sách"** download action | `download` | default, hover, focus, loading; **logged-out → opens AuthModal, then resumes** |
| **ShareBar** | social share buttons | — | default |
| **TabGroup** | description / recommended EN-VN tabs | — | default, active, loading, error |

### 3.5 account-dashboard

| Component | Purpose | Variants | States |
|---|---|---|---|
| **AccountNav** | tab/side nav: *my library · requests · details · logout* | — | default, active |
| **DataTable** | **My library** (downloaded books), re-download | `downloads` | default, empty, loading, paginated |

> **My library** is the hero of the account landing (Bet 2 — re-download). Its exact columns are
> inferred from the reference; confirm against the live member area before final build.

### 3.6 form

| Component | Purpose | Variants | States |
|---|---|---|---|
| **FormField** | labeled input + validation | `text` / `email` / `password` / `select` / `textarea` | default, focus, error, disabled |

**Reuse `FormField` everywhere** (login, register, contact, account details, password reset). No
separate checkout fields.

### 3.7 Reference component APIs

```tsx
// Button (the primitive under PrimaryCTA and all buttons)
<Button
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  loading={boolean}      // shows inline spinner, disables, keeps width
  disabled={boolean}
  as="button" | "a"
/>

// primary classes:
// bg-primary hover:bg-primary-hover text-primary-contrast font-semibold rounded-md
// px-4 py-2.5 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2
// disabled:opacity-50 disabled:pointer-events-none

// BookCard
<BookCard
  variant="book" | "course" | "compact"
  book={{ cover, title, editor, rating }}
  loading={boolean}      // renders skeleton at same dimensions
  onQuickView={fn}
/>

// FormField
<FormField
  type="text" | "email" | "password" | "select" | "textarea"
  label={string}         // always present, never placeholder-only
  error={string | null}  // renders inline, below the field, text-danger, sets aria-invalid
  {...inputProps}
/>
```

---

## 4. Layout & responsive rules

Breakpoints from tokens: `sm 480 · md 768 · lg 1024 · xl 1280`. Mobile-first — write base styles for
small screens, add `md:` / `lg:` up.

| Range | list-grid | product-detail | account |
|---|---|---|---|
| **≥1024px (lg)** | filter sidebar + grid (3–4 cols) | media + meta two-column | left side-nav + content (2-pane) |
| **768–1023px (md)** | filters collapse to top **"Bộ lọc"** drawer; grid 2–3 cols | stacked, meta below media | nav → top tabs |
| **<768px** | single column; mega-menu → full-screen category sheet; grid 1–2 cols | single column; **CTA sticks to bottom** | top tabs; table scrolls or stacks to cards |

- **Container:** center content, `max-w-[1280px] mx-auto px-4` (16px gutter). Never let the page scroll
  horizontally.
- **Grid:** `CardGrid` = `grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (tune per screen).
- **Header:** sticky (`sticky top-0 z-40`), `bg-surface/95 backdrop-blur border-b border-border`.

---

## 5. Interaction & state rules

**One primary per screen.** Exactly one teal CTA: `Tải sách` on book detail, `Đăng nhập` in the auth
modal. Never two competing primaries. No tier/purchase CTAs.

**Download gate (Bet 2 — the core flow):** the download CTA has exactly two outcomes —
- logged in ⇒ file downloads (CTA shows loading/progress affordance),
- logged out ⇒ **AuthModal opens over the page; after login the download resumes automatically.**
No tier badge, no upsell, no "you need a higher tier" state anywhere.

**Auth modal:** username-or-email + password + submit + register/login toggle. **No Google/social
button.** Traps focus, Esc closes, returns focus to the trigger on close.

**Errors:** inline, next to the field (`FormField error`), `text-danger` — never a bare error string
or an alert dialog. A failed content rail hides gracefully behind a skeleton rather than showing a
raw error message.

**Loading:** cached pages paint immediately; async rails/filters use **skeletons**; the download
action shows progress on the CTA itself. Do not block the whole page on one async rail.

**Focus & keyboard:** modals trap focus and close on Esc; visible focus ring uses `ring-focus`; tab
order follows visual order; the download CTA is reachable and operable without a mouse.

**Motion (minimal, no decorative motion):**
- modal fade + scale-in ~150ms,
- skeleton shimmer (`animate-pulse`),
- toast slide-in.
- Respect `prefers-reduced-motion` — disable non-essential transitions.

---

## 6. Accessibility baseline

- Color contrast ≥ WCAG AA (tokens are tuned for it in both themes; re-check any new pairing).
- Every interactive element: visible focus ring + accessible name.
- Images (book covers) have `alt` = title; decorative boxes `alt=""`.
- Forms: `<label>` always tied to input (`for`/`id`); errors linked via `aria-describedby`, invalid
  fields get `aria-invalid`.
- Modals: `role="dialog"` + `aria-modal="true"`, focus trap, Esc, focus return.
- Support `prefers-color-scheme` for first paint, but the `.dark` class is authoritative once the
  user toggles.

---

## 7. Build conventions

- **Folder:** `src/components/` primitives (Button, FormField, Modal, Skeleton), `src/components/book/`
  domain components (BookCard, Rail, RatingStars), `src/layouts/` for the pattern shells.
- **Variant management:** one utility (`tailwind-variants` or `cva`) across all components — do not mix.
- **No inline hex, no arbitrary color values** (`bg-[#...]`). Colors come only from Tailwind tokens.
- **Skeletons ship with the component** — a component that can load renders its own skeleton at the
  same dimensions to avoid layout shift.
- **Six patterns, not per-page markup:** build the pattern shells once (list-grid, product-detail,
  article, account-dashboard, form, modal-overlay); pages compose them.

---

## Traceability

| This doc | Source |
|---|---|
| Tokens (§1) | `out/downloadsachyhoc-com/06-ui/tokens.json` |
| Components (§3) | `out/downloadsachyhoc-com/06-ui/components.md` |
| Layout/interaction rules (§4–5) | `out/downloadsachyhoc-com/06-ui/design-notes.md` |
| Patterns (§4, §7) | `out/downloadsachyhoc-com/03-ia/patterns.md` |
| Wireframes | `out/downloadsachyhoc-com/06-ui/wireframes/*.dc.html` |
