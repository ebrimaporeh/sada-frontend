import { useEffect, useState } from 'react'
import { Circle, Image as KonvaImage, Line, Rect, Text } from 'react-konva'
import QRCode from 'qrcode'
import { useHtmlImage } from './useHtmlImage'
import { formatBindingValue } from './designSchema'

// One dispatcher for all four element types rather than four separate
// files -- they share every bit of drag/select/transform wiring
// (PosterCanvas.jsx) and differ only in what they render, so splitting
// them out would just scatter that shared plumbing without adding clarity.

// `enabled` (rather than only calling this hook from the 'qr' branch below)
// keeps the hook count/order identical across every element type -- a
// single PosterElementNode instance's `element.type` never changes after
// creation, so branching the earlier version was actually safe in
// practice, but this satisfies the rules-of-hooks lint rule and doesn't
// rely on that invariant holding forever.
function useQrImage(enabled, value, fgColor, bgColor) {
  const [dataUrl, setDataUrl] = useState(null)
  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    QRCode.toDataURL(value || 'https://dolelma.org', {
      width: 512, margin: 2, color: { dark: fgColor || '#000000', light: bgColor || '#ffffff' },
    }).then((url) => { if (!cancelled) setDataUrl(url) }).catch(() => {})
    return () => { cancelled = true }
  }, [enabled, value, fgColor, bgColor])
  return useHtmlImage(enabled ? dataUrl : null)
}

export function PosterElementNode({ element, destination, shared, shapeRef }) {
  const { id, type, x, y, rotation, opacity } = element
  const qrImage = useQrImage(type === 'qr', destination?.public_url, element.fgColor, element.bgColor)
  // `ref` is deliberately kept out of this object -- React strips `ref`
  // from any props object before a function component ever sees it (it's
  // not a regular prop), so spreading it onto a custom component like
  // BoundImageNode below would silently drop it. Every branch attaches
  // shapeRef explicitly, directly on the real Konva node.
  const commonProps = { id, x, y, rotation, opacity, ...shared }

  if (type === 'text') {
    const displayText = element.binding ? formatBindingValue(element.binding, destination) : element.text
    return (
      <Text
        ref={shapeRef}
        {...commonProps}
        width={element.width}
        text={displayText || ''}
        fontFamily={element.fontFamily}
        fontSize={element.fontSize}
        fontStyle={element.fontWeight === 'bold' ? 'bold' : 'normal'}
        align={element.align}
        fill={element.color}
      />
    )
  }

  if (type === 'image') {
    const src = element.binding ? (destination?.[element.binding] ?? '') : element.src
    return <BoundImageNode shapeRef={shapeRef} commonProps={commonProps} element={element} src={src} />
  }

  if (type === 'shape') {
    if (element.shapeType === 'circle') {
      return (
        <Circle
          ref={shapeRef}
          {...commonProps}
          radius={element.width / 2}
          fill={element.fill}
          stroke={element.stroke || undefined}
          strokeWidth={element.strokeWidth}
        />
      )
    }
    if (element.shapeType === 'line') {
      return (
        <Line
          ref={shapeRef}
          {...commonProps}
          points={[0, 0, element.width, 0]}
          stroke={element.stroke || element.fill}
          strokeWidth={element.strokeWidth || 4}
        />
      )
    }
    return (
      <Rect
        ref={shapeRef}
        {...commonProps}
        width={element.width}
        height={element.height}
        fill={element.fill}
        stroke={element.stroke || undefined}
        strokeWidth={element.strokeWidth}
        cornerRadius={element.cornerRadius}
      />
    )
  }

  if (type === 'qr') {
    if (!qrImage) return null
    return <KonvaImage ref={shapeRef} {...commonProps} image={qrImage} width={element.width} height={element.height} />
  }

  return null
}

// Konva's <Image> stretches to width/height by default (CSS object-fit:
// fill behavior) -- computing an explicit `crop` rect is what gets
// object-fit: cover instead. 'contain' isn't implemented (would need
// letterboxing, not cropping); it falls back to the same stretch as no
// binding at all, which is an acceptable simplification here.
function coverCrop(image, targetWidth, targetHeight) {
  const imageRatio = image.width / image.height
  const targetRatio = targetWidth / targetHeight
  if (imageRatio > targetRatio) {
    const cropWidth = image.height * targetRatio
    return { x: (image.width - cropWidth) / 2, y: 0, width: cropWidth, height: image.height }
  }
  const cropHeight = image.width / targetRatio
  return { x: 0, y: (image.height - cropHeight) / 2, width: image.width, height: cropHeight }
}

function BoundImageNode({ src, element, shapeRef, commonProps }) {
  const image = useHtmlImage(src)
  if (!image) return null
  const crop = element.objectFit === 'cover' ? coverCrop(image, element.width, element.height) : undefined
  return (
    <KonvaImage
      ref={shapeRef}
      {...commonProps}
      image={image}
      width={element.width}
      height={element.height}
      crop={crop}
      cornerRadius={element.borderRadius}
    />
  )
}
