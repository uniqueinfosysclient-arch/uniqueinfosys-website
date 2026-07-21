// admin/src/components/AuthGate.jsx
//
// Session gate: splash while the session loads, LoginPage when signed
// out, children when signed in. supabase-js persists the session in
// localStorage and refreshes tokens automatically.

import { useEffect, useState } from 'react';
import { Loader2, Settings } from 'lucide-react';
import { supabase, configError } from '../lib/supabase';
import LoginPage from '../pages/LoginPage';

function SetupNotice() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: '32px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 10, background: 'var(--paper)',
            border: '1px solid var(--line-2)', color: 'var(--orange)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Settings size={17} />
          </span>
          <div className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Not connected yet</div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          This admin panel isn't connected to its content service (Supabase) yet.
          A one-time setup is needed:
        </p>
        <ol style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.7, margin: '12px 0 0 18px' }}>
          <li>Create the Supabase project — steps in <code className="mono" style={{ fontSize: 12 }}>supabase/SETUP.md</code></li>
          <li>Copy <code className="mono" style={{ fontSize: 12 }}>admin/.env.example</code> to <code className="mono" style={{ fontSize: 12 }}>admin/.env.local</code> and fill in the two values</li>
          <li>Restart this dev server</li>
        </ol>
      </div>
    </div>
  );
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (configError) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (configError) return <SetupNotice />;

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
        <Loader2 size={26} className="spin" />
      </div>
    );
  }

  if (!session) return <LoginPage />;

  return children;
}
