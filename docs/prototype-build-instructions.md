# Prototype build instructions — v1

Paste this whole block into a Claude Code CLI session running in this repo
(C:\Users\jsanders\Documents\NEVI\NEVI-self-reporting-gap, on the laptop, not Cowork).

## Why this exists

Six of the seven tasks identified for building the v1 prototype are bundled here so they
can run as one local Claude Code session instead of being re-planned piecemeal. Two are
deliberately left out: pasting the final iframe snippet into WordPress (Claude has no
WordPress access and shouldn't be given credentials for it), and a human visual/mobile
QA pass on the live embed (needs eyes, not just automated checks). Everything else —
data, join, scope decision, copy, frontend, deploy — is in scope for this session.

This also retries something Cowork's sandbox couldn't do: read the exact
state-by-state numbers off Paren's Q2 2026 reliability chart image. Cowork's sandboxed
network blocked the image fetch outright (`blocked-by-allowlist`, same failure
signature as the earlier OpenChargeMap block) and its own web-fetch tool can't parse
binary image content anyway. This laptop has normal network access and Claude Code CLI
can view image files directly — so Step 1 is a diagnostic-first check of whether that
actually works, not an assumption that it will.

## Objective

Ship a working v1 of the interactive prototype: a state-by-state comparison view
showing NEVI's flat 97% self-reported uptime requirement against Paren's independently
measured state-level reliability rate, built only on data already sourced in this
project (AFDC/NREL station list, Paren's public Q2 2026 report, ChargerHelp's 2025
figures cited as-is). No new ML model, no paid API access, no individual-charger
prediction — all explicitly out of scope per `CLAUDE.md`.

---

### Step 0 — Session protocol first

Per `CLAUDE.md`'s own session protocol: run `claude auth status --text`, `git status`,
and `git pull origin main` before anything else. Stop and flag if there are uncommitted
changes or the pull doesn't come back clean — don't build on top of an unknown state.

### Step 1 — Diagnostic: try to read the actual Paren reliability chart

Do not skip to Step 2 on partial data if this succeeds.

1. Fetch the Q2 2026 report page for context (it's public, not JS-gated for text):
   `https://www.paren.app/reports/us-ev-fast-charging-q2-2026`
2. Download the chart image directly:
   ```
   curl -sL -o /tmp/paren_reliability_by_state.png "https://cdn.prod.website-files.com/66a757a57add49ec2a7c112b/6a517526a0e8bc16757c1581_Avg%20DCFC%20Reliability%20Rate%20by%20State.png"
   file /tmp/paren_reliability_by_state.png
   ```
3. If the download succeeds and is a valid image, view it directly (you're
   multimodal — read the file, don't shell out to OCR) and transcribe the reliability
   rate for every state that has NEVI-funded stations (cross-reference against
   `data/nevi_stations_current.csv` for the state list). Record exact figures.
4. If the curl fails (matching the Cowork sandbox's `blocked-by-allowlist` signature or
   any other failure), stop and report the exact failure — don't retry blindly. Fall
   back to the partial text-derived figures below rather than fabricating numbers for
   states the chart would have covered:

   Confirmed from report prose (usable regardless of Step 1's outcome):
   DC 97.7, Montana 97.6, South Dakota 96.5, Wyoming 96.4, Kansas 96.1,
   North Carolina 96.0, Nevada 96.0, Oklahoma 78.5, Vermont 86.7, Arkansas 89.9,
   Rhode Island 90.3, Minnesota 90.7, Puerto Rico 90.9.
   Directional only (no exact digit in text): Maryland and Delaware are named as
   having "crossed above 90" in Q2 2026 (previously below 90).
   No figure anywhere in text: New York, Virginia.

### Step 2 — Write the state reliability dataset

Save `data/paren_state_reliability_q2_2026.json`: one entry per state with NEVI
stations, fields `state`, `reliability_rate` (null if unknown), `confidence`
(`chart_confirmed` / `text_confirmed` / `directional_only` / `unconfirmed`), `source`
(exact URL), `source_date` (2026-07-14, the report's publish date). Do not guess a
number for `unconfirmed` states — leave `reliability_rate: null` and let the frontend
show "data pending" rather than interpolating.

### Step 3 — Join AFDC and Paren into the comparison dataset

Build `data/nevi_paren_comparison.json` from `data/nevi_stations_current.csv` and the
file from Step 2: per state, NEVI-funded station count, NEVI's flat 97% self-reported
requirement (constant), and Paren's reliability rate (or null + confidence flag).
Validate row count against `nevi_stations_current.csv`'s own total before moving on.

### Step 4 — Network-level scope decision

Check `https://www.paren.app/cpo-hardware-leaderboard` for network-level reliability
data. If it publishes reliability by network/CPO (not just utilization or port count),
do the equivalent join against AFDC's `ev_network` field and include it as a second
view. If it doesn't cleanly support this, explicitly drop network-level from v1 — write
one sentence in `CLAUDE.md`'s Open decisions saying so, rather than leaving it
ambiguous for a future session to re-investigate from scratch.

### Step 5 — Methodology/caveat copy

Write the on-page methodology text using the re-scoped framing already in `CLAUDE.md`:
state NEVI's time-based uptime formula and Paren's session-outcome composite side by
side, explicitly as differently-defined metrics, and present the comparison as
directional — not a converted, apples-to-apples gap percentage. Save as
`docs/prototype-methodology-copy.md` and also inline it in the frontend (Step 6) as a
visible section, not a buried footnote — this audience will look for it.

### Step 6 — Build the frontend

Static site, plain HTML/CSS/JS (no build step needed unless you have a strong reason)
reading the two JSON files from Steps 2–3 client-side. Minimum v1 surface: a
state-by-state table or map, click-through per state showing station count + NEVI's
97% claim + Paren's rate (or "data pending" for unconfirmed states) + the methodology
callout from Step 5. Keep it simple enough to embed cleanly in a WordPress iframe —
avoid anything requiring viewport tricks or fixed pixel widths.

### Step 7 — Deploy

Deploy to Vercel (new project, e.g. `nevi-prototype`, separate from the existing
`nevi-self-reporting-gap` collector project so a bad prototype deploy can't affect the
live cron). Once it's up, produce the exact iframe embed snippet for a WordPress
Custom HTML block — but do not attempt to log into WordPress or paste it yourself.
Hand the snippet to the user.

### Step 8 — Log and commit

Update `CLAUDE.md`'s Progress log and Open decisions with: Step 1's outcome (chart
read successfully, or still blocked and why), which states remain `unconfirmed`, the
Step 4 network-level decision, and the live prototype URL. Per `CLAUDE.md`'s own rule
for local Claude Code, you may commit and push directly — this is allowed here
(unlike from Cowork). Do so once everything above is done and verified, not
incrementally mid-build.

## Constraints

- Public/free data only — no paid API access, no scraping behind a login.
- Label findings `[FACT]` (directly observed) vs. `[INFERENCE]` (deduced) per this
  repo's epistemic standards — this feeds a piece read by a skeptical, technical
  audience.
- No new ML model, no individual-charger failure prediction — explicitly out of scope
  per `CLAUDE.md`'s Prototype scope section.
- If Step 1's chart read fails, report that plainly and proceed on the partial dataset
  — do not fabricate figures for unconfirmed states to make the table look complete.
