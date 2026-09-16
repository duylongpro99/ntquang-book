# Microcopy corpus — downloadsachyhoc-com

Verbatim strings recorded as **evidence of intent only** — rewrite before use (clean-room).
Grouped by the moment each string does its job.

## Trust / positioning (header & footer)
| String (verbatim) | Where | Words | Why it exists |
|---|---|---|---|
| "Thư viện y học số 1 Việt Nam !" | top bar | 6 | authority claim — establish credibility fast |
| "Hơn 2000 ebook y học tất cả các chuyên khoa" | header value-prop | 8 | scale claim — justify the membership |
| "Kho tài liệu - bài giảng — thực hành y khoa chuyên sâu" | header value-prop | — | breadth beyond books |

## Search
| "Tìm kiếm sách, tài liệu... (gõ tiếng việt có dấu)" | search box | 8 | tells user search is accent-sensitive — a workaround surfaced as instruction (friction #3) |

## Auth (login modal)
| "ĐĂNG NHẬP" | modal title | 1 | state where you are |
| "Tên tài khoản hoặc địa chỉ email" | field | 5 | accept either identifier |
| ~~"Tiếp tục với Google"~~ | ~~OAuth button~~ | — | **NOT USED — no social login; username + password only** |
| "Bạn chưa có tài khoản? Đăng ký ngay" | modal footer | 5 | route new users to register at point of need |

Our login/register modal carries a title, a username-or-email field, a password field, a submit
button and the register/login toggle — **and nothing else**. No Google button, no tier mention.

## Product / download
| "Tải sách" | primary CTA | 2 | the money action, plainly named |
| "Chủ biên / Ngôn ngữ / Nhà xuất bản" | meta labels | — | the fields a buyer checks before committing |
| "Lỗi tải nội dung." | ajax rail (logged out) | 3 | **failure the user shouldn't see** — rails should degrade, not error |

## ~~Pricing / plans~~ — REFERENCE ONLY, NOT USED (no tiers, no payment, no marketing-page)
These reference strings are recorded as evidence but have **no home in our build** — there is no
pricing page, no tier and no activation:
| "Chọn gói hoàn hảo cho bạn" | pricing hero | — | *not used* |
| "Sale off lên đến 50%..." | promo banner | — | *not used* |
| "Không giới hạn lượt tải" | tier perk | — | *concept survives as "download any book, no limit" — but not tied to a tier* |
| "Thời hạn 1 năm / vĩnh viễn" | tier perk | — | *not used — accounts don't expire* |
| "kích hoạt" | tier CTA | — | *not used — nothing to activate* |
| "Tương tự tài khoản thường/VIP/GOLD" | tier perk | — | *not used* |

## Social proof
| "{name} vừa mới đăng ký — Cách đây vài giờ" | toast | — | herd proof at decision time — **drop the "Tài khoản VIP" wording; no tiers** (Later feature) |

## Intent summary for the rebuild
With tiers/payment/social-login gone, the copy now works **two** jobs: (1) authority ("số 1",
"2000 ebook"), (2) plain naming of the one money action ("Tải sách"). The old urgency job (promo,
"kích hoạt", VIP social-proof) is out of scope. Keep the two jobs, rewrite the words. Fix "Lỗi tải
nội dung." (a leaked error) and turn the accent-sensitive search note into actually-forgiving search
rather than an instruction. The login modal copy is username+password only — no Google, no tier.
