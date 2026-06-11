// Vercel serverless function: proxies the Luma Plus API.
// The API key stays here on the server (env var LUMA_API_KEY) and is never
// exposed to visitors. The browser only ever sees sanitized, public-safe JSON.
//
// Setup:
//   1. Create a key at https://luma.com/calendar/manage/api-keys (Cursor Miami calendar)
//   2. vercel env add LUMA_API_KEY   (paste the key, select all environments)
//   3. Redeploy. The site now self-updates from Luma.

export default async function handler(req, res) {
  const key = process.env.LUMA_API_KEY;
  if (!key) return res.status(500).json({ error: 'LUMA_API_KEY is not configured' });

  try {
    const r = await fetch('https://public-api.luma.com/v1/calendar/list-events?pagination_limit=100', {
      headers: { 'x-luma-api-key': key }
    });
    if (!r.ok) return res.status(502).json({ error: 'Luma API responded ' + r.status });
    const data = await r.json();

    const now = Date.now();
    const events = (data.entries || []).map(entry => {
      const ev = entry.event || entry;
      const geo = ev.geo_address_json || {};
      return {
        name: ev.name || null,
        url: ev.url ? (ev.url.startsWith('http') ? ev.url : 'https://luma.com/' + ev.url) : null,
        start_at: ev.start_at || null,
        cover_url: ev.cover_url || null,
        guest_count: typeof ev.guest_count === 'number' ? ev.guest_count : null,
        location: geo.full_address || geo.address || geo.city_state || null
      };
    }).filter(e => e.start_at);

    const upcoming = events
      .filter(e => new Date(e.start_at).getTime() >= now)
      .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
    const past = events
      .filter(e => new Date(e.start_at).getTime() < now)
      .sort((a, b) => new Date(b.start_at) - new Date(a.start_at));
    const totalGuests = events.reduce((s, e) => s + (e.guest_count || 0), 0);

    // cache at the edge for 5 min; serve stale up to 1 h while refreshing
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    res.status(200).json({
      upcoming,
      past,
      stats: { events: events.length, totalGuests }
    });
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Luma' });
  }
}
