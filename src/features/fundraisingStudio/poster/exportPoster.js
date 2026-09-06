import { CANVAS_HEIGHT, CANVAS_WIDTH } from './designSchema'

// Client-side PNG export via Konva's own stage.toDataURL() -- no backend
// rendering path, per the architecture doc's "prefer client-side export"
// call. Temporarily resets the stage to its real design-space size/scale
// (undoing whatever on-screen preview zoom PosterCanvas applied) so the
// exported pixel dimensions are always exactly `pixelRatio * design size`,
// regardless of how zoomed in/out the editor happened to be.
export function exportPosterAsPng(stage, { pixelRatio = 1, filename = 'poster.png' } = {}) {
  const prevScale = { x: stage.scaleX(), y: stage.scaleY() }
  const prevSize = { width: stage.width(), height: stage.height() }

  stage.scale({ x: 1, y: 1 })
  stage.width(CANVAS_WIDTH)
  stage.height(CANVAS_HEIGHT)
  stage.batchDraw()

  const dataUrl = stage.toDataURL({ pixelRatio, mimeType: 'image/png' })

  stage.scale(prevScale)
  stage.width(prevSize.width)
  stage.height(prevSize.height)
  stage.batchDraw()

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
