import { useEffect, useRef, useState } from 'react'
import { Layer, Rect, Stage, Transformer } from 'react-konva'
import { PosterElementNode } from './PosterElementNode'

// Design-space stays fixed at the poster's own design.width/height (set
// once at creation from the chosen template's size, see
// posterTemplates.js/templateCompositions.js -- square/story/wide are
// genuinely different aspect ratios, not just a palette choice); only
// Konva's own stageScale shrinks it to fit the visible container --
// deliberately not a CSS transform, since Konva's scaleX/scaleY (unlike a
// CSS transform on an ancestor) is what correctly keeps pointer/drag/
// transform coordinates in design space regardless of on-screen zoom.
//
// The container is height-bounded by the caller (PosterEditor's wrapper),
// not sized off a CSS aspect-ratio driven purely by width -- a Story
// poster (9:16) rendered at full container width would be taller than the
// viewport, forcing a scroll just to see the whole canvas. Measuring both
// container dimensions and scaling to *contain* the design within them
// (like `object-fit: contain`) keeps the entire poster visible regardless
// of its aspect ratio.
export function PosterCanvas({ design, destination, selectedId, onSelect, onElementChange, stageRef }) {
  const containerRef = useRef(null)
  const transformerRef = useRef(null)
  const nodeRefs = useRef({})
  const [stageScale, setStageScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {}
      if (width && height) setStageScale(Math.min(width / design.width, height / design.height))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [design.width, design.height])

  useEffect(() => {
    const node = selectedId ? nodeRefs.current[selectedId] : null
    if (transformerRef.current) {
      transformerRef.current.nodes(node ? [node] : [])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [selectedId, design.elements.length])

  function commitElement(id, patch) {
    onElementChange(design.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)))
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <Stage
        ref={stageRef}
        width={design.width * stageScale}
        height={design.height * stageScale}
        scaleX={stageScale}
        scaleY={stageScale}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelect(null)
        }}
      >
        <Layer>
          <Rect x={0} y={0} width={design.width} height={design.height} fill={design.background} listening={false} />
          {design.elements.map((element) => (
            <PosterElementNode
              key={element.id}
              element={element}
              destination={destination}
              shapeRef={(node) => { nodeRefs.current[element.id] = node }}
              shared={{
                draggable: true,
                onClick: () => onSelect(element.id),
                onTap: () => onSelect(element.id),
                onDragEnd: (e) => commitElement(element.id, { x: e.target.x(), y: e.target.y() }),
                onTransformEnd: (e) => {
                  const node = e.target
                  const scaleX = node.scaleX()
                  const scaleY = node.scaleY()
                  node.scaleX(1)
                  node.scaleY(1)
                  commitElement(element.id, {
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    width: Math.max(20, node.width() * scaleX),
                    height: node.height ? Math.max(20, node.height() * scaleY) : element.height,
                  })
                },
              }}
            />
          ))}
          <Transformer ref={transformerRef} rotateEnabled boundBoxFunc={(oldBox, newBox) => (
            newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
          )} />
        </Layer>
      </Stage>
    </div>
  )
}
