// admin/src/pages/LeadsAdmin.jsx
//
// Read the enquiries captured by the website forms (currently the
// TallyCapital form on /services/tally-capital).
//
// Leads are written server-side by /api/lead using the service-role key,
// never by the browser — this page only reads, marks handled, and deletes.
// The email_sent flag lets you spot the case where a lead was stored but
// the notification mail failed, so nothing goes quietly missing.

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Trash2, RefreshCw, Mail, Phone, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FILTERS = [
  { key: 'new',  label: 'New' },
  { key: 'done', label: 'Handled' },
  { key: 'all',  label: 'All' },
];

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short',
  });

function LeadRow({ lead, onChanged }) {
  const [busy, setBusy] = useState(false);

  const toggleHandled = async () => {
    setBusy(true);
    const { error } = await supabase
      .from('leads')
      .update({ is_handled: !lead.is_handled })
      .eq('id', lead.id);
    setBusy(false);
    if (!error) onChanged();
  };

  const remove = async () => {
    if (!window.confirm(`Delete the enquiry from ${lead.name}? This cannot be undone.`)) return;
    setBusy(true);
    const { error } = await supabase.from('leads').delete().eq('id', lead.id);
    setBusy(false);
    if (!error) onChanged();
  };

  return (
    <div className="row-card" data-inactive={lead.is_handled}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{lead.name}</span>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--muted)', background: 'var(--paper)', padding: '3px 9px', borderRadius: 999,
            }}>
              {lead.source}
            </span>
            {!lead.email_sent && (
              <span
                title={lead.email_error || 'The notification email did not go out.'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                  color: 'var(--red)', background: 'var(--red-soft)', padding: '3px 9px', borderRadius: 999,
                }}
              >
                <AlertTriangle size={11} strokeWidth={2.4} /> Mail failed
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 9 }}>
            <a href={`tel:${lead.phone.replace(/\s/g, '')}`}
               style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--ink-soft)', textDecoration: 'none' }}>
              <Phone size={13} strokeWidth={2} /> {lead.phone}
            </a>
            <a href={`mailto:${lead.email}`}
               style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--ink-soft)', textDecoration: 'none', wordBreak: 'break-all' }}>
              <Mail size={13} strokeWidth={2} /> {lead.email}
            </a>
          </div>

          {lead.comments && (
            <div style={{
              fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6, marginTop: 11,
              background: 'var(--paper)', borderRadius: 10, padding: '11px 13px', whiteSpace: 'pre-wrap',
            }}>
              {lead.comments}
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 11 }}>
            {fmtDate(lead.created_at)} IST
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-end' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', cursor: 'pointer' }}>
            <button
              type="button" className="switch" data-on={lead.is_handled}
              onClick={toggleHandled} disabled={busy}
              aria-label="Mark as handled"
            />
            {lead.is_handled ? 'Handled' : 'New'}
          </label>
          <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsAdmin() {
  const [leads, setLeads] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('new');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    setRefreshing(false);
    if (error) {
      setLoadError(error.message);
      return;
    }
    setLoadError('');
    setLeads(data);
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    if (!leads) return [];
    if (filter === 'new') return leads.filter((l) => !l.is_handled);
    if (filter === 'done') return leads.filter((l) => l.is_handled);
    return leads;
  }, [leads, filter]);

  const newCount = leads?.filter((l) => !l.is_handled).length ?? 0;

  if (loadError) {
    return (
      <div className="status-err">
        Could not load enquiries — {loadError}
        <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.6 }}>
          If the table does not exist yet, run <code>supabase/leads.sql</code> in the Supabase SQL editor.
        </div>
      </div>
    );
  }

  if (!leads) {
    return (
      <div style={{ color: 'var(--muted)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Loader2 size={16} className="spin" /> Loading…
      </div>
    );
  }

  return (
    <>
      <div className="section-kicker">Enquiries</div>
      <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
        Website leads
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '10px 0 24px', lineHeight: 1.6, maxWidth: 620 }}>
        Every enquiry submitted through the website form is emailed to you and
        kept here as a backup. Mark one as handled once you have replied — it stays
        searchable under Handled rather than being deleted.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`btn ${filter === f.key ? 'btn-dark' : 'btn-ghost'}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'new' && newCount > 0 ? ` (${newCount})` : ''}
          </button>
        ))}
        <button
          type="button" className="btn btn-ghost" onClick={load}
          disabled={refreshing} style={{ marginLeft: 'auto' }}
        >
          {refreshing ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ padding: '28px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          {filter === 'new'
            ? 'No new enquiries right now.'
            : filter === 'done'
              ? 'Nothing marked as handled yet.'
              : 'No enquiries have come in yet.'}
        </div>
      ) : (
        visible.map((lead) => <LeadRow key={lead.id} lead={lead} onChanged={load} />)
      )}
    </>
  );
}
