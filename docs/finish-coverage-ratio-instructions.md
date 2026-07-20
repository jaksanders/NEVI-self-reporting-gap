# Finishing the state DCFC-fleet coverage check (remaining 10 states)

## Context

`data/state_dcfc_coverage_partial_2026-07-20.json` has total-DCFC-fleet counts for 11 of 21
NEVI states (KY, ME, HI, DE, KS, CO, MD, MI, AZ, GA, CA), pulled from the AFDC/NLR API using
the public `DEMO_KEY`. The remaining 10 (MN, NM, NY, OH, PA, RI, TX, UT, VA, WI) are blocked —
`DEMO_KEY` returns an empty response body for these calls (confirmed not a short-window
throttle: retried after 40s and again after ~90 minutes of unrelated session activity, same
result both times). This needs a real, registered API key to finish.

The exec summary and the two "overall summary" visualizations in
`article/nevi-uptime-audit-article.md` currently generalize from just these 11 states
("a typical state," "for most states") — that's flagged as needing the full 21 before it's
published. This doc is the complete path to closing that out.

## Step 0 — Register a real API key (you, not Claude)

Go to https://developer.nlr.gov/signup and request a free API key. Hold it as an environment
variable only — do not paste it into any Claude Code chat message, do not commit it to any
file. In PowerShell, before starting `claude`:

```
$env:NLR_API_KEY = "your-key-here"
```

This matches how the OCM API key was handled earlier in this project (see CLAUDE.md's
2026-07-20 "local Claude Code CLI" progress log entry) — same reasoning: this project already
has one open, unresolved incident (a different project, `trading-strategies`) where a live key
ended up in a saved chat log.

## Step 1 — Pull total DCFC counts for the remaining 10 states

For each of MN, NM, NY, OH, PA, RI, TX, UT, VA, WI, call:

```
https://developer.nlr.gov/api/alt-fuel-stations/v1.json?api_key=$env:NLR_API_KEY&fuel_type=ELEC&ev_charging_level=dc_fast&state=<STATE>&country=US&limit=1
```

Read `total_results` from the JSON response — that's the state's total public DCFC station
count. `limit=1` keeps the response small (avoids the payload-truncation issue that broke the
scheduled snapshot task elsewhere in this project); the single returned station record can be
ignored, only `total_results` matters here.

NEVI station counts per state (already known, from `data/nevi_stations_current.csv`):
MN 7, NM 8, NY 21, OH 22, PA 42, RI 6, TX 14, UT 5, VA 2, WI 20.

## Step 2 — Build the complete 21-state dataset

Merge these 10 with the existing 11 into a new file, `data/state_dcfc_coverage_2026-<pull
date>.json`, same schema as `state_dcfc_coverage_partial_2026-07-20.json` but with
`"status": "COMPLETE - 21 of 21 NEVI states"` in `_meta`, and every state's
`nevi_coverage_pct` computed as `nevi_station_count / total_dcfc_stations * 100`. Sort by
coverage % descending, same as the existing partial file.

Validate: NEVI station counts across all 21 states should sum to 216 (matches
`nevi_stations_current.csv`'s own total) — check this before treating the file as done.

## Step 3 — Update the article with real numbers, not placeholder language

Once the full 21-state range is known, update `article/nevi-uptime-audit-article.md`:

- **Exec summary**: replace "NEVI-funded stations account for well under 3% of a typical
  state's total DC fast-charging fleet — ranging from 0.03% in California to 17% in Kentucky"
  with the actual median/range across all 21 states — the specific numbers may shift once the
  other 10 are in, so don't just keep the old figures with the caveat removed. Same for "for
  most states, barely a measurement of NEVI stations at all" — check whether that's still true
  as a majority-of-21 statement, not just majority-of-11.
- **Finding 1 section**: replace the 11-row table with all 21 states; remove the "11 of 21
  NEVI states confirmed; remaining 10 blocked on API rate limit" note (that becomes untrue);
  update the prose range/dilution examples if the extremes changed.
- **Regenerate the two charts that used the 11-state subset** —
  `article/images/finding1-coverage-ratio.png` and
  `article/images/summary-coverage-vs-reliability.png`. The plotting script used to build them
  the first time is not saved in this repo (it was run ad hoc in a Cowork sandbox session) —
  rebuild using the same visual style as the existing charts in `article/images/` (single blue
  accent `#2b6cb0`, light gray gridlines `#e0e0e0`, log-scale x-axis for the coverage chart,
  97% reference line in red `#c53030` for the summary scatter, state labels on scatter points,
  captions in gray `#718096` below each chart) — match `finding2-...` and `finding3-...` in
  `article/images/` for exact styling reference, both of which are already complete-data and
  don't need regeneration.
- Once complete, the summary chart's "The Whole Audit in One Chart" title is fully earned —
  no title change needed, just the underlying data and the 11-of-21 caveat text in its own
  caption.

## Step 4 — Close out in CLAUDE.md

Update the Progress log and Open decisions sections: mark the coverage-ratio pull complete,
note the final 21-state range, and record whether the exec summary numbers changed materially
from the 11-state preview.

## Step 5 — Commit and push

```
cd C:\Users\jsanders\Documents\NEVI\NEVI-self-reporting-gap
git add data/ article/ CLAUDE.md docs/finish-coverage-ratio-instructions.md
git commit -m "Complete 21-state DCFC coverage-ratio check; update article with full data"
git push origin main
```

Per this repo's own rule, run git locally or via Claude Code CLI — not from a Cowork session's
bash tool against this mounted folder.
