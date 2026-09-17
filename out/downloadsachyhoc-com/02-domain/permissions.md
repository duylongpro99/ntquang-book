# Permissions — downloadsachyhoc-com

**Our build has no tiers.** Access is **binary and role-thin**: `visitor` (anonymous),
`member` (any logged-in account), `admin` (back-office). The download gate is **login**, nothing
more — a logged-in member can download every book.

## Role × action (OUR BUILD)

| entity.action | visitor | member | admin |
|---|---|---|---|
| Book.browse / read detail | yes | yes | yes |
| Category/Author.browse | yes | yes | yes |
| Book.search / filter | yes | yes | yes |
| Book.download | **no (login prompt)** | **yes (any book)** | yes |
| Download history (My library) | no | yes (own) | yes |
| Account.details.edit | no | yes (own) | yes |
| BookRequest.submit *(Later)* | no | yes | yes |
| Review.submit *(Later)* | no | yes (inferred) | yes |
| Catalog management | no | no | yes |

The only gate is the `Book.download` row: anonymous → login modal; logged-in → download proceeds.
No per-book check, no entitlement lookup.

## Unknowns
- Whether downloads are throttled at all (reference said "unlimited"; we assume no per-account cap
  but a rate/abuse limit is a build decision — TBD).
- Exact review-submission gating (Later feature).
- Admin sub-roles.

---

## Reference tier model — OUT OF SCOPE (reconnaissance only)

The reference gated downloads by a **membership tier ladder** (`free < thuong < vip < gold <
diamond`). **None of the tables below are built** — they document the site we cloned from. Our
build collapses all of it into the single binary rule above.

### Reference: tier × book access ladder

| Book.min_tier | free user | Thường | VIP | GOLD | DIAMOND |
|---|---|---|---|---|---|
| free | yes | yes | yes | yes | yes |
| thuong | no | yes | yes | yes | yes |
| vip | no | no | yes | yes | yes |
| gold | no | no | no | yes | yes |
| diamond | no | no | no | no | yes |

### Reference: tier × perk (from pricing-matrix)

| Perk | Thường | VIP | GOLD | DIAMOND |
|---|---|---|---|---|
| Unlimited downloads | yes | yes | yes | yes |
| No ads | yes | yes | yes | yes |
| Newest English books | yes | yes | yes | yes |
| Newest Vietnamese books | no | no | yes | yes |
| Newest Derm/Aesthetics | no | no | no | yes |
| Request English book | yes | yes | yes | yes |
| Request Vietnamese book | yes | no | no | yes |
| Bonus video courses | 0 | 0 | 2 | 3 |
| Duration | 1 year | permanent | permanent | permanent |

Transcribed from the reference pricing page (inferred at runtime — never exercised). Retained so the
reconnaissance is complete; superseded entirely by the binary model.
