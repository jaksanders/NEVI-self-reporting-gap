# CLAUDE.md — NEVI Self-Reporting Gap Project

This file is read by Claude Code at the start of every session in this repo. It is the
persistent source of truth for project scope and rules — conversation history does not
carry over between sessions or machines, this file does.

## Session protocol (run this every session, no exceptions)

**At the start of a session:**
1. Run `claude auth status --text` and show the result to the user. If it doesn't match
   the account they expect for this project (they use multiple Claude accounts across
   machines), stop and ask before proceeding — do not assume it's correct.
2. Run `git status`. If there are uncommitted changes, stop and show them to the user
   before doing anything else — they may be carried over from a different laptop.
3. Run `git pull origin main` (or the current default branch) to sync any work done on
   another machine.
4. Confirm the pull succeeded (no merge conflicts) before proceeding with new work.

**At the end of a session:**
1. Run `git status` / `git diff` and summarize what changed.
2. Prompt the user to `git add`, commit with a descriptive message, and `git push`
   — explicitly mention that this is required before switching laptops, since local
   session memory will not follow them to the next machine.
3. Do not assume the user will remember to do this unprompted — ask directly.

## Environment notes — Cowork vs. local Claude Code

This project gets worked on from two different environments: the Cowork desktop app
(sandboxed Linux shell, connected to this folder via a cross-OS mount) and Claude Code
CLI running natively in this repo on the user's laptop.

**Division of labor:**
- Content work (drafting the article, editing this file, writing prototype code) can
  happen in either environment via direct file read/write.
- **Git operations (`add`, `commit`, `push`, `pull`) should only be run by Claude Code
  CLI locally, or by the user directly — never attempted via a Cowork session's bash
  tool against the mounted folder.** That bridge has caused stale `.git/index.lock`
  files that can't be cleaned up from the sandbox side (permission mismatch across the
  mount), and even when it works, the sandbox has no access to the user's stored git
  credentials, so `push` fails anyway.
- If a Cowork session edits a file in this repo, it should hand back a short git
  command block for the user (or local Claude Code) to run, rather than trying to run
  git itself.

## Mission

Produce one article + one interactive prototype examining whether NEVI-funded EV
fast-charging stations' self-reported uptime (contractually required at 97% average
annual, via EV-ChART to FHWA) holds up against independent public/third-party
reliability signals.

Target audience: technical peers at charging networks and NEVI vendors (Electrify
America is the top target contact), plus policy-adjacent readers who care about
federal EV infrastructure spending.

Both deliverables should read as a rigorous, citation-first audit — not an "AI predicts
charger reliability" pitch. That framing has prior art and will read as derivative to
this audience if presented as novel.

## Core thesis

Federal NEVI funding requires 97% self-reported uptime with no independent enforcement
mechanism. Industry-native third-party data (ChargerHelp 2025) shows a
self-reported-vs-actual gap nationally (98.7–99.9% claimed vs. 71% first-time success
rate, degrading by station age). Nobody has scoped that specific gap to NEVI-funded
stations using public data. That's the contribution: not a new technique, but the first
application of an established "self-report vs. reality" audit lens to the NEVI
compliance mechanism specifically.

## Positioning against prior work — cite explicitly, don't compete on novelty

[FACT] Prior work exists and must be cited up front, not discovered by a critical reader
later:

- **Liu, Francis, Hollauer et al. 2023** (*Communications in Transportation Research*,
  DOI: 10.1016/j.commtr.2023.100095) — Georgia Tech/Asensio lab. ML on 10 years of
  multilingual consumer charging reviews (2011–2021) to derive a "functionality ratio."
  Found government-owned stations less reliable than private; networked stations 5.1%
  more reliable than non-networked. Established academic precedent for "public/
  crowdsourced data reveals a reliability gap." Differentiate on signal type (structured
  federal metadata + third-party index, not subjective review text) and unit of analysis
  (regulatory compliance, not consumer sentiment).
- **Rempel et al.** (*Human Factors*) — field study, 73.3% functional. Strongest
  peer-reviewed anchor; cite as baseline.
- **ChargerHelp 2025 EV Charging Reliability Report** (100K+ sessions, 2,400 chargers,
  w/ Plug In America and Paren/GM Energy) — the key "self-reported vs. actual" data
  point. Named source, 2025, directly undercuts the metric NEVI compliance is built on.
