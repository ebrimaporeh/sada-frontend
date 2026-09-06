import { useEffect, useRef, useState } from 'react'
import { Layer, Rect, Stage, Transformer } from 'react-konva'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './designSchema'
import { PosterElementNode } from './PosterElementNode'

// Design-space stays fixed at CANVAS_WIDTH/HEIGHT; only Konva's own
// stageScale shrinks it to fit the visible container -- deliberately not a
// CSS transform, since Konva's scaleX/scaleY (unlike a CSS transform on an
// ancestor) is what correctly keeps pointer/drag/transform coordinates in
// design space regardless of on-screen zoom.
export function PosterCanvas({ design, destination, selectedId, onSelect, onElementChange, stageRef }) {
  const containerRef = useRef(null)
  const transformerRef = useRef(null)
  const nodeRefs = useRef({})
  const [stageScale, setStageScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width
      if (width) setStageScale(width / CANVAS_WIDTH)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
    <div ref={containerRef} className="w-full" style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}>
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH * stageScale}
        height={CANVAS_HEIGHT * stageScale}
        scaleX={stageScale}
        scaleY={stageScale}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelect(null)
        }}
      >
        <Layer>
          <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={design.background} listening={false} />
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
