import { useEffect, useState } from 'react'

// Small `use-image`-alike -- react-konva doesn't ship one itself.
// `crossOrigin = 'anonymous'` matters for cover images pulled from the
// backend's media host: without it, `stage.toDataURL()` throws a
// tainted-canvas SecurityError the moment any cross-origin image is drawn
// onto the stage (confirmed as a real risk in this project's Phase 0
// spike notes -- verified here against the actual dev media host).
export function useHtmlImage(src) {
  const [image, setImage] = useState(null)

  useEffect(() => {
    if (!src) {
      setImage(null)
      return
    }
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.onerror = () => setImage(null)
    img.src = src
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return image
}
