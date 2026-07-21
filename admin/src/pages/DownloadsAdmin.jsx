// admin/src/pages/DownloadsAdmin.jsx
//
// Edit the 6 SoftTrade installer URLs (3 products × Single/Multi User).
// The rows are seeded once (supabase/seed.sql) and only ever updated here.
// The public site falls back to its built-in URLs if a row is missing.

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PRODUCTS = [
  { key: 'mandi', name: 'SoftTrade-Mandi' },
  { key: 'brokwin', name: 'SoftTrade-Brokwin' },
  { key: 'coldwin', name: 'SoftTrade-Coldwin' },
];
const VARIANTS = [
  { key: 'single', name: 'Single User' },
  { key: 'multi', name: 'Multi User' },
];

function LinkCard({ row, productName, variantName }) {
  const [url, setUrl] = useState(row.url);
  const [state, setState] = useState('idle'); // idle | saving | saved | error
  const [message, setMessage] = useState('');

  const dirty = url.trim() !== row.url;

  const save = async () => {
    const trimmed = url.trim();
    if (!/^https:\/\/.+/i.test(trimmed)) {
      setState('error');
      setMessage('The link must start with https://');
      return;
    }
    setState('saving');
    setMessage('');
    const { error } = await supabase
      .from('download_links')
      .update({ url: trimmed, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    if (error) {
      setState('error');
      setMessage(`Could not save — ${error.message}`);
    } else {
      row.url = trimmed; // keep local baseline in sync
      setUrl(trimmed);
      setState('saved');
      setMessage('Saved — live on the website now.');
      setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 3000);
    }
  };

  return (
    <div className="row-card">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>
          {productName} — {variantName}
        </div>
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          Test current link <ExternalLink size={12} />
        </a>
      </div>

      <label className="field" style={{ margin: '12px 0 0' }}>
        <span>OneDrive / download URL</span>
        <textarea
          className="mono"
          rows={3}
          value={url}
          onChange={(e) => { setUrl(e.target.value); if (state !== 'idle') setState('idle'); }}
          spellCheck={false}
        />
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
        <button type="button" className="btn btn-dark" onClick={save} disabled={state === 'saving' || !dirty}>
          {state === 'saving' ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {state === 'saved' && <span className="status-ok">{message}</span>}
        {state === 'error' && <span className="status-err">{message}</span>}
      </div>
    </div>
  );
}

export default function DownloadsAdmin() {
  const [rows, setRows] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    supabase
      .from('download_links')
      .select('*')
      .then(({ data, error }) => {
        if (error) setLoadError(error.message);
        else setRows(data);
      });
  }, []);

  if (loadError) return <div className="status-err">Could not load download links — {loadError}</div>;
  if (!rows) {
    return <div style={{ color: 'var(--muted)', display: 'flex', gap: 10, alignItems: 'center' }}><Loader2 size={16} className="spin" /> Loading…</div>;
  }

  return (
    <>
      <div className="section-kicker">Download links</div>
      <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
        SoftTrade installer links
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '10px 0 28px', lineHeight: 1.6, maxWidth: 620 }}>
        When a OneDrive link changes, paste the new one here and save. The website's
        Downloads page and the product pages pick it up immediately — no developer needed.
      </p>

      {PRODUCTS.map((p) => (
        <section key={p.key} style={{ marginBottom: 32 }}>
          <h2 className="serif" style={{ fontSize: 19, fontWeight: 600, marginBottom: 12 }}>{p.name}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {VARIANTS.map((v) => {
              const row = rows.find((r) => r.product_key === p.key && r.variant_key === v.key);
              if (!row) {
                return (
                  <div key={v.key} className="row-card status-err">
                    Missing row for {p.name} — {v.name}. Run supabase/seed.sql once to create it.
                  </div>
                );
              }
              return <LinkCard key={row.id} row={row} productName={p.name} variantName={v.name} />;
            })}
          </div>
        </section>
      ))}
    </>
  );
}
