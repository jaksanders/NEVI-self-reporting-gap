// api/collect-status.js
//
// Vercel Cron Job target. Runs daily (see vercel.json), pulls the current
// NEVI-funded EV charging station set from the federal AFDC/NLR Alternative
// Fuel Stations API, and writes a dated snapshot CSV to Vercel Blob.
//
// This builds a day-by-day time series of status_code / updated_at per
// station, used to detect status "flapping" (zombie chargers) that a single
// annual self-reported uptime number would mask.
//
// Required env vars (set in Vercel project settings):
//   BLOB_READ_WRITE_TOKEN  - auto-injected once you create/link a Blob store
//   CRON_SECRET            - random string; Vercel sends it as
//                            "Authorization: Bearer <CRON_SECRET>" on cron
//                            invocations, so this endpoint can reject
//                            anyone else who hits the URL directly.
// Optional:
//   AFDC_API_KEY            - defaults to the public DEMO_KEY (rate-limited
//                             but sufficient for one call/day).

import { put, list } from '@vercel/blob';

const AFDC_BASE = 'https://developer.nlr.gov/api/alt-fuel-stations/v1.json';

function todayUTC() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function toCsvRow(fields) {
  return fields
    .map((v) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(',');
}

export default async function handler(req, res) {
  // --- auth: only Vercel's own cron invocation (or a manual run with the
  // same secret) may trigger this endpoint ---
  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.AFDC_API_KEY || 'DEMO_KEY';
  const snapshotDate = todayUTC();

  const url =
    `${AFDC_BASE}?api_key=${encodeURIComponent(apiKey)}` +
    `&fuel_type=ELEC&funding_sources=NEVI&country=US&limit=all`;

  let afdcResponse;
  try {
    afdcResponse = await fetch(url);
  } catch (err) {
    return res.status(502).json({ error: 'AFDC fetch failed', detail: String(err) });
  }

  if (!afdcResponse.ok) {
    return res.status(502).json({
      error: 'AFDC API returned non-200',
      status: afdcResponse.status,
    });
  }

  let data;
  try {
    data = await afdcResponse.json();
  } catch (err) {
    return res.status(502).json({ error: 'AFDC response was not valid JSON', detail: String(err) });
  }

  const stations = Array.isArray(data.fuel_stations) ? data.fuel_stations : [];
  const totalResults = data.total_results ?? null;

  if (stations.length === 0) {
    return res.status(502).json({
      error: 'AFDC returned zero stations — not writing an empty snapshot',
      total_results: totalResults,
    });
  }

  const header = [
    'snapshot_date',
    'id',
    'station_name',
    'city',
    'state',
    'status_code',
    'updated_at',
    'date_last_confirmed',
    'ev_network',
    'funding_sources',
    'ev_dc_fast_num',
    'total_results_reported',
  ];

  const rows = [toCsvRow(header)];
  for (const s of stations) {
    rows.push(
      toCsvRow([
        snapshotDate,
        s.id,
        s.station_name,
        s.city,
        s.state,
        s.status_code,
        s.updated_at,
        s.date_last_confirmed,
        s.ev_network,
        Array.isArray(s.funding_sources) ? s.funding_sources.join('|') : s.funding_sources,
        s.ev_dc_fast_num,
        totalResults,
      ])
    );
  }
  const csv = rows.join('\n');

  const filename = `snapshots/nevi_status_snapshot_${snapshotDate}.csv`;

  let blob;
  try {
    blob = await put(filename, csv, {
      access: 'private',
      contentType: 'text/csv',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Blob upload failed', detail: String(err) });
  }

  return res.status(200).json({
    snapshot_date: snapshotDate,
    stations_captured: stations.length,
    total_results_reported_by_afdc: totalResults,
    blob_url: blob.url,
  });
}
