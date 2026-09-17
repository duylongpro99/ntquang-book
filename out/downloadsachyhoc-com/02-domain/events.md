# Business events — downloadsachyhoc-com

No notification-preferences page was reachable (member area not captured), so this catalog is
**inferred** from the entity lifecycles and observed widgets. With **no tiers and no payment**, our
build's event set is small; the reference's membership/payment/tier chain is retained below as
out-of-scope reconnaissance.

## Our build (in scope)

| Event | Trigger | Audience | Channel | Payload | Confidence |
|---|---|---|---|---|---|
| user.registered | account created (username + password) | user; site | email; social-proof toast | name, time | observed (toast ss_55920307d) / inferred (email) |
| user.password_reset | user requests reset | user | email | reset link | guessed (Woo default) |
| book.downloaded | member downloads a book | system | (log only → My library) | user, book, time | inferred (feeds download_count) |
| contact.submitted | contact form sent | admin | email (CF7) | name, message | inferred |
| bookrequest.submitted *(Later)* | member requests a title | admin | email/admin | title, language, requester | inferred |
| bookrequest.fulfilled *(Later)* | staff adds requested book | requester | email/in-app | book link | inferred |
| review.submitted *(Later)* | member rates a book | moderator | admin/email | book, stars, comment | inferred |
| review.approved *(Later)* | moderator approves | (public) | on-page | review shown | inferred |

**Key unknown:** the download event's anti-abuse handling — is it truly unlimited, or throttled?
(No tier caps exist, so a per-account rate limit is the only lever; TBD.)

---

## Reference events — OUT OF SCOPE (no tiers/payment in our build)

These document the reference and are **not implemented**:

| Event | Trigger | Why dropped |
|---|---|---|
| membership.ordered / payment_instructions / activated | buying/activating a Plan | no payment, no tiers |
| membership.upgraded | upgrade tier | no tiers |
| membership.expiring_soon / expired | 1yr plan expiry | no tiers/expiry |
| course.granted | GOLD/DIAMOND bonus | tier perk |
| promo.launched | discount campaign | marketing-page removed |
| referral.completed | invited friend registers/buys | marketing-page removed |

The `user.registered` event also loses its `plan` field and its Google trigger — registration is
username + password only.
