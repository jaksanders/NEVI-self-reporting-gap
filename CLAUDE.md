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

## Cowork session protocol

Cowork has no equivalent to Claude Code's automatic project-file load — a Cowork
session only sees this file if the user connects this repo folder and Claude reads it.
Without that, a Cowork session starts blind and has to reconstruct state from other
session transcripts (slow, and it happened once — see 2026-07-19 in the progress log).

**At the start of a Cowork session on this project — literally the first action, before
reading the synced Project knowledge cache, before answering any status question, before
anything else:**
1. Check whether this repo folder is already the session's connected workspace folder
   (it usually is, automatically, if the user pre-selected it — no `request_cowork_directory`
   call needed in that case). Try `Read` on this exact file path first. Only call
   `request_cowork_directory` if that Read fails.
2. Read this file in full. Treat it, not the synced Project knowledge cache, as the
   source of truth — the Project cache is a separate, older mechanism that only has the
   original scoping chat and goes stale as soon as work happens elsewhere (GitHub,
   Vercel, local Claude Code). Do not substitute the Project cache for this file, and do
   not reconstruct state from other session transcripts if this file is reachable —
   that's slower and less reliable than just reading it (this was gotten wrong once,
   2026-07-19, second Cowork session of the day: the assistant checked the stale Project
   cache and mined other sessions' transcripts before checking whether this file was
   already sitting in the connected folder — it was).

**At the end of a Cowork session that changed anything (research, data, decisions):**
1. Edit this file directly (Read/Write/Edit tools work fine on the connected folder)
   to log what happened, in the Progress log / Open decisions sections below.
2. Do not run git from Cowork's bash tool against this folder — see Environment notes
   below for why. Hand the user a short `git add`/`commit`/`push` block for them (or
   local Claude Code) to run instead, and say so explicitly before ending the session.

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

## Progress log — 2026-07-19 (later same day, Cowork session #2)

- **OpenChargeMap retested, still blocked — narrowed down further.** Re-hit
  `api.openchargemap.io` fresh (no cached state from the earlier session): still an
  empty response body, no error, no content-type — same signature as before. Also
  tried `openchargemap.io/api/v3/poi` (no `api.` subdomain) as an alternate path: this
  one resolves, but redirects to the site's login page rather than returning JSON, so
  it's not a viable substitute endpoint either. Checked whether the Chrome extension
  could route around the sandbox's network path: no browser is currently connected to
  this account (`list_connected_browsers` returned empty), so that option isn't
  available right now either. **Conclusion: this is not a flaky/retry-fixable issue —
  it's specific to the `api.openchargemap.io` subdomain from Cowork's sandboxed fetch
  tool.** Next thing to actually try (not yet done): pull OCM from local Claude Code
  CLI on the user's laptop, which has normal unrestricted network access and isn't
  subject to this sandbox's allowlist — or connect a Chrome browser to this account
  and retry via the browser tools.
- **Set up the Cowork-side session protocol** (see section above) so future Cowork
  sessions read this file first instead of reconstructing state from other session
  transcripts.

## Progress log — 2026-07-20 (local Claude Code CLI, first successful OCM network test)

- **Claude CLI installed and working on this laptop.** Native PowerShell installer
  (`irm https://claude.ai/install.ps1 | iex`) placed the binary at
  `C:\Users\jsanders\.local\bin\claude.exe`. Hit one install snag worth remembering:
  the User `PATH` variable had literal stray `"` characters embedded around the
  `...WindowsApps;...\.local\bin` entries (visible directly in `PATH` output — not a
  shell-escaping issue, actual corrupted characters in the stored env var), which broke
  lookup even though the directory and binary both existed. Fixed by rebuilding the User
  PATH via `[Environment]::SetEnvironmentVariable` with a regex strip of `"` — avoid
  `setx` for PATH edits going forward, since it has a ~1024-char truncation risk on long
  PATH values that a targeted `[Environment]::...` read/write avoids.
