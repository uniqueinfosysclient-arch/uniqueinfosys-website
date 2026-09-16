// admin/src/components/Shell.jsx
// App frame: brand sidebar with nav + logout, content area for routes.

import { NavLink } from 'react-router-dom';
import { Newspaper, Images, Download, Tag, Inbox, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const NAV = [
  { to: '/news', label: 'News strip', icon: Newspaper },
  { to: '/offers', label: 'Offers', icon: Tag },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/downloads', label: 'Download links', icon: Download },
  { to: '/leads', label: 'Website leads', icon: Inbox },
];

export default function Shell({ children }) {
  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch' }}>
      {/* Sidebar */}
      <aside
        className="admin-side"
        style={{
          width: 250, flexShrink: 0, background: '#fff',
          borderRight: '1px solid var(--line)',
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column', padding: 20,
        }}
      >
        <div style={{ padding: '6px 8px 22px' }}>
          <div className="serif" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1 }}>
            UIS <span style={{ color: 'var(--orange)' }}>Admin</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>
            Website content manager
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV.map(({ to, label, icon: NavIcon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
              <NavIcon size={16} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => supabase.auth.signOut()}
          style={{ justifyContent: 'center', marginTop: 16 }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </aside>

      {/* Content */}
      <main className="admin-main">
        <div style={{ maxWidth: 860, margin: '0 auto' }}>{children}</div>
      </main>
    </div>
  );
}
