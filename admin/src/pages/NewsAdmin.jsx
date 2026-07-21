// admin/src/pages/NewsAdmin.jsx
//
// Manage the homepage news/updates strip: add, edit, activate/deactivate,
// reorder (up/down), delete. The strip on the site shows active items in
// sort_order and hides itself entirely when there are none.

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SortButtons from '../components/SortButtons';

const ORDER_GAP = 10;

function NewsRow({ item, index, total, onSwap, onChanged }) {
  const [text, setText] = useState(item.text);
  const [linkUrl, setLinkUrl] = useState(item.link_url || '');
  const [linkLabel, setLinkLabel] = useState(item.link_label || '');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const dirty =
    text.trim() !== item.text ||
    (linkUrl.trim() || null) !== (item.link_url || null) ||
    (linkLabel.trim() || null) !== (item.link_label || null);

  const save = async () => {
    if (!text.trim()) {
      setState('error');
      setMessage('The update text cannot be empty.');
      return;
    }
    setState('saving');
    const { error } = await supabase
      .from('news_items')
      .update({
        text: text.trim(),
        link_url: linkUrl.trim() || null,
        link_label: linkLabel.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);
    if (error) {
      setState('error');
      setMessage(`Could not save — ${error.message}`);
    } else {
      setState('saved');
      setMessage('Saved.');
      onChanged();
      setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 2500);
    }
  };

  const toggleActive = async () => {
    const { error } = await supabase
      .from('news_items')
      .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    if (!error) onChanged();
  };

  const remove = async () => {
    if (!window.confirm('Delete this update? This cannot be undone.')) return;
    const { error } = await supabase.from('news_items').delete().eq('id', item.id);
    if (!error) onChanged();
  };

  return (
    <div className="row-card" data-inactive={!item.is_active}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <SortButtons
          onUp={() => onSwap(index, index - 1)}
          onDown={() => onSwap(index, index + 1)}
          upDisabled={index === 0}
          downDisabled={index === total - 1}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <label className="field" style={{ marginBottom: 10 }}>
            <span>Update text</span>
            <input value={text} onChange={(e) => { setText(e.target.value); setState('idle'); }} maxLength={160} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <label className="field" style={{ marginBottom: 10 }}>
              <span>Link (optional — /offers or https://…)</span>
              <input value={linkUrl} onChange={(e) => { setLinkUrl(e.target.value); setState('idle'); }} placeholder="/offers" />
            </label>
            <label className="field" style={{ marginBottom: 10 }}>
              <span>Link label</span>
              <input value={linkLabel} onChange={(e) => { setLinkLabel(e.target.value); setState('idle'); }} placeholder="More" />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-dark" onClick={save} disabled={state === 'saving' || !dirty}>
              {state === 'saving' ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
              Save
            </button>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', cursor: 'pointer' }}>
              <button type="button" className="switch" data-on={item.is_active} onClick={toggleActive} aria-label="Toggle visible on site" />
              {item.is_active ? 'Showing on site' : 'Hidden'}
            </label>

            <button type="button" className="btn btn-danger" onClick={remove} style={{ marginLeft: 'auto' }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>

          {state === 'saved' && <div className="status-ok" style={{ marginTop: 8 }}>{message}</div>}
          {state === 'error' && <div className="status-err" style={{ marginTop: 8 }}>{message}</div>}
        </div>
      </div>
    </div>
  );
}

export default function NewsAdmin() {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [newText, setNewText] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) {
      setLoadError(error.message);
      return;
    }
    // Normalize duplicate/legacy sort orders to index*GAP so swaps work.
    const needsFix = data.some((it, i) => it.sort_order !== (i + 1) * ORDER_GAP);
    if (needsFix && data.length > 0) {
      await Promise.all(
        data.map((it, i) =>
          supabase.from('news_items').update({ sort_order: (i + 1) * ORDER_GAP }).eq('id', it.id)
        )
      );
      data.forEach((it, i) => { it.sort_order = (i + 1) * ORDER_GAP; });
    }
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!newText.trim() || adding) return;
    setAdding(true);
    const maxOrder = items?.length ? Math.max(...items.map((i) => i.sort_order)) : 0;
    const { error } = await supabase.from('news_items').insert({
      text: newText.trim(),
      link_url: newLink.trim() || null,
      link_label: newLabel.trim() || null,
      sort_order: maxOrder + ORDER_GAP,
    });
    setAdding(false);
    if (!error) {
      setNewText(''); setNewLink(''); setNewLabel('');
      load();
    }
  };

  const swap = async (a, b) => {
    if (b < 0 || b >= items.length) return;
    const A = items[a]; const B = items[b];
    await Promise.all([
      supabase.from('news_items').update({ sort_order: B.sort_order }).eq('id', A.id),
      supabase.from('news_items').update({ sort_order: A.sort_order }).eq('id', B.id),
    ]);
    load();
  };

  if (loadError) return <div className="status-err">Could not load updates — {loadError}</div>;
  if (!items) {
    return <div style={{ color: 'var(--muted)', display: 'flex', gap: 10, alignItems: 'center' }}><Loader2 size={16} className="spin" /> Loading…</div>;
  }

  return (
    <>
      <div className="section-kicker">News strip</div>
      <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
        Homepage updates
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '10px 0 28px', lineHeight: 1.6, maxWidth: 620 }}>
        These rotate in the strip at the top of the homepage. Keep each one short —
        a single line. When there are no visible updates, the strip disappears from
        the site automatically.
      </p>

      {/* Add form */}
      <form onSubmit={add} className="card" style={{ padding: '20px 22px', marginBottom: 26 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Add an update</div>
        <label className="field" style={{ marginBottom: 10 }}>
          <span>Update text</span>
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="e.g. Diwali offer — 10% off TallyPrime Gold till 31 Oct"
            maxLength={160}
          />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <label className="field" style={{ marginBottom: 12 }}>
            <span>Link (optional)</span>
            <input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="/offers" />
          </label>
          <label className="field" style={{ marginBottom: 12 }}>
            <span>Link label</span>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="More" />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={adding || !newText.trim()}>
          {adding ? <Loader2 size={14} className="spin" /> : <Plus size={15} />}
          Add update
        </button>
      </form>

      {/* List */}
      {items.length === 0 ? (
        <div className="row-card" style={{ color: 'var(--muted)', fontSize: 14 }}>
          No updates yet — the homepage strip is hidden. Add one above to switch it on.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item, i) => (
            <NewsRow
              key={item.id}
              item={item}
              index={i}
              total={items.length}
              onSwap={swap}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </>
  );
}
