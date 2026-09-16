// api/lead.js
//
// Vercel serverless function — server-side lead capture for the website
// forms (currently the TallyCapital enquiry form on /services/tally-capital).
//
// Why this exists: the SOP requires leads to arrive by mail. A mailto: link
// depends on the visitor having a mail client configured, and silently loses
// the lead when they do not. This endpoint owns delivery instead.
//
// Flow, in this order on purpose:
//   1. Validate the payload (a bad request never touches the DB).
//   2. INSERT the lead into Supabase with the service-role key.
//   3. Send the notification email via Resend.
//   4. PATCH the row with whether the mail actually went out.
//
// Storing before sending means a Resend outage costs us the email, never
// the lead — it is still in the table and visible in the admin panel.
//
// The two legs are independent and each is optional, so the endpoint keeps
// working on a partial setup: with only RESEND_API_KEY it emails without
// storing; with only the Supabase pair it stores without emailing. It fails
// only when neither is configured, because then the lead would vanish.
//
// Env vars (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY              resend.com → API Keys        — enables email
//   SUPABASE_SERVICE_ROLE_KEY   Supabase → Settings → API    — enables storage
//   SUPABASE_URL                optional; falls back to VITE_SUPABASE_URL
//   LEAD_TO_EMAIL               optional; defaults to unisysjpr@yahoo.com
//   LEAD_FROM_EMAIL             optional; defaults to onboarding@resend.dev
//
// SUPABASE_SERVICE_ROLE_KEY bypasses RLS and must never be exposed to the
// browser — it is deliberately NOT prefixed with VITE_, so Vite cannot
// inline it into the client bundle. SUPABASE_URL is just the project URL and
// is already public in the bundle, so reusing VITE_SUPABASE_URL is safe and
// saves setting the same value twice.

const SUPABASE_URL      = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const LEAD_TO_EMAIL     = process.env.LEAD_TO_EMAIL   || 'unisysjpr@yahoo.com';
const LEAD_FROM_EMAIL   = process.env.LEAD_FROM_EMAIL || 'onboarding@resend.dev';

const MAX = { name: 120, phone: 24, email: 160, comments: 2000, source: 40, page_url: 300 };

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = (v) => /^[0-9+\-\s()]{10,16}$/.test(v);

const clean = (v, limit) => (typeof v === 'string' ? v.trim().slice(0, limit) : '');

// Escape before interpolating visitor input into the HTML email body.
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

