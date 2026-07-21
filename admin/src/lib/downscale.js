// admin/src/lib/downscale.js
//
// Client-side image downscale before upload: the client photographs events
// on phones (3–8 MB), which are far larger than the site needs.
//
// Sizing note: the About-page gallery is a full-width banner, and on a
// HiDPI/retina screen a 1400px-wide banner needs ~2800 real pixels. So we
// keep 2560px — anything smaller looks visibly soft when stretched.
// WebP is preferred (roughly 30% smaller than JPEG at the same quality)
// with a JPEG fallback for browsers that can't encode it.

const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_DIMENSION = 2560;
const QUALITY = 0.92;

function canEncodeWebP() {
  const c = document.createElement('canvas');
  c.width = 1; c.height = 1;
  return c.toDataURL('image/webp').startsWith('data:image/webp');
}

export async function downscaleImage(file, maxDim = MAX_DIMENSION, quality = QUALITY) {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('That file is over 25 MB — please pick a smaller photo.');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Could not read that image. Please upload a JPG, PNG or WebP file (HEIC is not supported).');
  }

  // Never upscale — a small source stays at its native size.
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const type = canEncodeWebP() ? 'image/webp' : 'image/jpeg';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  if (!blob) throw new Error('Could not process that image — please try a different file.');

  return {
    blob,
    type,
    ext: type === 'image/webp' ? 'webp' : 'jpg',
    width: canvas.width,
    height: canvas.height,
  };
}

// The banner stretches edge-to-edge, so anything narrower than this looks
// soft or pixelated once blown up. Used to warn (not block) on upload.
export const MIN_GOOD_WIDTH = 1400;
