// admin/src/pages/LoginPage.jsx
//
// Email + password sign-in. No signup, no password reset — the single
// admin account is created and managed in the Supabase dashboard.

import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Wrong email or password.'
          : `Could not sign in — ${err.message}`
      );
    }
    // On success, AuthGate's onAuthStateChange swaps in the app.
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '36px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 10, background: 'var(--ink)',
            color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Lock size={17} />
          </span>
          <div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.15 }}>UIS Admin</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Unique Info Systems — website content</div>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 24 }}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="status-err" style={{ marginBottom: 14 }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <Loader2 size={15} className="spin" /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 18, lineHeight: 1.5 }}>
          Forgot the password? Ask your developer to reset it from the Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