- **OpenChargeMap: sandbox block ruled out, real blocker found — needs an API key.**
  Ran `docs/ocm-pull-instructions.md` Step 0 from this laptop: the network path itself
  works fine (unlike Cowork's silent empty-body failure), but OCM returned **HTTP 403,
  "You must specify an API key using the key query parameter or x-api-key header"** on
  the same bare, unauthenticated request that (per an earlier session) used to work
  without one. **This confirms two separate, now-isolated issues**, not one: Cowork's
  sandbox blocks the `api.openchargemap.io` subdomain outright (empty body, no HTTP
  response at all), while OCM itself has separately started enforcing key-required auth
  on all programmatic requests, laptop or sandbox. Fixing the sandbox issue alone would
  not have been enough — this was going to block progress either way.
- **Next step: register a free OCM API key** at
  https://openchargemap.org/site/profile/applications (user must do this manually — not
  something Claude should do on their behalf). Once obtained, set it as an environment
  variable in the same shell before starting `claude` (e.g. `$env:OCM_API_KEY = "..."`
  in PowerShell) rather than pasting the raw key into a Claude Code chat message or any
  file — this project already has an open, unresolved item (see the trading-strategies
  project) where a live Anthropic API key ended up sitting in plaintext in a saved chat
  log, so treat any new key the same way: env var only, never committed, never echoed
  back in a response.
- Steps 2 onward of `docs/ocm-pull-instructions.md` (station list load, per-station OCM
  match, spot-check, save) are still not run — blocked on the API key above.
- **Steps 2–5 of `docs/ocm-pull-instructions.md` completed, same day, after user
  registered an OCM API key** (held only as `$env:OCM_API_KEY`, never pasted into chat
  or committed). **Step 2:** re-pulled AFDC fresh (`nevi_stations_clean.csv` was indeed
  never committed, confirming the gap the instructions doc called out) and saved
  `data/nevi_stations_current.csv` — 216 rows, exact match to AFDC's own
  `total_results` (no drift). **Step 3:** queried OCM for all 216 stations at
  distance=1mi/maxresults=5/includecomments=true, rate-limited to ~1 req/sec (~5 min
  total), 0 API errors; saved `data/ocm_match_2026-07-20.csv`. OCM's `AddressInfo.Distance`
  field is already computed server-side in the requested unit (verified against a
  near-zero-distance match) — no haversine needed. Fault-report comments are identified
  via OCM's own `UserCommentTypes` reference data: `CommentTypeID 1000` = "Fault Report
  (Notice To Users And Operator)" — confirmed from `/v3/referencedata/`, not guessed
  from keywords. **Results: 182/216 matched within 0.5mi** (avg distance 0.038mi; 26 had
  no POI within 1mi at all; 8 had a nearest POI beyond 0.5mi and were correctly left
  unmatched rather than force-paired). **Step 4:** 5/5 random spot-checks (cross-checked
  full street address + lat/lon against the original AFDC record) confirmed correct
  same-site pairing — including two cases where OCM's display title differs from AFDC's
  (`Katie's Korner - Tesla Supercharger` / `RMP Layton`) but address+coordinates confirm
  same physical site. **[FACT] — key finding: OCM is a near-dead signal for this station
  set.** Of the 182 matched stations, 176 (97%) have zero user comments, and **zero fault
  -report comments (`CommentTypeID 1000`) exist across all 216 NEVI stations**, matched
  or not. This is a directly-observed result, not a pipeline defect (matching logic
  passed spot-check). **[INFERENCE, unconfirmed]** — plausibly because NEVI stations
  skew newer/lower-traffic, or because a meaningful share are Tesla-network sites where
  drivers use the Tesla app instead of OCM, rather than OCM coverage being bad generally.
  **Open question, not yet decided:** whether OCM's near-total comment silence stays in
  the prototype as a (negative) data point in its own right, or gets dropped from the
  active signal set — see Open decisions below.
