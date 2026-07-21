// admin/src/pages/OffersAdmin.jsx
//
// Manage the /offers page: add, edit, feature, reorder, hide and delete
// offers. With no visible offers the public page shows its "between
// offer cycles" state automatically — nothing else to switch on.

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Star, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SortButtons from '../components/SortButtons';

const ORDER_GAP = 10;

const CATEGORIES = [
  { id: 'tallyprime', label: 'TallyPrime' },
  { id: 'softtrade',  label: 'SoftTrade' },
  { id: 'custom',     label: 'Customisation' },
  { id: 'amc',        label: 'AMC & Support' },
  { id: 'bundles',    label: 'Bundles' },
];

const BLANK = {
  title: '', description: '', category: 'tallyprime', badge: '', code: '',
  original_price: '', final_price: '', price_label: '', price_suffix: '+ GST',
  ends_label: '', highlight: false,
  featured_headline: '', featured_subtitle: '', featured_badge_secondary: 'LIMITED',
  ends_at: '',
};

// Empty strings must become NULL, and prices must be numbers or NULL.
function toRow(form) {
  const num = (v) => (v === '' || v === null ? null : Number(v));
  const str = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    badge: str(form.badge),
    code: str(form.code),
    original_price: num(form.original_price),
    final_price: num(form.final_price),
    price_label: str(form.price_label),
    price_suffix: str(form.price_suffix),
    ends_label: str(form.ends_label),
    highlight: Boolean(form.highlight),
    featured_headline: str(form.featured_headline),
    featured_subtitle: str(form.featured_subtitle),
    featured_badge_secondary: str(form.featured_badge_secondary),
    ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
  };
}

function toForm(row) {
  return {
    title: row.title || '',
    description: row.description || '',
    category: row.category || 'tallyprime',
    badge: row.badge || '',
    code: row.code || '',
    original_price: row.original_price ?? '',
    final_price: row.final_price ?? '',
    price_label: row.price_label || '',
    price_suffix: row.price_suffix || '',
    ends_label: row.ends_label || '',
    highlight: Boolean(row.highlight),
    featured_headline: row.featured_headline || '',
    featured_subtitle: row.featured_subtitle || '',
    featured_badge_secondary: row.featured_badge_secondary || '',
    // datetime-local wants 'YYYY-MM-DDTHH:mm' in local time
    ends_at: row.ends_at ? new Date(row.ends_at).toISOString().slice(0, 16) : '',
  };
}

function OfferFields({ form, set, showFeatured }) {
  return (
    <>
      <label className="field">
        <span>Offer title *</span>
        <input value={form.title} onChange={(e) => set('title', e.target.value)}
               placeholder="TallyPrime Gold — festive discount" maxLength={120} />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)}
                  placeholder="25% off MRP for unlimited-user Gold edition. Free installation included." maxLength={400} />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <label className="field">
          <span>Category</span>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}
                  style={{ width: '100%', fontFamily: 'inherit', fontSize: 14.5, padding: '11px 14px',
                           border: '1px solid var(--line-2)', borderRadius: 10, background: '#fff', color: 'var(--ink)' }}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Badge</span>
          <input value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="-25% OFF" maxLength={20} />
        </label>
        <label className="field">
          <span>Coupon code</span>
          <input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="UNIQUE25" maxLength={24} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        <label className="field">
          <span>Was ₹</span>
          <input type="number" value={form.original_price} onChange={(e) => set('original_price', e.target.value)} placeholder="67500" />
        </label>
        <label className="field">
          <span>Now ₹</span>
          <input type="number" value={form.final_price} onChange={(e) => set('final_price', e.target.value)} placeholder="50625" />
        </label>
        <label className="field">
          <span>Or text price</span>
          <input value={form.price_label} onChange={(e) => set('price_label', e.target.value)} placeholder="On request" maxLength={30} />
        </label>
        <label className="field">
          <span>Price note</span>
          <input value={form.price_suffix} onChange={(e) => set('price_suffix', e.target.value)} placeholder="+ GST" maxLength={30} />
        </label>
      </div>

      <label className="field">
        <span>Ends label (shown on the card)</span>
        <input value={form.ends_label} onChange={(e) => set('ends_label', e.target.value)} placeholder="Ends 31 Oct" maxLength={40} />
      </label>

      {showFeatured && (
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 12, padding: '16px 18px 4px', marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 12 }}>
            Featured card (big dark box at the top)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label className="field">
              <span>Big headline</span>
              <input value={form.featured_headline} onChange={(e) => set('featured_headline', e.target.value)} placeholder="25% off" maxLength={40} />
            </label>
            <label className="field">
              <span>Subtitle</span>
              <input value={form.featured_subtitle} onChange={(e) => set('featured_subtitle', e.target.value)} placeholder="TallyPrime Gold" maxLength={60} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label className="field">
              <span>Second badge</span>
              <input value={form.featured_badge_secondary} onChange={(e) => set('featured_badge_secondary', e.target.value)} placeholder="LIMITED" maxLength={20} />
            </label>
            <label className="field">
              <span>Countdown ends at (optional)</span>
              <input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} />
            </label>
          </div>
        </div>
      )}
    </>
  );
}