function buildEmail(lead) {
  const when = new Date(lead.created_at || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short',
  });

  const text = [
    'New TallyCapital enquiry from the website',
    '',
    `Name:          ${lead.name}`,
    `Phone Number:  ${lead.phone}`,
    `Email Address: ${lead.email}`,
    '',
    'Comments:',
    lead.comments || '—',
    '',
    `Received: ${when} IST`,
    lead.page_url ? `Page: ${lead.page_url}` : '',
  ].join('\n');

  const row = (label, value) => `
    <tr>
      <td style="padding:8px 16px 8px 0;font:600 12px/1.4 system-ui,sans-serif;color:#6B7A90;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
      <td style="padding:8px 0;font:14px/1.5 system-ui,sans-serif;color:#0E1B2C;">${esc(value)}</td>
    </tr>`;

  const html = `
  <div style="background:#FBF8F1;padding:28px 18px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E6E1D6;border-radius:14px;overflow:hidden;">
      <div style="background:#0E1B2C;padding:18px 24px;">
        <div style="font:700 11px/1.4 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#E1530B;">New enquiry</div>
        <div style="font:600 19px/1.3 Georgia,serif;color:#fff;margin-top:5px;">TallyCapital — website form</div>
      </div>
      <div style="padding:22px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row('Name', lead.name)}
          ${row('Phone', lead.phone)}
          ${row('Email', lead.email)}
        </table>
        <div style="margin-top:18px;padding-top:16px;border-top:1px solid #E6E1D6;">
          <div style="font:600 12px/1.4 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6B7A90;">Comments</div>
          <div style="font:14px/1.6 system-ui,sans-serif;color:#0E1B2C;margin-top:7px;white-space:pre-wrap;">${esc(lead.comments || '—')}</div>
        </div>
      </div>
      <div style="padding:14px 24px;background:#F6F1E6;border-top:1px solid #E6E1D6;font:12px/1.5 system-ui,sans-serif;color:#6B7A90;">
        Received ${esc(when)} IST${lead.page_url ? ` · <a href="${esc(lead.page_url)}" style="color:#6B7A90;">${esc(lead.page_url)}</a>` : ''}
      </div>
    </div>
  </div>`;

  return { text, html };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;         // Vercel pre-parses
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = [];                                                     // raw stream fallback
  // Node's http gives Buffers, but a stream in another runtime may yield
  // strings — Buffer.concat would throw on those, losing the whole lead.
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = await readBody(req);

  // Honeypot — a real visitor never sees this field, bots fill everything.
  // Answer 200 so the bot believes it succeeded and does not retry.
  if (clean(body.company_website, 200)) return res.status(200).json({ ok: true });

  const lead = {
    source:   clean(body.source, MAX.source) || 'tally-capital',
    name:     clean(body.name, MAX.name),
    phone:    clean(body.phone, MAX.phone),
    email:    clean(body.email, MAX.email),
    comments: clean(body.comments, MAX.comments) || null,
    page_url: clean(body.page_url, MAX.page_url) || null,
  };

  const invalid = [];
  if (!lead.name) invalid.push('name');
  if (!isPhone(lead.phone)) invalid.push('phone');
  if (!isEmail(lead.email)) invalid.push('email');
  if (invalid.length) {
    return res.status(400).json({ ok: false, error: 'Please check the highlighted fields.', fields: invalid });
  }

  const canStore = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
  const canEmail = Boolean(RESEND_API_KEY);

  // Neither leg available means the lead would simply disappear. Say so
  // loudly in the log; keep the visitor's message generic and actionable.
  if (!canStore && !canEmail) {
    const missing = [
      'RESEND_API_KEY (enables the notification email)',
      SUPABASE_URL ? 'SUPABASE_SERVICE_ROLE_KEY (enables storing the lead)'
                   : 'SUPABASE_SERVICE_ROLE_KEY + SUPABASE_URL (enables storing the lead)',
    ];
    console.error(
      '[lead] refusing the enquiry — no delivery method is configured.\n' +
      '       Set at least one of:\n         - ' + missing.join('\n         - ') + '\n' +
      '       Locally that means .env.local; in production, Vercel → Settings → Environment Variables.'
    );
    return res.status(503).json({
      ok: false,
      error: 'Our enquiry form is temporarily unavailable.',
      // Dev-only hint so whoever is testing locally sees the cause in the
      // browser instead of having to find it in the terminal. Vercel sets
      // NODE_ENV=production, so real visitors never get this.
      setup: process.env.NODE_ENV === 'production'
        ? undefined
        : 'Dev note: set RESEND_API_KEY and/or SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart the dev server.',
    });
  }

  // ---- 1. Store the lead (when Supabase is configured) ----
  let stored = null;
  let storeError = null;

  if (canStore) {
    try {
      const insert = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(lead),
      });
      if (!insert.ok) throw new Error(`supabase ${insert.status} ${await insert.text()}`);
      stored = (await insert.json())[0] || null;
    } catch (err) {
      storeError = err;
      console.error('[lead] could not store lead:', err);
      // Not fatal on its own — the email below may still get it through.
    }
  }

  // ---- 2. Send the notification email ----
  let emailSent = false;
  let emailError = null;

  if (!canEmail) {
    emailError = 'RESEND_API_KEY not configured';
    console.error('[lead]', emailError, '— lead stored only, no email sent.');
  } else {
    try {
      const { text, html } = buildEmail({ ...lead, created_at: stored?.created_at });
      const send = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `TallyCapital enquiries <${LEAD_FROM_EMAIL}>`,
          to: [LEAD_TO_EMAIL],
          reply_to: lead.email,          // replying in the inbox answers the customer directly
          subject: `TallyCapital enquiry — ${lead.name}`,
          text,
          html,
        }),
      });
      if (!send.ok) throw new Error(`resend ${send.status} ${await send.text()}`);
      emailSent = true;
    } catch (err) {
      emailError = String(err).slice(0, 500);
      console.error('[lead] could not send email:', err);
    }
  }

  // ---- 3. Record the delivery outcome (best-effort) ----
  if (stored?.id) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${stored.id}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ email_sent: emailSent, email_error: emailError }),
      });
    } catch (err) {
      console.error('[lead] could not record email status:', err);
    }
  }

  // Success as long as the lead survived somewhere — stored, emailed, or
  // both. Only when every configured leg failed has it actually been lost,
  // and then the visitor must be told to use WhatsApp or the phone.
  if (!stored && !emailSent) {
    console.error('[lead] LEAD LOST — nothing stored and nothing sent:', { storeError, emailError, lead });
    return res.status(500).json({
      ok: false,
      error: 'Could not send your enquiry just now.',
    });
  }

  return res.status(200).json({ ok: true, emailSent, stored: Boolean(stored) });
}
