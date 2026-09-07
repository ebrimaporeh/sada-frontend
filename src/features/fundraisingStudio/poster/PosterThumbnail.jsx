import { useEffect, useRef, useState } from 'react'
import { Layer, Rect, Stage } from 'react-konva'
import { PosterElementNode } from './PosterElementNode'

const NO_SHARED_PROPS = {}
function noopShapeRef() {}

// Static, read-only render of a poster's *actual* design -- used by
// PostersListPage's cards so the list shows what the poster really looks
// like (title/QR/whatever the owner placed, over their real cover photo),
// not just the destination's raw cover photo standing in for it. No
// Transformer, no drag/click wiring (`shared` stays empty and both the
// Stage and Layer are non-listening) -- this is a picture, not the editor;
// PosterCanvas.jsx is the interactive version this shares element
// rendering with via PosterElementNode.
//
// `stageRef` (optional) exposes the underlying Konva Stage so a caller can
// rasterize it directly -- see PostersListPage.jsx's Download button, which
// reuses exportPoster.js's exportPosterAsPng on this same live thumbnail
// stage rather than requiring a trip into the full editor first.
export function PosterThumbnail({ design, destination, stageRef }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {}
      if (width && height) setScale(Math.min(width / design.width, height / design.height))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [design.width, design.height])

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      {scale > 0 && (
        <Stage ref={stageRef} width={design.width * scale} height={design.height * scale} scaleX={scale} scaleY={scale} listening={false}>
          <Layer listening={false}>
            <Rect x={0} y={0} width={design.width} height={design.height} fill={design.background} />
            {design.elements.map((element) => (
              <PosterElementNode
                key={element.id}
                element={element}
                destination={destination}
                shared={NO_SHARED_PROPS}
                shapeRef={noopShapeRef}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
