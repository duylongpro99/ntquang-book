# Tech observations — downloadsachyhoc-com

## Platform
- **WordPress 5.6** + **WooCommerce 3.5.3** (both `<meta name=generator>`; old versions).
- Server: **LiteSpeed** + **LiteSpeed Cache** plugin (`x-litespeed-cache: hit`, HTTP/3/QUIC via alt-svc).
- Theme: **`medicalbook`** — a child/rebrand of **Flatsome** (body classes `nav-dropdown-has-arrow`,
  `lightbox`, `lazy-icons`; Flatsome UX Builder markers). Green medical brand palette.

## Plugins observed / inferred
- **WOOF – WooCommerce Products Filter** (`woocommerce-products-filter`, 52 inline refs) — faceted
  filtering of the book catalog (by category, author attribute, language).
- **Yoast SEO** (`wordpress-seo`) — sitemaps (`sitemap_index.xml`), meta.
- **Contact Form 7** (`contact-form-7`, `cf7`) — contact page form.
- **Google Custom Search Engine (GCSE)** — dedicated `/search_gcse/` results page (client-side JS search).
- **Social-proof / FOMO notification widget** — live "X just registered a VIP account" toast
  (observed). Likely NotificationX / WPfomify-class plugin.
- **Facebook Messenger live chat** widget (bottom-right, observed) — "Hỗ trợ 24/7 qua Messenger".
- **Google OAuth login** ("Tiếp tục với Google") — a social-login plugin (Nextend Social Login-class).
- A **membership / content-restriction** mechanism gating downloads by tier — plugin not fingerprinted
  (candidates: custom, or a WooCommerce Memberships-class plugin). INFERRED.
- Product **star ratings** shown on cards ("Được xếp hạng 4/5 sao") — WooCommerce reviews or a ratings plugin.

## Content shape
- ~1,085 books (`/sach/{slug}/`), 79 hierarchical categories (`/danh-muc-sach/...`),
  666 author terms (product attribute `pa_tac-gia`), ~12 blog posts, 6 static pages.
- Books modeled as WooCommerce **external/affiliate products**, price 0₫; "Tải sách" (Download)
  button opens a **login modal** (observed) — download is gated behind auth + membership tier.

## Delivery / interaction
- Server-rendered PHP pages (not an SPA). Progressive enhancement via jQuery + admin-ajax.
- AJAX widgets: "recommended" and "most downloaded" tabs load via admin-ajax (showed
  "Lỗi tải nội dung" / load error when logged out — likely login-gated or transient).
- Faceted catalog filtering via WOOF → admin-ajax POST.
- Caching: full-page LiteSpeed cache; static assets combined/minified (masks plugin fingerprints).
- No websockets; polling/AJAX only. Auth = WordPress cookie sessions + optional Google OAuth.
- Multi-tenancy: none (single-tenant content store).
- File handling: actual book files (PDF) served post-auth from `/wp-content/uploads/...` or a
  protected download handler — NOT verified (login-gated). INFERRED.

## Blocked / masked
- **WP REST API disabled** (`/wp-json/` → "REST API is not working") — no programmatic catalog dump.
- **No SPA bundle / i18n JSON** — server-rendered; the string corpus is content (titles/taxonomy),
  not a translation file. LiteSpeed asset combination masks individual plugin script handles.
- **Authenticated surface not captured** — the provided browser session was logged out; account
  dashboard (downloads list, orders, membership status, book-request form) is INFERRED only.
