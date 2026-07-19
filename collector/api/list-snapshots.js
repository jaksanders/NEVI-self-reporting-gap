// api/list-snapshots.js
//
// Public read endpoint (no auth) so the eventual interactive prototype's
// frontend can list and fetch daily NEVI status snapshots directly from
// Vercel Blob without needing its own backend.
//
// GET /api/list-snapshots -> { snapshots: [{ pathname, url, uploadedAt, size }, ...] }

import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: 'snapshots/' });
    const snapshots = blobs
      .map((b) => ({
        pathname: b.pathname,
        url: b.url,
        uploadedAt: b.uploadedAt,
        size: b.size,
      }))
      .sort((a, b) => (a.pathname < b.pathname ? 1 : -1)); // newest first
    return res.status(200).json({ snapshots });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list snapshots', detail: String(err) });
  }
}
