# nevi-status-collector

Daily Vercel Cron Job for the *NEVI Self-Reporting Gap* project. Pulls the
current NEVI-funded EV charging station set from the AFDC/NLR API and writes
a dated CSV snapshot to Vercel Blob, building a time series used to detect
status-flapping ("zombie charger") patterns that a single self-reported
annual uptime number would mask.

## Deploy

1. Push this folder to a GitHub repo (or import it directly in the Vercel
   dashboard as a new project — either works).
2. In the Vercel project settings:
   - **Storage** tab -> Create/link a **Blob store**. This auto-injects
     `BLOB_READ_WRITE_TOKEN` as an env var — no manual key entry needed.
   - **Environment Variables** -> add `CRON_SECRET` (any random string,
     16+ characters — a password generator works fine). This is required;
     the endpoint rejects requests without it.
   - Optional: add `AFDC_API_KEY` if you've registered a real key at
     developer.nlr.gov/signup instead of using the public `DEMO_KEY`.
3. Deploy. Vercel reads `vercel.json` and registers the cron job
   automatically — nothing else to configure.

Cron currently runs daily at **12:00 UTC** (`vercel.json` -> `crons[0].schedule`).
Hobby plan allows one run/day with timing accurate to within the hour;
adjust the cron expression and redeploy if you want a different time.

## Endpoints

- `GET /api/collect-status` — cron target. Requires
  `Authorization: Bearer <CRON_SECRET>`. Vercel sends this automatically on
  scheduled invocations; you can also curl it manually with the same header
  to test or backfill a day.
- `GET /api/list-snapshots` — public, no auth. Returns all stored snapshots
  (pathname, URL, upload time, size) — this is what the interactive
  prototype's frontend should call to pull snapshot data directly from Blob
  storage.

## Data source & scope

Same constraints as the rest of the project: public/free AFDC data only,
no paid or rate-limited APIs, no predicted/modeled uptime — this collector
only stores what AFDC itself reports (`status_code`, `updated_at`,
`date_last_confirmed`), which is a *reporting* signal, not an independently
verified uptime measurement. See the project brief for the full
positioning rationale.
