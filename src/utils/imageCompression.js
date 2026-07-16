import imageCompression from 'browser-image-compression'

// Mirrors the backend's per-purpose profiles (services/image_compression.py)
// so an image doesn't get compressed twice at meaningfully different
// settings — this is the "already compressed enough" pass the backend then
// mostly just re-validates. Avatar gets a larger dimension/higher quality
// than other uploads because the campaigners masonry grid displays it large
// as the tile's main content, not just as a small nav-bar chip.
const PROFILES = {
  avatar: { maxWidthOrHeight: 1600, initialQuality: 0.9 },
  campaign_cover: { maxWidthOrHeight: 1920, initialQuality: 0.85 },
  campaign_gallery: { maxWidthOrHeight: 1920, initialQuality: 0.85 },
  campaign_update: { maxWidthOrHeight: 1600, initialQuality: 0.82 },
  category: { maxWidthOrHeight: 800, initialQuality: 0.82 },
  document: { maxWidthOrHeight: 2000, initialQuality: 0.9 },
  logo: { maxWidthOrHeight: 1600, initialQuality: 0.95 },
}

// Compresses `file` to WebP client-side before upload. Falls back to the
// original file if compression fails for any reason (corrupt image, browser
// without the needed APIs) — the backend re-validates and compresses server
// side regardless, so a raw upload here still ends up standard, just via
// an extra round trip.
export async function compressImage(file, profile = 'campaign_gallery') {
  if (!file || !file.type?.startsWith('image/')) return file

  const { maxWidthOrHeight, initialQuality } = PROFILES[profile] || PROFILES.campaign_gallery

  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight,
      initialQuality,
      fileType: 'image/webp',
      useWebWorker: true,
    })
    const name = (file.name?.replace(/\.[^.]+$/, '') || 'image') + '.webp'
    return new File([compressed], name, { type: 'image/webp' })
  } catch (err) {
    console.warn('Client-side image compression failed, uploading original file:', err)
    return file
  }
}