- **Paren** — commercial platform, free published quarterly aggregate Reliability Index
  by state/network (100M+ daily events, 95%+ of US DCFC infrastructure). Q1 2026:
  national avg 93.5%, DC 97.6 (top), Oklahoma 77.7 (bottom). Use only their published
  aggregate numbers — do not scrape the paid session-level API.
- **arXiv, "Beyond Uptime: Actionable Performance Metrics for EV Charging Site
  Operators"** — makes a similar "uptime is an insufficient metric" argument.
  **[ACTION NEEDED]** Read in full before drafting; may overlap with this article's
  framing and needs explicit differentiation or citation.
- **NREL/AFDC EV-ChART requirement + 2023 Federal Register final rule** ("no national
  standards... pre-NEVI") — use as the "why now" regulatory framing.

**Rule for both deliverables:** every claim of the form "nobody has done X" must be
checked against this list before it ships, and any genuinely new source found during
drafting gets added here.

## Prototype scope

Goal: does the ChargerHelp-identified national gap show up disproportionately at
NEVI-funded stations, using only public data + one citable commercial benchmark.

Data sources (public/free only — no paid API scraping):
1. AFDC/NREL station-level data, filtered to `funding_sources: ["NEVI"]` (field
   confirmed to exist in schema).
2. Paren's published aggregate Reliability Index (state- and network-level, not
   session-level).
3. ChargerHelp 2025 report figures, cited as the national self-report-vs-actual
   benchmark (not re-derived).

Output: state-by-state (and network-level where data allows) comparison view —
"federally-funded stations self-report 97% compliance; here's what public third-party
data suggests about the gap." Should be a live/browsable artifact a technical reader can
click into and find their own network's number, not a static methods writeup — the
ChargePoint/EVgo/Electrify America audience responds to inspectable tools, not papers.

**Explicitly out of scope:** predicting individual charger failures, building a new ML
reliability model, scraping any paid/rate-limited API, claiming a new algorithmic
contribution.

## Article scope

- Open with the regulatory hook (97% self-reported requirement, no enforcement teeth)
  before the data.
- Cite Liu et al., Rempel et al., ChargerHelp, and Paren by name early — signal real
  research, not an independent-invention claim.
- State the contribution precisely: applying the known self-report/reality gap to the
  NEVI compliance mechanism specifically, using public data only.
- Close with the prototype as evidence, sent/linked directly to people at target
  companies who own this problem (same model as the prior Arcadia AMI piece).

## Epistemic standards for drafting

- Label claims internally as `[FACT]` (citable source), `[INFERENCE]` (deduced), or
  `[SPECULATION]` (plausible, unverified); resolve to plain, confident prose only where
  a source is actually checked.
- Verify every cited URL/DOI resolves before it goes in the piece.
- If a claim about prior work can't be sourced, say so rather than substituting an
  adjacent citation.
- If a fix, claim, or approach is challenged, treat it as a signal to search for
  evidence rather than defending the original position.

## Progress log (updated 2026-07-19, via Cowork session)

- **AFDC/NREL data pull — done.** Pulled the full ELEC-fuel AFDC dataset, filtered to
  `funding_sources: NEVI`. 216 stations, verified complete against the API's own
  `total_results` count. Cleaned to `nevi_stations_clean.csv` (state/network summaries
  also built). Note: NREL was renamed "National Laboratory of the Rockies" (NLR) in
  Dec 2025 under DOE; API base moved from `developer.nrel.gov` to `developer.nlr.gov`
  (old domain retired May 29, 2026) — use the new base going forward.
- **Paren state-level reliability data — done, with caveats.** Paren's own site/report
  are largely JS-gated and couldn't be scraped programmatically; data was ultimately
  read off a user-provided screenshot of Paren's Q2 2026 "Avg DCFC Reliability Rate by
  State" map. 21 NEVI states covered. **4 states are medium-confidence reads (NY, MD,
  DE, VA) and should be double-checked against the source screenshot before any exact
  figures for those states go in the published article.** Also flagged but unresolved:
  Paren's "Reliability Index"/"reliability rate" metric definition (Appendix B) has not
  been reconciled against NEVI's official EV-ChART uptime formula — treat the computed
  gap as suggestive, not a rigorous apples-to-apples compliance gap, until that's done.
