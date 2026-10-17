import QRCode from 'qrcode'

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Client-side PNG export via Konva's own stage.toDataURL() -- no backend
// rendering path, per the architecture doc's "prefer client-side export"
// call. Temporarily resets the stage to its real design-space size/scale
// (undoing whatever on-screen preview zoom PosterCanvas applied) so the
// exported pixel dimensions are always exactly `pixelRatio * design size`,
// regardless of how zoomed in/out the editor happened to be. `width`/
// `height` are the poster's own design.width/height (square/story/wide all
// differ) -- the caller (PosterEditor.jsx) always has `design` in scope.
export function exportPosterAsPng(stage, { pixelRatio = 1, filename = 'poster.png', width, height } = {}) {
  const prevScale = { x: stage.scaleX(), y: stage.scaleY() }
  const prevSize = { width: stage.width(), height: stage.height() }

  stage.scale({ x: 1, y: 1 })
  stage.width(width)
  stage.height(height)
  stage.batchDraw()

  const dataUrl = stage.toDataURL({ pixelRatio, mimeType: 'image/png' })

  stage.scale(prevScale)
  stage.width(prevSize.width)
  stage.height(prevSize.height)
  stage.batchDraw()

  downloadDataUrl(dataUrl, filename)
}

// Regenerates the QR code directly through the same `qrcode` library/
// options PosterElementNode.jsx's useQrImage uses for the on-canvas
// version, rather than cropping it out of the Konva stage -- a clean,
// high-resolution QR on its own rather than whatever the poster's current
// zoom/pixelRatio happens to produce, and it doesn't need the stage's
// Transformer handles cleared first the way the full-poster export does.
export async function exportQrAsPng({ value, fgColor, bgColor, filename = 'qr-code.png', size = 1024 } = {}) {
  const dataUrl = await QRCode.toDataURL(value || 'https://dolelma.org', {
    width: size, margin: 2, color: { dark: fgColor || '#000000', light: bgColor || '#ffffff' },
  })
  downloadDataUrl(dataUrl, filename)
}
