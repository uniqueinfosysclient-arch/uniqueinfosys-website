// admin/src/pages/GalleryAdmin.jsx
//
// Manage the About-page gallery: upload (client-side downscale first),
// caption/alt edit, show/hide, reorder, delete. Deletes remove the DB row
// FIRST, then the storage object — worst case is an orphaned file in the
// bucket, never a broken image on the site.

import { useEffect, useRef, useState } from 'react';
import { Loader2, Save, Trash2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { downscaleImage, MIN_GOOD_WIDTH } from '../lib/downscale';
import SortButtons from '../components/SortButtons';

const ORDER_GAP = 10;
const BUCKET = 'gallery';

const slug = (name) =>
  name.toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'photo';

function ImageCard({ image, index, total, onSwap, onChanged }) {
  const [alt, setAlt] = useState(image.alt_text || '');
  const [caption, setCaption] = useState(image.caption || '');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const dirty = alt.trim() !== (image.alt_text || '') || caption.trim() !== (image.caption || '');

  const save = async () => {
    setState('saving');
    const { error } = await supabase
      .from('gallery_images')
      .update({ alt_text: alt.trim(), caption: caption.trim() })
      .eq('id', image.id);
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
      .from('gallery_images')
      .update({ is_active: !image.is_active })
      .eq('id', image.id);
    if (!error) onChanged();
  };

  const remove = async () => {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    // DB row first: the site stops referencing the image immediately.
    const { error } = await supabase.from('gallery_images').delete().eq('id', image.id);
    if (error) {
      setState('error');
      setMessage(`Could not delete — ${error.message}`);
      return;
    }
    const { error: storageErr } = await supabase.storage.from(BUCKET).remove([image.storage_path]);
    if (storageErr) console.warn('Orphaned storage object:', image.storage_path, storageErr.message);
    onChanged();
  };

  return (
    <div className="row-card" data-inactive={!image.is_active}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <SortButtons
          onUp={() => onSwap(index, index - 1)}
          onDown={() => onSwap(index, index + 1)}
          upDisabled={index === 0}
          downDisabled={index === total - 1}
        />

        <img
          src={image.image_url}
          alt={alt || 'Gallery photo'}
          style={{
            width: 150, height: 100, objectFit: 'cover', borderRadius: 10,
            border: '1px solid var(--line-2)', flexShrink: 0, background: 'var(--paper)',
          }}
        />

        <div style={{ flex: 1, minWidth: 240 }}>
          <label className="field" style={{ marginBottom: 10 }}>
            <span>Caption (shows on the photo — optional)</span>
            <input value={caption} onChange={(e) => { setCaption(e.target.value); setState('idle'); }} maxLength={140} />
          </label>
          <label className="field" style={{ marginBottom: 12 }}>
            <span>Describe the photo (for screen readers — optional)</span>
            <input value={alt} onChange={(e) => { setAlt(e.target.value); setState('idle'); }} maxLength={140} placeholder="e.g. Our team at the Jaipur office" />
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-dark" onClick={save} disabled={state === 'saving' || !dirty}>
              {state === 'saving' ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
              Save
            </button>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', cursor: 'pointer' }}>
              <button type="button" className="switch" data-on={image.is_active} onClick={toggleActive} aria-label="Toggle visible on site" />
              {image.is_active ? 'Showing on site' : 'Hidden'}
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

export default function GalleryAdmin() {
  const [images, setImages] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [progress, setProgress] = useState('');   // "Uploading 2 of 5…"
  const [uploadError, setUploadError] = useState('');
  const [lowResWarning, setLowResWarning] = useState('');
  const fileInput = useRef(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) {
      setLoadError(error.message);
      return;
    }
    const needsFix = data.some((it, i) => it.sort_order !== (i + 1) * ORDER_GAP);
    if (needsFix && data.length > 0) {
      await Promise.all(
        data.map((it, i) =>
          supabase.from('gallery_images').update({ sort_order: (i + 1) * ORDER_GAP }).eq('id', it.id)
        )
      );
      data.forEach((it, i) => { it.sort_order = (i + 1) * ORDER_GAP; });
    }
    setImages(data);
  };

  useEffect(() => { load(); }, []);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-selecting the same files
    if (!files.length) return;

    setUploadError('');
    setLowResWarning('');
    let maxOrder = images?.length ? Math.max(...images.map((i) => i.sort_order)) : 0;
    const failures = [];
    const lowRes = [];

    for (let i = 0; i < files.length; i++) {
      setProgress(`Uploading ${i + 1} of ${files.length}…`);
      const file = files[i];
      try {
        const { blob, type, ext, width } = await downscaleImage(file);
        if (width < MIN_GOOD_WIDTH) lowRes.push(`${file.name} (${width}px wide)`);
        const path = `${Date.now()}-${slug(file.name)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { contentType: type, cacheControl: '31536000' });
        if (upErr) throw new Error(upErr.message);

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

        maxOrder += ORDER_GAP;
        const { error: insErr } = await supabase.from('gallery_images').insert({
          storage_path: path,
          image_url: pub.publicUrl,
          sort_order: maxOrder,
        });
        if (insErr) {
          // Roll back the uploaded object so it doesn't orphan silently.
          await supabase.storage.from(BUCKET).remove([path]);
          throw new Error(insErr.message);
        }
      } catch (err) {
        failures.push(`${file.name}: ${err.message}`);
      }
    }

    setProgress('');
    if (failures.length) setUploadError(failures.join(' · '));
    if (lowRes.length) {
      setLowResWarning(
        `Uploaded, but these photos are small and will look blurry across the full-width banner — ` +
        `${lowRes.join(', ')}. For a sharp result use photos at least ${MIN_GOOD_WIDTH}px wide ` +
        `(an original camera or phone photo, not one saved from a web page).`
      );
    }
    load();
  };

  if (loadError) return <div className="status-err">Could not load gallery — {loadError}</div>;
  if (!images) {
    return <div style={{ color: 'var(--muted)', display: 'flex', gap: 10, alignItems: 'center' }}><Loader2 size={16} className="spin" /> Loading…</div>;
  }

  return (
    <>
      <div className="section-kicker">Gallery</div>
      <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
        About-page photos
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '10px 0 28px', lineHeight: 1.6, maxWidth: 620 }}>
        These photos rotate in the gallery on the About page. Upload straight from a
        phone — large photos are automatically resized before upload. With no visible
        photos, the gallery section disappears from the site.
      </p>

      {/* Upload */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 26 }}>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onFiles}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fileInput.current?.click()}
            disabled={Boolean(progress)}
          >
            {progress ? <Loader2 size={14} className="spin" /> : <Upload size={15} />}
            {progress || 'Upload photos'}
          </button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            JPG, PNG or WebP · at least {MIN_GOOD_WIDTH}px wide · several at once is fine
          </span>
        </div>
        {uploadError && <div className="status-err" style={{ marginTop: 12 }}>{uploadError}</div>}
        {lowResWarning && (
          <div style={{
            marginTop: 12, fontSize: 13, lineHeight: 1.55, color: 'var(--ink)',
            background: 'var(--orange-soft)', border: '1px solid var(--orange)',
            borderRadius: 10, padding: '10px 14px',
          }}>
            {lowResWarning}
          </div>
        )}
      </div>

      {/* List */}
      {images.length === 0 ? (
        <div className="row-card" style={{ color: 'var(--muted)', fontSize: 14 }}>
          No photos yet — the About-page gallery is hidden. Upload some above to switch it on.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {images.map((image, i) => (
            <ImageCard
              key={image.id}
              image={image}
              index={i}
              total={images.length}
              onSwap={async (a, b) => {
                if (b < 0 || b >= images.length) return;
                const A = images[a]; const B = images[b];
                await Promise.all([
                  supabase.from('gallery_images').update({ sort_order: B.sort_order }).eq('id', A.id),
                  supabase.from('gallery_images').update({ sort_order: A.sort_order }).eq('id', B.id),
                ]);
                load();
              }}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </>
  );
}
