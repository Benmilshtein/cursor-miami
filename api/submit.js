// Vercel serverless function: stores form submissions in Airtable.
// Tokens stay server-side; the browser never sees them.
//
// Setup:
//   1. Create a free Airtable base named e.g. "Cursor Miami" with two tables:
//      - "Inquiries": fields  Type | Name | Email | Company | Title | Vision | Budget | Message
//      - "Projects":  fields  Project | Name | Email | Event | Links | Description
//        (all "Single line text" except Vision/Message/Description = "Long text")
//   2. Create a token at https://airtable.com/create/tokens with scope
//      data.records:write limited to that base.
//   3. Find the base id (starts with "app") at https://airtable.com/api
//   4. vercel env add AIRTABLE_TOKEN
//      vercel env add AIRTABLE_BASE_ID
//   5. Redeploy.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) return res.status(500).json({ error: 'Airtable env vars not configured' });

  const b = req.body || {};

  // honeypot: real users never fill this hidden field
  if (b.website) return res.status(200).json({ ok: true });

  const name = String(b.name || '').trim().slice(0, 200);
  const email = String(b.email || '').trim().slice(0, 200);
  if (!name || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Name and a valid email are required' });
  }

  let table, fields;
  if (b.type === 'project') {
    const project = String(b.project || '').trim().slice(0, 300);
    if (!project) return res.status(400).json({ error: 'Project name is required' });
    table = 'Projects';
    fields = {
      Project: project,
      Name: name,
      Email: email,
      Event: String(b.event || '').slice(0, 200),
      Links: String(b.links || '').slice(0, 1000),
      Description: String(b.message || '').slice(0, 5000)
    };
  } else if (['speaker', 'sponsor', 'cosponsor', 'collaborate', 'cohost', 'other'].includes(b.type)) {
    const TYPE_LABELS = {
      speaker: 'Speaker',
      sponsor: 'Sponsor',
      cosponsor: 'Co-sponsor / partnership',
      collaborate: 'Collaborate',
      cohost: 'Co-host',
      other: 'Other'
    };
    table = 'Inquiries';
    fields = {
      Type: TYPE_LABELS[b.type],
      Name: name,
      Email: email,
      Company: String(b.company || '').slice(0, 300),
      Title: String(b.title || '').slice(0, 200),
      Vision: String(b.vision || '').slice(0, 5000),
      Budget: String(b.budget || '').slice(0, 100),
      Message: String(b.message || '').slice(0, 5000)
    };
  } else {
    return res.status(400).json({ error: 'Unknown submission type' });
  }

  try {
    const r = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [{ fields }], typecast: true })
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error('Airtable error', r.status, detail);
      return res.status(502).json({ error: 'Storage failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'Storage unreachable' });
  }
}