- **Cowork session verified the push (2026-07-20).** After Claude Code CLI committed and
  pushed `265e79c`, a Cowork session independently confirmed it landed by fetching
  `data/nevi_stations_current.csv` and `data/ocm_match_2026-07-20.csv` directly from
  `raw.githubusercontent.com` (216 rows each, content matches what's described above).
  Note for future debugging: the GitHub REST API's `git/trees` endpoint returned a
  stale/cached result immediately after this push (old SHA, missing `data/`/`docs/`)
  while `raw.githubusercontent.com` and the file content itself were already current —
  if a future session sees an unexpected-looking `git/trees` result right after a push,
  check raw file content before concluding the push failed.

## Progress log — 2026-07-19 (local Claude Code CLI, v1 prototype build)

- **Step 1 — Paren reliability chart read: succeeded, fully.** Unlike Cowork's
  sandboxed fetch tool (`blocked-by-allowlist` on the CDN image), this laptop's normal
  network reached the chart image directly (HTTP 200, valid 3750×1958 PNG) and Claude
  read it multimodally. All 21 NEVI states are now chart- or text-confirmed — **zero
  `unconfirmed` states remain**, including New York and Virginia, which earlier
  sessions had flagged as having no prose figure at all (they do have inline chart
  labels: NY 92.2, VA 94.3).
- **Kansas discrepancy resolved:** report prose states 96.1; the chart's inline label
  reads 96.0. Per project decision, prose is treated as authoritative (unambiguous text
  extraction vs. visual label reading) — 96.1 is the figure used in the dataset.
- **MD/DE/RI resolved via pixel-level line tracing, not assumption.** These three
  (plus 6 non-NEVI Northeast states) are too small for inline labels; the chart uses
  fan-out callout lines instead. Traced all 9 lines pixel-by-pixel from label back to
  map shape (PowerShell + `System.Drawing`), confirmed **zero line crossings**
  mathematically (origin-order matches label top-to-bottom order at every checkpoint
  along the trace), then visually confirmed each of the three target states against its
  actual shape at 4x zoom — Rhode Island is its own light-blue sliver between
  Massachusetts and Connecticut; Delaware is its own peninsula rectangle; Maryland's
  line lands on the mainland shape beside a small DC marker. Rhode Island's traced value
  (90.3) exactly matched a value already independently given in the report's prose,
  cross-validating the tracing method itself. Final: **MD 92.4, DE 94.2, RI 90.3** (RI
  tagged `text_confirmed` since prose already had it; MD/DE tagged
  `chart_confirmed_inferred_position` — a new confidence tier, distinct from a direct
  inline read, added specifically to keep these two from looking as certain as the
  other 19 states).
- **Steps 2–3 — datasets built and validated.**
  `data/paren_state_reliability_q2_2026.json` (21 states, full confidence-tier
  metadata) and `data/nevi_paren_comparison.json` (joined against
  `data/nevi_stations_current.csv`) — station-count sum validated at 216/216, exact
  match to the CSV's own total.
- **Step 4 — network-level view dropped from v1.** Already logged in full under Open
  decisions below (two independent reasons: Paren's CPO leaderboard doesn't publish
  reliability by network at all, and most NEVI networks have too few stations for a
  meaningful per-network rate even if it did).
- **Step 5 — methodology copy written.** `docs/prototype-methodology-copy.md`: the
  NEVI-vs-Paren definitional side-by-side (time-based formula vs. session-outcome
  composite, framed as directional, not a computed gap) plus a short paragraph
  explaining the three confidence tiers, since the frontend surfaces asterisks/daggers
  on some states that need explaining rather than being unexplained marks.
- **Step 6 — frontend built.** `/prototype` (plain HTML/CSS/JS, no build step, no
  framework — separate directory from `/collector`): stat row; sortable state-by-state
  table with a per-row meter bar (single sequential blue hue, deliberately not
  status-colored red/orange, so the visualization doesn't imply a judgment the text
  doesn't support) showing Paren's rate against a marked 97% NEVI line; confidence
  badges (`†` text-confirmed, `*` inferred-position) wired directly into the table with
  a legend explaining them; click-to-expand per-state detail; the Step 5 methodology
  text inlined as a visible page section, not a footnote. Tested via a local headless
  Chrome install (the Chrome extension wasn't connected this session) at desktop,
  375px-mobile, and dark-mode widths — data loads, renders, and sorts correctly.
  Click/expand interaction was traced by hand rather than live-clicked, since headless
  screenshot mode can't simulate clicks without Puppeteer (not installed) — reviewed
  and approved on that basis. **Follow-up, explicitly not a v1 blocker:** add
  `aria-expanded` to the clickable table rows for screen readers.
- **Step 7 — deploy method: Git-based Vercel dashboard import**, not the CLI (neither
  Node.js nor the Vercel CLI is installed on this laptop; installing Node.js was
  treated as a real system change worth asking about first rather than doing silently).
  New Vercel project `nevi-prototype`, Root Directory `prototype`, Framework Preset
  `Other`, no build command — imported from the same GitHub repo as `/collector`. The
  first import build will be empty/fail until this commit lands, since `prototype/`
  wasn't pushed yet at dashboard-import time; Vercel's Git integration auto-redeploys
  on this push. **Production URL not yet recorded here — pending a small follow-up
  commit once the dashboard import finishes building against this push.**

## Progress log — 2026-07-19 (Cowork session — v1 prototype build oversight, session close)

- **Role this session: reviewer/gate for the local Claude Code CLI's v1 build**, not
  just a relay. Created `docs/prototype-build-instructions.md`, packaging 6 of the 7
  identified v1 prototype tasks (data freeze, AFDC/Paren join, network-scope decision,
  methodology copy, frontend build, deploy) into one local Claude Code session.
  Deliberately left out of the automated package: pasting the final iframe into
  WordPress (no WordPress access, shouldn't be given credentials for it) and a human
  visual/mobile QA pass on the live embed (needs eyes, not automation).
- At each step gate, read the actual files directly (`data/nevi_paren_comparison.json`,
  `prototype/app.js`, `prototype/index.html`, `docs/prototype-methodology-copy.md`)
  rather than approving off the CLI's summary alone. This caught one real precision
  issue — instructed the CLI to use the report's prose figure for Kansas (96.1) over
  its own chart-label read (96.0), since text extraction is less error-prone than a
  visual label read — and pushed back once on the MD/DE/RI confidence assignment until
  the CLI added pixel-level line-crossing verification rather than relying on
  geographic-order inference alone. Reviewing `app.js`'s sort/expand logic by hand also
  confirmed no bugs in the one thing the CLI itself flagged as untested (click
  interactions, since headless Chrome without Puppeteer can't simulate clicks).
- **Independently verified commit `eda797e` landed on `main`** via
  `raw.githubusercontent.com` (not the GitHub API — its `/commits` endpoint came back
  empty again, same cached/flaky behavior noted after the `265e79c` push above) —
  `prototype/index.html` and `data/nevi_paren_comparison.json` both confirmed live with
  correct content.
- **Diagnosed a separate, recurring problem this session: this file not being read
  first.** At least 3 separate Cowork sessions on this project (including this one's
  own opening message) have started by reading the stale synced Project knowledge
  cache instead of this file, despite the Cowork session protocol above already
  documenting the fix. Confirmed via `session_info` transcripts that a prior session
  already hit this exact failure and tried to fix it by editing that same protocol
  section — the fix didn't hold in this session. [INFERENCE] Root cause: the synced
  Project cache auto-loads into context with no action required, while reading this
  file requires actively deciding to do so before responding to whatever was actually
  asked — writing "read this first" into the file doesn't change that upstream
  decision, since the decision to open the file happens before the file's own contents
  can act on anything. Not re-editing the protocol section again for this reason (that
  exact fix was already tried once and didn't transfer to this session); the more
  durable mitigation found so far is the user opening new Cowork sessions with an
  explicit "read CLAUDE.md at [path]" instruction rather than relying on the file to
  enforce its own read order.

## Progress log — 2026-07-20 (Cowork session — prototype deploy verified)

- **v1 prototype deployed to Vercel, production URL confirmed live.** User completed
  the dashboard import (Root Directory `prototype`, Framework Preset `Other`, no build
  command) from this same GitHub repo. First URL the user shared
  (`nevi-self-reporting-gap-i4u4-xoi4vdxpz-james-sanders.vercel.app`) was a
  per-deployment preview URL, not the production alias — `web_fetch` on it returned
  Vercel's SSO login page (confirmed directly, not assumed), consistent with Vercel's
  Standard Protection gating preview/deployment URLs by default on Hobby plan. The
  correct production domain, **`nevi-self-reporting-gap-i4u4.vercel.app`**, was
  confirmed separately: `web_fetch` on the root returns the actual page (title,
  methodology copy, no login gate), and `web_fetch` on `/data/nevi_paren_comparison.json`
  returns valid JSON with all 21 states and a station-count sum of 216, matching
  `data/nevi_stations_current.csv`. Note the Vercel project name Vercel actually used
  was `nevi-self-reporting-gap` (matching the repo name), not `nevi-prototype` as
  originally instructed in the 2026-07-19 build steps — cosmetic, doesn't affect
  anything, but flagging so a future session isn't confused if it goes looking for a
  project literally named `nevi-prototype` and doesn't find one.
- **Next, not yet done:** WordPress `<iframe>` embed snippet for jamesaksanders.com's
  Custom HTML block — unblocked now that the production URL exists, but not yet
  produced or pasted in. See Open decisions below.

## Progress log — 2026-07-20 (Cowork session — article + campaign plan drafted, project reframed)

- **Reframing decided:** after the coverage-of-state-fleet check below undercut the original
  "here's the gap" framing, and a fresh credibility assessment found the project weak on both
  industry cut-through and AI/ML/agentic demonstration, the project was explicitly reframed
  around the honest, smaller claim: NEVI's 97% self-report requirement survived the 2025
  funding freeze and litigation unchanged, and adequate public data doesn't exist to verify it
  at the station level for most states. AI/ML/agentic demonstration was ruled out as a goal for
  this project specifically — it was scoped away from that on day one (see the early "New
  session" status-check finding) for good positioning reasons, and none of the three signals
  tried (staleness correlation, OCM, AFDC flapping) changed that. If AI/ML demonstration is
  still wanted, it needs a separate project.
- **[FACT] NEVI regulatory context updated and verified** — CLAUDE.md's prior "why now" framing
  (2023 Federal Register final rule) was incomplete. Verified via web search: FHWA froze ~$2.74B
  in unobligated NEVI funds in Feb 2025, a June 2025 court order forced a partial restart, FHWA
  issued Interim Final Guidance Aug 11/13 2025 (loosened siting/certification rules but left
  uptime, EV-ChART reporting, and all other technical standards unchanged), and a Jan 23 2026
  summary judgment ruled the original freeze unlawful. $885M FY26 funds apportioned; a
  House-passed FY26 budget resolution also proposes ~$500M in cuts. Full citations in the
  article's References section.
- **Article drafted**: `article/nevi-uptime-audit-article.md`. Structure and voice modeled
  directly on the two existing jamesaksanders.com portfolio pieces (exec summary up front,
  methodology sections, results reported plainly including negative/null results, future work,
  numbered references) — fetched and read both in full before drafting. Includes an explicit
  AI-collaboration credit line, matching the collaborator-credit convention in the source
  pieces. All citations (Liu et al. DOI, Rempel et al. Human Factors DOI, ChargerHelp report
  URL, Paren report URL, Beyond Uptime arXiv ID, FHWA IFG PDF) verified to resolve via direct
  fetch/search before inclusion.
- **Campaign plan drafted**: `article/nevi-campaign-plan.md`. Sets realistic expectations
  (credibility over reach), segments the audience into three groups per the earlier fresh
  assessment (policy/EV journalists — best fit; NEVI compliance staff — well served by the
  reframed claim; charging-network reliability engineers — hardest fit, methodology-only pitch)
  with a pre-publish checklist, channel-by-channel tactics (personal site, LinkedIn, a direct
  pitch to Atlas EV Hub — found during research to cover NEVI guidance closely — and courtesy
  outreach to ChargerHelp/Paren as cited sources), and honest success metrics.
- **Not yet done**: user review/edit of both drafts, running the pre-publish checklist items
  (prototype coverage-ratio caveat, OCM framing decision, link resolution spot-check, prototype
  URL reconfirmation), actually publishing.

## Progress log — 2026-07-20 (Cowork session — NEVI coverage-of-state-fleet check)

- **New methodological question raised, partially answered: what fraction of each
  state's total DCFC fleet do our 216 NEVI stations represent, and is it reasonable to
  attribute Paren's state-level reliability average to just the NEVI subset?** This had
  never been checked — every prior data pull filtered AFDC to `funding_sources: NEVI`
  only; no "all DCFC stations in this state" baseline existed.
- **[FACT]** Pulled AFDC/NLR totals (`fuel_type=ELEC&ev_charging_level=dc_fast`) for 11
  of the 21 NEVI states, using `total_results` from a `limit=1` call (small response,
  avoids the payload-size truncation that broke the scheduled snapshot task). Coverage
  ratio (NEVI stations ÷ total state DCFC stations) ranges from **0.03% (CA: 1 of 2,877)
  to 16.95% (KY: 20 of 118)** — roughly a 500x spread. Full 11-state table saved to
  `data/state_dcfc_coverage_partial_2026-07-20.json`. Sorted high to low: KY 16.95%,
  ME 5.93%, HI 3.77%, DE 3.57%, KS 3.53%, CO 2.51%, MD 2.18%, MI 1.74%, AZ 0.44%,
  GA 0.18%, CA 0.03%.
- **Remaining 10 states (MN, NM, NY, OH, PA, RI, TX, UT, VA, WI) blocked on DEMO_KEY
  rate limiting** — empty response body, no error, same failure signature already
  documented for OpenChargeMap and the scheduled snapshot task elsewhere in this file.
  Retried NY alone after a 40s pause; still blocked, so this isn't a burst/parallel-call
  issue that clears quickly — treating it as the same underlying DEMO_KEY constraint
  already flagged as an open item below (register a real key), not something to keep
  retrying blindly.
- **[INFERENCE] Methodological implication, not yet resolved:** where NEVI's coverage
  share is tiny (CA 0.03%, GA 0.18%, AZ 0.44%), Paren's state average is overwhelmingly
  driven by non-NEVI stations — attributing it to the 1-2 NEVI stations in that state is
  a weak inference with no direct evidentiary link. Where coverage is highest (KY
  16.95%, ME 5.93%), the state average is still majority non-NEVI but less diluted,
  making the attribution somewhat less unreasonable, though still not equivalent to a
  NEVI-specific measurement. **[SPECULATION, flagged not asserted]** there's also a
  possible population mismatch independent of size: NEVI stations are systematically
  newer (funding began 2022, corridor-gap-filling mandate) than a state's broader DCFC
  fleet, which includes long-tail older/urban installations (e.g., car-dealership
  chargers visible in the raw AFDC pulls) — this could bias the comparison in either
  direction and hasn't been tested.
- **Not yet decided:** whether to (a) finish the remaining 10 states once a real API key
  exists, (b) add a coverage-ratio column/caveat to the prototype and methodology copy
  so readers can judge per-state attribution strength themselves (current lean, since it
  fits the project's existing confidence-tier pattern for Paren reads), or (c) treat this
  as an article-only caveat without touching the live prototype.

## Open decisions

- **New, 2026-07-20:** Finish the state DCFC-fleet coverage pull for the remaining 10
  states (MN, NM, NY, OH, PA, RI, TX, UT, VA, WI) once a real AFDC/NLR API key exists —
  same registration already listed as an open item below. Then decide whether coverage
  ratio becomes a visible column/caveat in the prototype (current lean: yes) or stays
  article-only.
- **Updated 2026-07-19 (Cowork session):** Attempted to close this via Paren's public
  Q2 2026 report page (`paren.app/reports/us-ev-fast-charging-q2-2026`, published
  2026-07-14) instead of re-reading the screenshot. Its prose is *not* JS-gated —
  contradicts the earlier "JS-gated, couldn't scrape" finding; text fetched cleanly via
  `web_fetch`. But the actual state-by-state figures live in an embedded chart image
  ("Avg DCFC Reliability Rate by State"), and neither `bash`/curl (blocked by the
  sandbox's proxy allowlist — same `blocked-by-allowlist` failure signature as the
  OpenChargeMap block) nor `web_fetch` (returns empty body for binary image content)
  can read chart pixel values. No Chrome browser is connected this session either.
  **Partial result:** the report's text explicitly names Maryland and Delaware as two
  of five states that "crossed above 90" reliability in Q2 2026 (up from below 90
  previously) — directionally consistent with the existing screenshot-derived figures
  for those two, though exact digits aren't stated in text. New York and Virginia get
  no reliability figure in text at all (Virginia is mentioned only for utilization,
  16.6%). **Still open:** exact MD/DE digits and both NY/VA figures need either the
  original screenshot re-shared, or a Chrome browser connected to this account so a
  future session can read the chart directly — same fix path already identified for
  OpenChargeMap.
- **Re-scoped 2026-07-19 (Cowork session):** "Reconcile Paren vs. EV-ChART" was
  probably the wrong framing for this task — checked both formulas directly rather than
  leaving it as an open TODO. [FACT, sourced] NEVI's EV-ChART uptime formula is public
  and time-based: uptime% = (total hours − downtime hours) / total hours × 100, per
  port, 97% annual minimum (Federal Register NEVI final guidance; driveelectric.gov
  NEVI Q&A). [FACT, sourced] Paren's Reliability Index (per its own published Appendix
  B / terminology definitions) is a different construct: a proprietary composite of
  four session-level outcomes — clean success, success-with-retry, failed attempt, and
  downtime — not a time-based uptime percentage. These don't share a unit, so there's
  no clean conversion between them; producing one converted, apples-to-apples gap
  number is probably not achievable — not because the analysis is incomplete, but
  because the two metrics measure structurally different things by design. **New
  scope:** drop the goal of a single converted gap percentage. The article's
  methodology section instead states both definitions explicitly, side by side, and
  treats the comparison as directional — NEVI's self-reported claim vs. what an
  independently measured, differently defined metric suggests — rather than a precise
  compliance-gap calculation. This is consistent with the project's epistemic
  standards and is a stronger claim for this audience than false precision would be.
- Whether to attempt outreach to Paren for a data-sharing arrangement beyond published
  aggregates, or stay strictly public-data-only (current default: public-only).
- **Resolved 2026-07-20:** OpenChargeMap pull is unblocked and complete (registered API
  key + `docs/ocm-pull-instructions.md` Steps 0–5 run end-to-end from local Claude Code
  CLI; see Progress log above). **New open decision in its place:** OCM returned zero
  fault-report comments across all 216 NEVI stations and near-zero comments generally
  (176/182 matched stations have none). Decide whether to (a) keep OCM out of the
  prototype's active signal set entirely since it has nothing to contribute, (b) cite
  the near-total silence itself as a minor supporting data point (e.g. "even the one
  open crowdsourced channel available shows negligible community reporting at NEVI
  sites"), or (c) revisit later once more OCM community activity may exist. Current
  lean: (b), briefly, rather than building any prototype view around it — but not yet
  decided.
- **Resolved 2026-07-19 (local Claude Code CLI, prototype build Step 4):** Network-level
  view dropped from v1 prototype, for two independent reasons checked separately per
  `docs/prototype-build-instructions.md` Step 4. (a) Paren's public CPO/hardware
  leaderboard (`paren.app/cpo-hardware-leaderboard`) does not publish reliability by
  network at all — it shows station/port totals, monthly growth, 150+kW port counts,
  and average price; reliability/uptime data isn't one of the listed metrics and full
  dataset access requires "requesting a demo." (b) Even if it did, NEVI's own
  per-network station counts (`data/nevi_stations_current.csv` grouped by `ev_network`)
  are too thin for most networks to support a meaningful comparison: FCN 37, ChargePoint
  Network 36, eVgo Network 35, Electrify America 29, Tesla 26, Kwik Charge 19 are large
  enough to say something; the other 11 networks are single digits (Red E 8, Electric
  Era 5, Jule 4, SWTCH 4, EV Connect 3, Non-Networked 2, Applegreen 2, Circle K 2, Rivian
  Adventure 2, PowerUp 1, RaceTrac 1) — a 1- or 2-station "network reliability rate"
  isn't a real signal. Either reason alone would justify dropping network-level from v1;
  having both independently confirmed removes any ambiguity for a future session.
  State-level (Steps 2–3) is the only comparison view in v1.
- **Resolved 2026-07-19 (local Claude Code CLI, prototype build Steps 1–3):** The
  "still open" MD/DE/NY/VA item two bullets up is closed. All 21 NEVI states are now
  chart- or text-confirmed with zero `unconfirmed` entries — see the Progress log
  above for the pixel-tracing method used on MD/DE/RI specifically.
- Register a real (non-DEMO_KEY) AFDC/NLR API key at developer.nlr.gov/signup for
  ongoing use, rather than relying on the public rate-limited key.
- Drafting the article's fixed front-matter (regulatory hook, positioning-against-
  prior-work, methodology) — not yet started; can proceed in parallel with prototype
  build since it doesn't depend on prototype results.
- **Resolved 2026-07-20 (Cowork session):** Vercel dashboard import completed and
  production URL confirmed live and public:
  `https://nevi-self-reporting-gap-i4u4.vercel.app/` (verified via direct `web_fetch`,
  not taken on the user's word alone — see Progress log above). **New open item in its
  place:** the WordPress `<iframe>` embed snippet for the Custom HTML block on
  jamesaksanders.com — not yet produced.
- **New, 2026-07-19 (Cowork session close), non-blocking:** add `aria-expanded` to the
  prototype's clickable state-table rows for screen readers — flagged during Step 6,
  not yet fixed. Not a v1 launch blocker.
