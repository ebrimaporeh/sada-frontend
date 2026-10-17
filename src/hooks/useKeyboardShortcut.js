import { useEffect, useRef } from 'react'

// The platform-conventional "primary modifier" -- Cmd on Mac, Ctrl
// everywhere else. Exported so KeyHint.jsx can render the same combo with
// the right symbol/label without re-sniffing the platform itself.
export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/.test(navigator.platform ?? navigator.userAgent ?? '')

function matches(event, combo) {
  const parts = combo.toLowerCase().split('+')
  const key = parts.at(-1)
  const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase()
  if (eventKey !== key) return false
  const modPressed = isMac ? event.metaKey : event.ctrlKey
  if (parts.includes('mod') !== modPressed) return false
  if (parts.includes('shift') !== event.shiftKey) return false
  return true
}

function isEditableTarget(target) {
  return target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
}

// Registers one global keyboard shortcut for as long as the calling
// component is mounted -- `combo` is e.g. "mod+k" (Cmd+K / Ctrl+K),
// "shift+mod+z", or a bare key like "Escape"/"Backspace"/"Delete"/"Enter".
// Ignored while focus is inside a text input/textarea/contenteditable
// unless `allowInEditable` is set -- a bare key like Backspace or Delete
// must never fire while someone is typing into a form field or a poster
// element's own text content; a "focus search" combo like mod+k is the
// opposite case (it should work from inside another field too), so that's
// where callers pass `allowInEditable: true`. `enabled` lets a caller gate
// the shortcut on something else being true (e.g. a modal actually being
// open) without unmounting/remounting the component that owns it.
export function useKeyboardShortcut(combo, handler, { allowInEditable = false, enabled = true } = {}) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return undefined
    function onKeyDown(event) {
      if (!matches(event, combo)) return
      if (!allowInEditable && isEditableTarget(event.target)) return
      event.preventDefault()
      handlerRef.current(event)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo, allowInEditable, enabled])
}