function OfferRow({ row, index, total, onSwap, onChanged, onFeature }) {
  const [form, setForm] = useState(() => toForm(row));
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setState('idle'); };

  const save = async () => {
    if (!form.title.trim()) {
      setState('error'); setMessage('The offer needs a title.');
      return;
    }
    setState('saving');
    const { error } = await supabase.from('offers')
      .update({ ...toRow(form), updated_at: new Date().toISOString() })
      .eq('id', row.id);
    if (error) { setState('error'); setMessage(`Could not save — ${error.message}`); }
    else {
      setState('saved'); setMessage('Saved — live on the website now.');
      onChanged();
      setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 2500);
    }
  };

  const toggleActive = async () => {
    const { error } = await supabase.from('offers')
      .update({ is_active: !row.is_active, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    if (!error) onChanged();
  };

  const remove = async () => {
    if (!window.confirm(`Delete the offer "${row.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('offers').delete().eq('id', row.id);
    if (!error) onChanged();
  };

  const price = row.price_label
    || (row.final_price != null ? `₹${Number(row.final_price).toLocaleString('en-IN')}` : '—');

  return (
    <div className="row-card" data-inactive={!row.is_active}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <SortButtons
          onUp={() => onSwap(index, index - 1)}
          onDown={() => onSwap(index, index + 1)}
          upDisabled={index === 0}
          downDisabled={index === total - 1}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Summary line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {row.is_featured && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700,
                             letterSpacing: '.1em', textTransform: 'uppercase', background: 'var(--orange)',
                             color: '#fff', padding: '4px 9px', borderRadius: 999 }}>
                <Star size={10} fill="currentColor" /> Featured
              </span>
            )}
            <span style={{ fontSize: 15, fontWeight: 600 }}>{row.title}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{price}</span>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen((o) => !o)}
                    style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 13 }}>
              {open ? 'Close' : 'Edit'}
            </button>
          </div>

          {open && (
            <div style={{ marginTop: 16 }}>
              <OfferFields form={form} set={set} showFeatured={row.is_featured} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-dark" onClick={save} disabled={state === 'saving'}>
                  {state === 'saving' ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save
                </button>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', cursor: 'pointer' }}>
                  <button type="button" className="switch" data-on={row.is_active} onClick={toggleActive} aria-label="Toggle visible on site" />
                  {row.is_active ? 'Showing on site' : 'Hidden'}
                </label>

                {!row.is_featured && (
                  <button type="button" className="btn btn-ghost" onClick={() => onFeature(row.id)}>
                    <Star size={14} /> Make featured
                  </button>
                )}

                <button type="button" className="btn btn-danger" onClick={remove} style={{ marginLeft: 'auto' }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>

              {state === 'saved' && <div className="status-ok" style={{ marginTop: 10 }}>{message}</div>}
              {state === 'error' && <div className="status-err" style={{ marginTop: 10 }}>{message}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OffersAdmin() {
  const [rows, setRows] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState(BLANK);
  const [addError, setAddError] = useState('');

  const load = async () => {
    const { data, error } = await supabase
      .from('offers').select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) { setLoadError(error.message); return; }
    const needsFix = data.some((it, i) => it.sort_order !== (i + 1) * ORDER_GAP);
    if (needsFix && data.length) {
      await Promise.all(data.map((it, i) =>
        supabase.from('offers').update({ sort_order: (i + 1) * ORDER_GAP }).eq('id', it.id)));
      data.forEach((it, i) => { it.sort_order = (i + 1) * ORDER_GAP; });
    }
    setRows(data);
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!newForm.title.trim() || adding) return;
    setAdding(true);
    setAddError('');
    const maxOrder = rows?.length ? Math.max(...rows.map((r) => r.sort_order)) : 0;
    const { error } = await supabase.from('offers').insert({
      ...toRow(newForm),
      sort_order: maxOrder + ORDER_GAP,
      is_featured: !rows?.length,   // very first offer becomes the featured one
    });
    setAdding(false);
    if (error) { setAddError(`Could not add — ${error.message}`); return; }
    setNewForm(BLANK);
    setShowAdd(false);
    load();
  };

  // Only one offer may be featured — clear the old one, then set the new.
  const feature = async (id) => {
    const currently = rows.find((r) => r.is_featured);
    if (currently) await supabase.from('offers').update({ is_featured: false }).eq('id', currently.id);
    await supabase.from('offers').update({ is_featured: true }).eq('id', id);
    load();
  };

  const swap = async (a, b) => {
    if (b < 0 || b >= rows.length) return;
    const A = rows[a]; const B = rows[b];
    await Promise.all([
      supabase.from('offers').update({ sort_order: B.sort_order }).eq('id', A.id),
      supabase.from('offers').update({ sort_order: A.sort_order }).eq('id', B.id),
    ]);
    load();
  };

  if (loadError) {
    return (
      <div className="status-err">
        Could not load offers — {loadError}
        {/relation .* does not exist/i.test(loadError) && (
          <div style={{ marginTop: 8, fontWeight: 400, color: 'var(--ink-soft)' }}>
            Run <code className="mono">supabase/offers.sql</code> in the Supabase SQL editor to create the table.
          </div>
        )}
      </div>
    );
  }
  if (!rows) {
    return <div style={{ color: 'var(--muted)', display: 'flex', gap: 10, alignItems: 'center' }}><Loader2 size={16} className="spin" /> Loading…</div>;
  }

  return (
    <>
      <div className="section-kicker">Offers</div>
      <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
        Offers page
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '10px 0 24px', lineHeight: 1.6, maxWidth: 640 }}>
        Each offer becomes a card on the Offers page. One offer can be marked
        <strong> Featured</strong> — it also appears as the big dark box at the top with the
        countdown. When nothing is showing here, the page tells visitors you're between
        offer cycles.
      </p>

      {!showAdd ? (
        <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ marginBottom: 24 }}>
          <Plus size={15} /> Add an offer
        </button>
      ) : (
        <form onSubmit={add} className="card" style={{ padding: '20px 22px', marginBottom: 26 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>New offer</div>
          <OfferFields form={newForm} set={(k, v) => setNewForm((f) => ({ ...f, [k]: v }))} showFeatured={!rows.length} />
          {addError && <div className="status-err" style={{ marginBottom: 12 }}>{addError}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={adding || !newForm.title.trim()}>
              {adding ? <Loader2 size={14} className="spin" /> : <Plus size={15} />} Add offer
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowAdd(false); setNewForm(BLANK); setAddError(''); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {rows.length === 0 ? (
        <div className="row-card" style={{ color: 'var(--muted)', fontSize: 14 }}>
          No offers yet — the Offers page is showing its "between offer cycles" message.
          Add one above to switch it on.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map((row, i) => (
            <OfferRow
              key={row.id}
              row={row}
              index={i}
              total={rows.length}
              onSwap={swap}
              onChanged={load}
              onFeature={feature}
            />
          ))}
        </div>
      )}
    </>
  );
}
