import { useCallback, useRef, useState } from 'react'

// Client-side only, per the architecture doc -- undo/redo never touches
// the backend; only the current design state gets autosaved.
export function useDesignHistory(initialDesign) {
  const [design, setDesignState] = useState(initialDesign)
  const historyRef = useRef([initialDesign])
  const indexRef = useRef(0)

  // Commit a new design as a new history entry -- call on "settled"
  // changes (drag end, transform end, a property field committing), not on
  // every intermediate frame of a drag, so undo/redo feels like discrete
  // actions rather than one step per pixel moved.
  const commit = useCallback((next) => {
    const history = historyRef.current.slice(0, indexRef.current + 1)
    history.push(next)
    historyRef.current = history
    indexRef.current = history.length - 1
    setDesignState(next)
  }, [])

  const undo = useCallback(() => {
    if (indexRef.current === 0) return
    indexRef.current -= 1
    setDesignState(historyRef.current[indexRef.current])
  }, [])

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return
    indexRef.current += 1
    setDesignState(historyRef.current[indexRef.current])
  }, [])

  return {
    design,
    commit,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
  }
}
