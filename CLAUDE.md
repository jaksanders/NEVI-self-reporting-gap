# CLAUDE.md — NEVI Self-Reporting Gap Project

This file is read by Claude Code at the start of every session in this repo. It is the
persistent source of truth for project scope and rules — conversation history does not
carry over between sessions or machines, this file does.

## Session protocol (run this every session, no exceptions)

**At the start of a session:**
1. Run `git status`. If there are uncommitted changes, stop and show them to the user
   before doing anything else — they may be carried over from a different laptop.
2. Run `git pull origin main` (or the current default branch) to sync any work done on
   another machine.
3. Confirm the pull succeeded (no merge conflicts) before proceeding with new work.

**At the end of a session:**
1. Run `git status` / `git diff` and summarize what changed.
2. Prompt the user to `git add`, commit with a descriptive message, and `git push`
   — explicitly mention that this is required before switching laptops, since local
   session memory will not follow them to the next machine.
3. Do not assume the user will remember to do this unprompted — ask directly.

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

## Open decisions

- Format/hosting for the interactive prototype (not yet chosen).
- Whether to attempt outreach to Paren for a data-sharing arrangement beyond published
  aggregates, or stay strictly public-data-only.
- Final read of the "Beyond Uptime" arXiv paper — needed before the differentiation
  claim in the article can be finalized.
