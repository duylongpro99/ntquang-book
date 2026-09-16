# Job stories — downloadsachyhoc-com

Five core jobs. Situation-anchored. Step counts are estimates (member flows not exercised live;
see EVIDENCE-BASIS). **No tiers, no payment, no social login** — access is binary (log in →
download anything), so the former tier/status/renew jobs are gone.

### J1 — Find a specific book fast
When I have an exam next week and need a named textbook, I want to search or drill my specialty,
so I can get to the right download page without scrolling 1,000 titles.
- Reference: ~1–3 steps (search box or mega-menu → book). Screens: home, search, category, book.
- Touches: Book, Category. Features: search.site-search, catalog.category-browse, book-detail.
- Failure that matters: no results / mistyped Vietnamese diacritics → dead end.

### J2 — Judge whether a book is worth it before committing
When I land on a book from Google, I want to see the editor, language, publisher, description and
rating, so I can decide it's the right edition before I bother logging in.
- Reference: 1 screen (book detail). Screens: book. Features: book-metadata, ratings.star-rating.
- Failure: metadata missing → I bounce.

### J3 — Create an account / log in so I can download
When I've found the book I want and click "Tải sách", I want to register or log in quickly with a
username and password, so I can get to the file with no other hoops.
- Reference: ~2 steps (login modal → back to book). Screens: book, login, register.
- Touches: User. Features: auth.login, auth.register (username + password only — no Google).
- Failure that matters: the login modal loses my place, or asks for anything beyond username +
  password. (interaction-rules.md: contextual modal, resume the book after auth.)

### J4 — Download a book once I'm logged in
When I'm logged in, I want to click "Tải sách" and get the PDF immediately, so I can read offline —
**every** book, no tier check, no "upgrade to unlock".
- Reference (our build): 1 click (logged in) or login-then-download. Screens: book, account.downloads.
- Touches: Download, Book, User. Features: download.book-download, download.protected-delivery.
- Failure that matters: a download that stalls or serves a broken/leaky file. (R1 protected delivery.)

### J5 — Get back to my books later (My library)
When I come back a month later, I want to see everything I've downloaded and re-download it, so I
don't have to hunt the catalog again.
- Reference: ~2 steps (login → downloads). Screens: account.dashboard, account.downloads (My library).
- Features: account.downloads. This is Differentiation Bet 2 — one honest library view, 0 dead ends.
- Failure: history is missing or a re-download fails → confusion.
