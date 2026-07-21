// src/components/NewsStrip.jsx
//
// Site-wide announcement bar — a full-width orange strip above the nav
// with white text scrolling continuously across it. Content comes from
// the CMS (news_items table, managed in the admin app).
//
// Renders nothing at all when the CMS is unreachable or has no active
// items. While visible it publishes its height as the --news-h CSS
// variable so page heroes can add matching top clearance (see index.css).

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCmsData, fetchNews } from '../lib/cms';

const STRIP_HEIGHT = 38;
const CHARS_PER_SECOND = 7; // scroll pace — lower is slower

// One announcement. `ghost` renders the duplicated copy used to make the
// marquee loop seamlessly: visually identical, but links become plain text
// so screen readers and Tab don't hit every item twice.
function Item({ item, ghost }) {
  const label = item.link_label || 'Know More';
  const linkCls = 'font-semibold text-white underline underline-offset-[3px] hover:text-white/80';
  const isExternal = /^https?:/i.test(item.link_url || '');

  return (
    <span className="inline-flex flex-none items-center gap-3 pr-8">
      <span className="whitespace-nowrap text-[13.5px] font-medium text-white/95">{item.text}</span>

      {item.link_url && (
        ghost
          ? <span className={linkCls}>{label}</span>
          : isExternal
            ? <a href={item.link_url} target="_blank" rel="noreferrer" className={linkCls}>{label}</a>
            : <Link to={item.link_url} className={linkCls}>{label}</Link>
      )}

      <span aria-hidden className="h-1 w-1 flex-none rounded-full bg-white/45" />
    </span>
  );
}

export default function NewsStrip() {
  const items = useCmsData(fetchNews, 'news');
  const count = items?.length ?? 0;

  const [reducedMotion] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Publish the strip height so heroes can offset for it.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--news-h', count ? `${STRIP_HEIGHT}px` : '0px');
    return () => root.style.setProperty('--news-h', '0px');
  }, [count]);

  // Scroll duration scales with content so long lists don't race past.
  const duration = useMemo(() => {
    if (!count) return 0;
    const chars = items.reduce((n, it) => n + it.text.length + (it.link_label?.length || 9) + 6, 0);
    return Math.max(20, Math.round((chars * 2) / CHARS_PER_SECOND));
  }, [items, count]);

  if (!count) return null;

  return (
    <div
      className="news-strip relative w-full overflow-hidden bg-orange-600"
      style={{ height: STRIP_HEIGHT }}
      role="region"
      aria-label="Latest updates"
    >
      {reducedMotion ? (
        // No animation: lay the items out statically, scrollable if they overflow.
        <div className="flex h-full items-center overflow-x-auto px-5 sm:px-8">
          {items.map((it) => <Item key={it.id} item={it} />)}
        </div>
      ) : (
        <div className="news-marquee flex h-full items-center" style={{ animationDuration: `${duration}s` }}>
          {items.map((it) => <Item key={it.id} item={it} />)}
          <span aria-hidden className="flex items-center">
            {items.map((it) => <Item key={`ghost-${it.id}`} item={it} ghost />)}
          </span>
        </div>
      )}
    </div>
  );
}
