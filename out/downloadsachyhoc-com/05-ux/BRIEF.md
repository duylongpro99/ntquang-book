# UX Probing Brief — Medical e-book membership library (downloadsachyhoc.com)

> **To the receiving agent:** this brief is self-contained. You need only the reference URL
> below, browser automation tools, and the credentials named in §2. Follow §4 exactly and
> produce the files in §6. Where this brief states a hypothesis, treat it as something to
> *verify*, not fact — contradicting it is a valuable result.

---

## 1. Mission

Produce a UX specification of the **logged-in member experience** at
`https://downloadsachyhoc.com/`. The public catalog is already documented (see the flows/ in
this folder). Your job is the half nobody has seen: **download delivery and the account area.**
For each target feature, produce the complete **branch map**. A flow doc with only a happy path
has failed the brief.

**Build-scope note (important):** our build has **no membership tiers, no payment and no social
login** — access is binary (log in with username+password ⇒ download any book). So the *only*
in-scope risk left to retire here is **R1 (protected file delivery, §3.2)** plus the **account /
My-library** area (§3.4). The reference's tier/purchase/status machinery (§3.1, §3.3, §3.5) is
**CONTEXT-ONLY reconnaissance** — observe it if convenient to confirm our understanding, but it is
not a build target and must not gate your time.

## 2. Access

| | |
|---|---|
| Reference URL | https://downloadsachyhoc.com/ |
| Credentials | User is logged in on their own Chrome profile — have that browser connected. If prompted, the user logs in (do NOT enter credentials yourself). |
| Account tier | Irrelevant to our build (no tiers). Note what the reference account holds for context, but our probes only need *a* logged-in account that can download at least one book (for R1 delivery). |
| Roles available | Member only (no admin). |
| Tenancy | The client's REAL account. Treat everything as production: read-only bias, walk up to payment and STOP, never actually pay, never download-hammer. |

## 3. Targets (probe in this order)

### 3.1 `membership.purchase` — Buy / activate a tier  (CONTEXT-ONLY — out of build scope; no payment integration)
- **Entry points:** `/goi-tai-khoan/` → a tier's "kích hoạt" button → checkout.
- **Primary entity:** Order → Membership.
- **Known/suspected states:** Order {pending, on_hold, processing, completed, cancelled, failed};
  Membership {none → pending → active}.
- **Transitions to exercise:** none → pending (place order); observe how it says payment will happen.
- **Suspected limits:** 4 tiers (Thường 350k/1yr, VIP 399k/permanent, GOLD 799k, DIAMOND 1199k);
  promo −50% until 2026-09-20.
- **Strings suggesting undiscovered behavior:** "kích hoạt", "Thời hạn 1 năm", "Thời hạn vĩnh viễn".
- **THE question:** *How is payment collected and how is the order activated — automated gateway
  (MoMo/VNPay/ZaloPay/card) or manual bank transfer + admin activation?* Walk to the payment
  step, screenshot the method options and any bank details, then STOP. Do not pay.

### 3.2 `download.book-download` + `download.protected-delivery` — Download a book  ⭐ retires R1
- **Entry points:** any `/sach/{slug}/` → "Tải sách".
- **Primary entity:** Download / Book.file.
- **Known/suspected states:** logged-out → login modal (already observed). Logged-in + entitled →
  file delivered. Logged-in + NOT entitled → ??? (upsell? silent? error?).
- **THE question:** *What is the actual file URL and does it require auth?* After a successful
  download, inspect the network request (read_network_requests): is the PDF served from a
  guessable `/wp-content/uploads/...` path (leaky) or a tokenized/authenticated download handler?
  Record status code, headers, and whether the URL works in a logged-out tab.

### 3.3 `download.tier-gating` — Per-book tier gate  (CONTEXT-ONLY — OUT OF BUILD SCOPE; no tiers)
- Our build has **no tiers** — this is reconnaissance only, to confirm the reference behaves as we
  assumed. If a download is ever blocked, note it, but do not spend probes here.
- **Suspected reference rule:** access ladder free < thuong < vip < gold < diamond via a per-book
  "2nd note line". We do NOT replicate it — a logged-in user downloads everything.

### 3.4 `account.dashboard` + `acc-downloads` (My library) — Account area  ⭐ in scope
- **Entry points:** `/my-account/` and its sub-tabs.
- **THE question (build-relevant):** Is there a **"my library / downloads"** view listing books the
  user has downloaded, and can they re-download from it? What does it show per row (title, date,
  re-download button)? What is the empty state? This is Differentiation Bet 2 — screenshot it.
- Ignore any tier/membership-status/orders tabs beyond noting they exist (out of scope).

### 3.5 `membership.status` + `membership.upgrade` — Status & upgrade  (CONTEXT-ONLY — OUT OF SCOPE)
- No tiers in our build → nothing to status or upgrade. Skip unless trivially visible; do not probe.

### 3.6 `requests.request-book` — Book request (if reachable, Later feature)
- In our build any logged-in member can request a book (no tier gating, no quota).
- **THE question (context):** Where is the form and what fields does it take? Ignore any per-tier
  quota the reference shows — we don't replicate it.

## 4. Probing protocol

For **each** target, run all twelve probes (happy path · empty · invalid input · boundary ·
duplicate · permission · quota/tier gate · interruption · deep link · long-running · large dataset
· destructive-confirm-then-cancel). Record every outcome including "not reachable with this
account". Capture verbatim microcopy, a screenshot per branch point (`<feature>-<probe>-<n>.png`),
and timing for every wait. **Log your own hesitation** — that is the friction log.

## 5. Safety rules — non-negotiable
1. Never execute an irreversible action (cancel membership, delete account): open dialog, read, cancel.
2. Never trigger native alert/confirm/prompt — it freezes the extension.
3. **Never actually pay.** Walk to the payment step, record method + instructions, STOP.
4. Never enter real payment/card details.
5. Never access data outside this account. No ID enumeration.
6. Human-paced only; no download-hammering (respect "unlimited" politely — a few books max).
7. Stop after 2–3 consecutive failures and report.
8. No copying assets/brand. Microcopy = evidence only, rewrite before reuse.

## 6. Deliverables
Write to `out/downloadsachyhoc-com/05-ux/`: `flows/<feature>.md` (≥4 branches each),
`friction-log.md`, `step-count.csv`, `states.md`, `microcopy.md`, `onboarding.md`,
`interaction-rules.md`, `latency-budget.md`. Then regenerate `01-features/EVIDENCE-BASIS.md`
(probing upgrades member features inferred→observed) and re-inline it into PRD §0, ux-spec, design-notes.

## 7. Acceptance
Each **in-scope** target (§3.2 delivery, §3.4 account/My-library) has a flow doc with ≥4 branches;
probes recorded; hypotheses marked confirmed/refuted/untested; step-count has a row per target; no
safety rule broken. Context-only targets (§3.1, §3.3, §3.5) need only a note confirming or refuting
our assumption. **Lead your report with the answer to R1 (is the file URL leaky?) and with what the
My-library view actually looks like.**