- **Beyond Uptime (arXiv 2601.10861) — read in full.** Makes a similar "annual uptime
  is an insufficient/misleading metric" argument, via new operator-facing metrics
  (Fault Time, Fault-Reason Time, Unreachable Time) and a "zombie charger" case study.
  Overlaps in spirit, not in method — this project doesn't propose new operator
  metrics; it applies the established self-report-vs-reality audit lens specifically
  to the NEVI regulatory compliance mechanism, using public federal + third-party
  aggregate data. Cite and differentiate explicitly in the article; don't treat the
  novelty claim as settled without doing so.
- **Prototype hosting — decided.** Interactive prototype: static app on Vercel,
  iframe-embedded on jamesaksanders.com via a Custom HTML block (site is on the
  WordPress.com Premium plan, which supports iframe/script in Custom HTML blocks).
- **Station-level ML/agentic extension — decided and built.** Considered and ruled
  out: (a) state-level correlation between AFDC `date_last_confirmed` staleness and
  the Paren gap — computed, **null result** (Pearson r ranges -0.09 to -0.37 depending
  on filtering, weak and wrong-signed vs. the hypothesis; not usable as a proxy).
  (b) OpenChargeMap as an independent crowdsourced station-level signal — the right
  *type* of signal (user check-ins, fault reports), but its API (`api.openchargemap.io`)
  could not be reached from the Cowork sandbox's fetch tool in testing (empty response
  on 4 attempts, while structurally similar AFDC/NLR calls succeeded) — flagged as a
  possible future signal if a non-sandboxed environment can reach it, not built on.
  Landed on: a daily scheduled pull of AFDC's own `status_code`/`updated_at` for the
  216 NEVI stations, building a time series to detect status-flapping ("zombie
  charger") patterns per Beyond Uptime's own diagnostic, narrowly scoped to NEVI
  stations. Caveat to carry into the article: AFDC status data is itself
  operator/network-submitted, not independently verified — frame this as a
  *reporting-hygiene* signal, not a second independent uptime measurement, or it
  undercuts the audit's rigor with this audience.
  - Implementation: `/collector` in this repo (Vercel Function + Cron Job, deploys
    separately from the prototype). `api/collect-status.js` pulls AFDC daily and
    writes a dated CSV snapshot to Vercel Blob; `api/list-snapshots.js` is a
    no-auth-required endpoint for the prototype frontend to consume. See
    `/collector/README.md` for deploy steps. Needs a few weeks of accumulated
    snapshots before flapping detection has anything to say — not ready in time
    for initial article publish; treat as a "part 2" / live-artifact follow-on.
  - **Deployed and verified live 2026-07-19.** Project: `nevi-self-reporting-gap`
    on Vercel (Hobby plan, personal account), production domain
    `nevi-self-reporting-gap.vercel.app`. Blob store is **Private** (public beta
    feature — `@vercel/blob` had to be bumped from `^0.27.1` to `^2.6.1` in
    `package.json`, since the pinned version predated private-storage support
    and only accepted `access: 'public'`). First manual snapshot confirmed
    working end-to-end: `stations_captured: 216`, matching AFDC's own
    `total_results`. Because the store is Private, blob URLs returned by
    `list-snapshots` are not directly browser-fetchable without a token — the
    eventual prototype frontend will need to read snapshot content through this
    API (e.g. a future proxy/`get()` endpoint) rather than fetching `blob.url`
    directly client-side. Cron fires daily at 12:00 UTC against the production
    domain (Vercel's Standard Protection, on by default on Hobby, only guards
    per-deployment preview URLs, not the production domain, so this doesn't
    block the scheduled runs).

## Open decisions

- Double-check the 4 medium-confidence Paren state readings (NY, MD, DE, VA) against
  the source screenshot before publishing exact figures.
- Reconcile Paren's reliability-rate methodology against NEVI's official EV-ChART
  uptime formula before stating the gap as a rigorous compliance finding.
- Whether to attempt outreach to Paren for a data-sharing arrangement beyond published
  aggregates, or stay strictly public-data-only (current default: public-only).
- Whether/how to revisit OpenChargeMap as a station-level independent signal once a
  fetch path outside the Cowork sandbox is available.
- Register a real (non-DEMO_KEY) AFDC/NLR API key at developer.nlr.gov/signup for
  ongoing use, rather than relying on the public rate-limited key.
- Drafting the article's fixed front-matter (regulatory hook, positioning-against-
  prior-work, methodology) — not yet started; can proceed in parallel with prototype
  build since it doesn't depend on prototype results.
