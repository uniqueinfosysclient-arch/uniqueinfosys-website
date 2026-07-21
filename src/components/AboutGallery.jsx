// src/components/AboutGallery.jsx
//
// About-page gallery — a full-bleed banner across the top of the page.
// Images come from the CMS (gallery_images table + `gallery` storage
// bucket, managed in the admin app).
//
// Presentational only: AboutPage owns the data fetch, because it also
// needs to know whether this banner rendered in order to drop the nav
// clearance from the hero below it.

import { useEffect, useRef, useState } from 'react';
import { Icon } from './design/Icon';

const ADVANCE_MS = 6000;
const SWIPE_PX = 40;

export default function AboutGallery({ images }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const count = images?.length ?? 0;
  const current = count > 0 ? ((index % count) + count) % count : 0;

  const goto = (i) => setIndex(((i % count) + count) % count);
  const next = () => count > 1 && setIndex((i) => i + 1);
  const prev = () => count > 1 && setIndex((i) => i - 1);

  // Preload every slide so advancing never shows a blank frame.
  useEffect(() => {
    images?.forEach((im) => { const img = new Image(); img.src = im.image_url; });
  }, [images]);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion.current) return undefined;
    let id;
    const start = () => { id = setInterval(() => setIndex((i) => i + 1), ADVANCE_MS); };
    const onVisibility = () => {
      clearInterval(id);
      if (!document.hidden) start();
    };
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count, paused]);

  if (!count) return null;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e) => {
    if (touchX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (dx <= -SWIPE_PX) next();
      if (dx >= SWIPE_PX) prev();
    }
    touchX.current = null;
    setPaused(false);
  };

  const active = images[current];

  return (
    <section
      className="about-gallery"
      aria-label="Photo gallery"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="about-gallery-stage">
        {images.map((im, i) => (
          <figure
            key={im.id}
            className={`about-gallery-slide${i === current ? ' is-active' : ''}`}
            aria-hidden={i !== current}
          >
            {/* Blurred copy fills the frame so portrait, square and panoramic
                photos all sit in the banner without letterbox bars — and
                without cropping the real photo. */}
            <img
              className="about-gallery-backdrop"
              src={im.image_url}
              alt=""
              aria-hidden
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
            <img
              className="about-gallery-photo"
              src={im.image_url}
              alt={im.alt_text || `Gallery photo ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
          </figure>
        ))}

        {/* Bottom scrim keeps caption and controls legible on any photo */}
        <div className="about-gallery-scrim" aria-hidden />

        <div className="about-gallery-bar">
          <div className="about-gallery-text">
            <div className="section-kicker about-gallery-kicker">Our gallery</div>
            {active.caption && (
              <p key={active.id} className="about-gallery-caption serif">{active.caption}</p>
            )}
          </div>

          {count > 1 && (
            <div className="about-gallery-controls">
              <span className="mono about-gallery-count">
                {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
              <button type="button" onClick={prev} aria-label="Previous photo" className="about-gallery-arrow">
                <Icon name="arrow" size={16} stroke={2} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button type="button" onClick={next} aria-label="Next photo" className="about-gallery-arrow">
                <Icon name="arrow" size={16} stroke={2} />
              </button>
            </div>
          )}
        </div>

        {/* Slide indicators double as a progress timer */}
        {count > 1 && (
          <div className="about-gallery-dots">
            {images.map((im, i) => (
              <button
                key={im.id}
                type="button"
                onClick={() => goto(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`about-gallery-dot${i === current ? ' is-active' : ''}`}
              >
                <span
                  key={`${im.id}-${current}`}
                  className="about-gallery-dot-fill"
                  style={{
                    animationDuration: `${ADVANCE_MS}ms`,
                    animationPlayState: paused || reducedMotion.current ? 'paused' : 'running',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
