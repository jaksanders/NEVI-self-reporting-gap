# OpenChargeMap pull — instructions for a local Claude Code session

Paste this whole block into a Claude Code CLI session running in this repo
(`C:\Users\jsanders\Documents\NEVI\NEVI-self-reporting-gap`), on the laptop, not Cowork.

## Why this exists

OpenChargeMap (OCM) is the one open item in this project's data plan: an independent,
crowdsourced, station-level signal (user check-ins + "fault report" comments) that
would sit alongside AFDC/NREL station metadata and Paren's aggregate index. It's been
blocked twice from the Cowork sandbox — `api.openchargemap.io` returns an empty
response body on every request there, while the same sandbox reaches `developer.nlr.gov`
(AFDC) fine. That isolates the block to Cowork's own network allowlist, not an OCM
outage. This machine has normal, unrestricted network access, so the first job is
confirming that actually fixes it — not building the full pipeline blind.

## Objective

For each of the 216 NEVI-funded stations already identified from AFDC, find the
matching OpenChargeMap POI (if one exists) and pull its comment/check-in history,
specifically looking for fault-report-type comments as an independent reliability
signal.

---

### Step 0 — Diagnostic first. Do not skip to Step 2.

Run from a plain shell (not through any wrapper/tool that might impose its own limits):

```
curl -sS -D - -o /tmp/ocm_test.json "https://api.openchargemap.io/v3/poi/?output=json&countrycode=US&maxresults=3&compact=true"
cat /tmp/ocm_test.json
```

Report exactly: HTTP status code, response headers, and whether the body is valid JSON
containing real POI records. **Stop and report if this fails** (empty body, 401, 403,
or malformed JSON) — do not work around a failure here with retries or alternate
endpoints. If it fails the same way it did in Cowork, that's a real finding (OCM may
now require a key for any programmatic access, or something else changed) — report it,
don't paper over it.

### Step 1 — API key, only if Step 0 indicates one is required

Check current auth requirements at https://openchargemap.org/site/develop/api. If a key
is required, tell the user to register one themselves at
https://openchargemap.org/site/profile/applications — do not attempt to create an
account automatically. Once the user provides a key, use it as `&key={API_KEY}` on
requests.

### Step 2 — Get the NEVI station list with coordinates

Check whether a station list with lat/lon already exists somewhere on this machine
(e.g. search for `nevi_stations_clean.csv` — it was built once in a prior Cowork
session but may not have been saved to this repo). If found, validate it has
`latitude`/`longitude` columns and ~216 rows before trusting it.

If not found, re-pull fresh from AFDC:

```
GET https://developer.nlr.gov/api/alt-fuel-stations/v1.json?api_key=DEMO_KEY&fuel_type=ELEC&funding_sources=NEVI&country=US&limit=all
```

Extract `id`, `station_name`, `state`, `latitude`, `longitude`, `ev_network`,
`funding_sources`. Verify the row count matches the response's own `total_results`
(expect ~216; drift is fine, just record it). **Save this as
`data/nevi_stations_current.csv` in this repo** — the fact that the earlier version of
this file existed only on a laptop and never got committed is exactly the kind of gap
this project is trying to close. Commit it.

### Step 3 — For each station, query OCM for the nearest matching POI

```
https://api.openchargemap.io/v3/poi/?output=json&countrycode=US&latitude={lat}&longitude={lon}&distance=1&distanceunit=Miles&maxresults=5&compact=false&verbose=false&includecomments=true
```

(append `&key={API_KEY}` if Step 1 determined it's required)

Before assuming OCM returns a ready-made distance field, check an actual response —
compute the distance yourself (haversine) if it doesn't. Take the single closest POI
within **0.5 miles**; anything farther is not a match — record it as unmatched rather
than forcing a low-confidence pair. A wrong match here is worse than no match, since it
would silently poison the reliability comparison downstream.

For each real match, extract: `ocm_poi_id`, `distance_miles` (computed), OCM's
operator/network name (cross-check against AFDC's `ev_network` as a sanity signal),
`comment_count`, count of comments that are actually fault/problem-type per **OCM's own
comment-type field in the response** (don't guess this from keywords — read what the
schema actually gives you), `most_recent_comment_date`, and OCM's own status field if
present.

Rate-limit to at least 1 request/second. 216 stations means several minutes minimum —
don't try to parallelize hard against a free community API.

### Step 4 — Spot-check before trusting any of it

Manually verify 5 of the matches: open `https://openchargemap.io/poi/{ocm_poi_id}` and
the AFDC station's own location, confirm they're the same physical site, not just
nearby. Report the spot-check outcome explicitly in your final summary — a
plausible-looking match rate means nothing if the underlying pairing logic is wrong.

### Step 5 — Save and report

Save all 216 rows (matched or not) to `data/ocm_match_{YYYY-MM-DD}.csv` in this repo.
Report: how many matched within 0.5mi, how many matched stations had zero comments at
all (a dead/quiet signal, not evidence of good or bad reliability on its own), how many
had at least one fault-report-type comment, and the Step 4 spot-check result. If Step 0
failed, report only that — no fabricated downstream numbers.

## Constraints

- Public/free OCM data only, consistent with the rest of this project — no paid tier,
  no scraping behind a login.
- Label findings `[FACT]` (directly observed in a response) vs. `[INFERENCE]` (deduced)
  per this repo's epistemic standards in `CLAUDE.md` — this feeds an article read by a
  skeptical, technical audience.
- Follow `CLAUDE.md`'s session protocol: check `git status` / pull at the start of the
  session, commit and push what gets built, and update the Progress log / Open
  decisions sections with what actually happened — including a clean report if Step 0
  fails again.
