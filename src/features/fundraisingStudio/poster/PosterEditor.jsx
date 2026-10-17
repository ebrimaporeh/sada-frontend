import { useEffect, useRef, useState } from 'react'
import { Check, Download, Loader2, Redo2, Undo2 } from 'lucide-react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useKeyboardShortcut, isMac } from '@/hooks/useKeyboardShortcut'
import { useUpdatePoster } from '@/hooks/usePosters'
import { ShareCampaign } from '@/components/custom/ShareCampaign'
import { emptyDesign } from './designSchema'
import { useDesignHistory } from './useDesignHistory'
import { PosterCanvas } from './PosterCanvas'
import { ElementsPanel } from './ElementsPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { exportPosterAsPng, exportQrAsPng } from './exportPoster'
import { findBackgroundImage } from './templateCompositions'
import {
  applyElementPatch, clearElementOverride, hasElementOverride, projectElementsForLayout, removeElementEverywhere,
  CANONICAL_LAYOUT,
} from './layoutProjection'
import { POSTER_TEMPLATES } from '../shared/posterTemplates'

const AUTOSAVE_DEBOUNCE_MS = 1200

// Keyboard shortcuts (mod+Z / shift+mod+Z) are wired once at the editor
// level (see PosterEditor's own useKeyboardShortcut calls) -- this is
// still the click target, just with the combo surfaced in its tooltip too
// (these are small icon-only buttons with no room for a visible KeyHint
// badge the way ConfirmModal's/search inputs' labeled controls get one).
const MOD_LABEL = isMac ? '⌘' : 'Ctrl+'
function UndoRedoControls({ canUndo, canRedo, undo, redo }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={!canUndo} onClick={undo} className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30" title={`Undo (${MOD_LABEL}Z)`}>
        <Undo2 className="w-4 h-4" />
      </button>
      <button type="button" disabled={!canRedo} onClick={redo} className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30" title={`Redo (${MOD_LABEL}⇧Z)`}>
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function SaveStateIndicator({ saveState }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
      {saveState === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>}
      {saveState === 'saved' && <><Check className="w-3 h-3" /> Saved</>}
      {saveState === 'unsaved' && 'Unsaved changes'}
    </div>
  )
}

// `menuRef` is per-instance (not a single shared ref) because this renders
// twice -- once in the stacked (<lg) toolbar, once in the merged (lg+) one
// -- and the outside-click effect below needs to recognize a click inside
// whichever copy is actually visible.
function ExportMenu({ menuRef, isOpen, onToggle, isExporting, onExport, width, onExportQr, qrAvailable }) {
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={isExporting}
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border hover:bg-accent transition-colors disabled:opacity-50"
      >
        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        Export
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-card border rounded-lg shadow-lg py-1 z-20">
          <button type="button" onClick={() => onExport(1)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent">
            Standard ({width}px)
          </button>
          <button type="button" onClick={() => onExport(2)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent">
            High-res ({width * 2}px)
          </button>
          {/* A clean, dedicated QR image -- not a crop of the poster, see
              exportQrAsPng -- for printing/sharing just the scannable
              code on its own (a business card, a flyer footer, ...).
              Hidden rather than disabled when the poster has no QR
              element at all (deleted it) -- there's nothing to export. */}
          {qrAvailable && (
            <button type="button" onClick={onExportQr} className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent border-t">
              QR code only
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function PosterEditor({ poster }) {
  const updatePoster = useUpdatePoster()
  const stageRef = useRef(null)
  const exportMenuRef = useRef(null)
  const exportMenuRefLg = useRef(null)
  const [selectedId, setSelectedId] = useState(null)
  // Purely a view toggle now -- which layout the canvas/properties below
  // are currently showing -- not design data, and not persisted: it never
  // mutates `design` (see layoutProjection.js) or regenerates anything.
  // Opens on the poster's own `template` (its "default layout") so coming
  // back to an existing poster picks up where its last editor session's
  // ElementsPanel.jsx size selector left off.
  const [currentLayout, setCurrentLayout] = useState(poster.template || CANONICAL_LAYOUT)
  const [saveState, setSaveState] = useState('saved') // 'saved' | 'unsaved' | 'saving'
  const [isExporting, setIsExporting] = useState(false)
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)

  // Click-to-toggle, not hover -- a hover-only dropdown (`group-hover`)
  // closes the instant the cursor leaves the trigger, so moving diagonally
  // toward the menu items easily loses hover partway and the menu
  // disappears before you can click anything. Same click-outside pattern
  // as ShareCampaign.jsx's own share menu. Checks both ExportMenu copies
  // (stacked and merged, see below) since only one is ever actually
  // visible/clickable, but both exist in the DOM.
  useEffect(() => {
    if (!isExportMenuOpen) return
    function handleClickOutside(e) {
      const insideStacked = exportMenuRef.current?.contains(e.target)
      const insideMerged = exportMenuRefLg.current?.contains(e.target)
      if (!insideStacked && !insideMerged) setIsExportMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isExportMenuOpen])

  const { design, commit, undo, redo, canUndo, canRedo } = useDesignHistory(
    poster.design?.elements ? poster.design : emptyDesign(),
  )
  const debouncedDesign = useDebouncedValue(design, AUTOSAVE_DEBOUNCE_MS)
  const isFirstRun = useRef(true)

  // Autosave: fires only after the debounced value actually changes from a
  // user edit, never on initial load (see isFirstRun) -- see the spec's
  // "debounce rather than save on every canvas mutation" requirement.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    setSaveState('saving')
    updatePoster.mutate(
      { id: poster.id, design: debouncedDesign },
      {
        onSuccess: () => setSaveState('saved'),
        onError: () => setSaveState('unsaved'),
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDesign])

  useEffect(() => {
    if (!isFirstRun.current) setSaveState('unsaved')
  }, [design])

  // The elements actually shown/edited below -- Square (canonical) is
  // `design.elements` untouched; story/wide are derived from it (plus any
  // layout-specific override) by layoutProjection.js. Content edits
  // (text/color/binding/add/delete/reorder) below always go through
  // `design`/`commit` directly -- only geometry (position/size/rotation/
  // font size) needs to know which layout is currently active, via
  // handleElementChange.
  const layoutDims = POSTER_TEMPLATES.find((t) => t.value === currentLayout) ?? POSTER_TEMPLATES[0]
  const viewElements = projectElementsForLayout(design, currentLayout)
  const selectedElement = viewElements.find((el) => el.id === selectedId) || null

  function handleAdd(element) {
    commit({ ...design, elements: [...design.elements, element] })
    setSelectedId(element.id)
  }

  // Single entry point for both the canvas (drag/transform end) and the
  // Properties panel -- layoutProjection.js decides whether `patch` is a
  // geometry tweak for the currently-active layout only (goes into
  // layoutOverrides) or a content change that belongs on the shared
  // element (text/color/binding/opacity/...), which is what keeps those
  // changes visible across every layout immediately.
  function handleElementChange(id, patch) {
    commit(applyElementPatch(design, currentLayout, id, patch))
  }

  function handleDelete() {
    if (!selectedId) return
    commit(removeElementEverywhere(design, selectedId))
    setSelectedId(null)
  }

  // Backspace/Delete remove the selected canvas element -- not the poster
  // itself, and `allowInEditable` deliberately stays false (the default)
  // so Backspace while typing the poster's own name, or inside one of
  // PropertiesPanel's text/textarea fields, edits that text instead of
  // deleting whatever happens to be selected on the canvas.
  useKeyboardShortcut('Backspace', handleDelete)
  useKeyboardShortcut('Delete', handleDelete)
  // Escape deselects -- also clears whatever the Transformer handles were
  // showing, same as clicking empty canvas (PosterCanvas.jsx's own
  // onMouseDown already does that for a literal click).
  useKeyboardShortcut('Escape', () => setSelectedId(null))
  useKeyboardShortcut('mod+z', undo)
  useKeyboardShortcut('shift+mod+z', redo)

  function reorder(direction) {
    if (!selectedId) return
    const elements = design.elements.filter((el) => el.id !== selectedId)
    const element = design.elements.find((el) => el.id === selectedId)
    commit({ ...design, elements: direction === 'front' ? [...elements, element] : [element, ...elements] })
  }

  // binding: which image the background shows ('cover_image_url' /
  // 'organization_logo_url'), or '' to switch to a flat color (see
  // findBackgroundImage/findBackgroundScrim in templateCompositions.js for
  // how these two elements are located). background: the flat color itself,
  // used both as the Color-mode background and as the matte an image
  // background sits on while it loads.
  function handleBackgroundChange({ binding, background }) {
    let elements = design.elements
    if (binding !== undefined) {
      elements = elements.map((el) => {
        if (el.role === 'background-image') return { ...el, binding }
        if (el.role === 'scrim') return { ...el, opacity: binding ? 1 : 0 }
        return el
      })
    }
    commit({ ...design, elements, ...(background !== undefined ? { background } : {}) })
  }

  // Promotes any image element (an upload, or a bound one) to be the
  // background instead -- resizes it full-bleed and hands it the
  // background-image role. The element that previously held that role is
  // dropped outright rather than left behind at the same full-bleed
  // geometry -- keeping it around would just be an invisible duplicate
  // stacked directly behind the new one. `fromTemplate: true` so a later
  // size switch treats it like the template-owned background it now is
  // (regenerated/rescaled full-bleed, see handleSizeChange) instead of
  // trying to preserve it as a "user-added" element in place.
  function handleSetImageAsBackground(id) {
    const target = design.elements.find((el) => el.id === id)
    const oldBackground = findBackgroundImage(design)
    if (!target || target.id === oldBackground?.id) return
    // Reset rotation/opacity too, not just position/size -- a full-bleed
    // rect that's still carrying whatever rotation or transparency it had
    // as a regular element visibly doesn't cover the canvas anymore (swings
    // outside the frame, or lets the base color show through).
    const promoted = {
      ...target, role: 'background-image', fromTemplate: true, objectFit: 'cover',
      x: 0, y: 0, width: design.width, height: design.height, rotation: 0, opacity: 1,
    }
    // Placed first, not left at its old spot in the stack -- a background
    // has to render behind every other element, and simply transforming it
    // in place would leave it wherever it happened to be added (usually the
    // end, i.e. drawn on top of and hiding everything else).
    const rest = design.elements
      .filter((el) => el.id !== oldBackground?.id && el.id !== id)
      .map((el) => (el.role === 'scrim' ? { ...el, opacity: 1 } : el))
    commit({ ...design, elements: [promoted, ...rest] })
  }

  function handleExport(pixelRatio) {
    if (!stageRef.current) return
    setIsExportMenuOpen(false)
    setIsExporting(true)
    setSelectedId(null)
    // Wait a tick for the Transformer's selection handles to actually
    // clear off the canvas before rasterizing -- otherwise they'd get
    // baked into the exported PNG.
    requestAnimationFrame(() => {
      exportPosterAsPng(stageRef.current, { pixelRatio, filename: `${poster.name}.png`, width: layoutDims.width, height: layoutDims.height })
      setIsExporting(false)
    })
  }

  // Content (fgColor/bgColor), not geometry -- read straight off the
  // shared `design.elements`, same value regardless of currentLayout.
  // Regenerated directly through the qrcode library rather than cropped
  // out of the stage (see exportQrAsPng), so this doesn't need the
  // Transformer-clearing tick handleExport above does.
  const qrElement = design.elements.find((el) => el.type === 'qr')
  function handleExportQr() {
    if (!qrElement) return
    setIsExportMenuOpen(false)
    exportQrAsPng({
      value: poster.destination?.public_url,
      fgColor: qrElement.fgColor,
      bgColor: qrElement.bgColor,
      filename: `${poster.name} QR Code.png`,
    })
  }

  const toggleExportMenu = () => setIsExportMenuOpen((v) => !v)
  const shareButton = poster.share_url && (
    <ShareCampaign
      title={poster.name}
      url={poster.share_url}
      buttonLabel="Share"
      buttonClassName="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border hover:bg-accent transition-colors whitespace-nowrap"
    />
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
      <div className="space-y-3">
        {/* lg+: everything in one bar -- undo/redo, the element-add
            buttons + size selector, then save state/export/share pushed
            to the far right. Below lg there isn't room for all of that on
            one line, so it splits back into two stacked bars (below). */}
        <div className="hidden lg:flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2">
          <UndoRedoControls canUndo={canUndo} canRedo={canRedo} undo={undo} redo={redo} />
          <div className="w-px h-8 bg-border" />
          <ElementsPanel posterId={poster.id} onAdd={handleAdd} currentSize={currentLayout} onSizeChange={setCurrentLayout} />
          <div className="flex items-center gap-2 ml-auto">
            <SaveStateIndicator saveState={saveState} />
            <ExportMenu
              menuRef={exportMenuRefLg}
              isOpen={isExportMenuOpen}
              onToggle={toggleExportMenu}
              isExporting={isExporting}
              onExport={handleExport}
              width={layoutDims.width}
              onExportQr={handleExportQr}
              qrAvailable={Boolean(qrElement)}
            />
            {shareButton}
          </div>
        </div>

        <div className="lg:hidden space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2">
            <UndoRedoControls canUndo={canUndo} canRedo={canRedo} undo={undo} redo={redo} />
            <SaveStateIndicator saveState={saveState} />
            <div className="flex items-center gap-2">
              <ExportMenu
                menuRef={exportMenuRef}
                isOpen={isExportMenuOpen}
                onToggle={toggleExportMenu}
                isExporting={isExporting}
                onExport={handleExport}
                width={layoutDims.width}
                onExportQr={handleExportQr}
                qrAvailable={Boolean(qrElement)}
              />
              {shareButton}
            </div>
          </div>

          <div className="rounded-xl border bg-card px-2 py-1.5 overflow-x-auto">
            <ElementsPanel posterId={poster.id} onAdd={handleAdd} currentSize={currentLayout} onSizeChange={setCurrentLayout} />
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4 h-[70vh] max-h-[820px] min-h-[360px]">
          <PosterCanvas
            elements={viewElements}
            width={layoutDims.width}
            height={layoutDims.height}
            background={design.background}
            destination={poster.destination}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onElementChange={handleElementChange}
            stageRef={stageRef}
          />
        </div>
      </div>

      <aside className="rounded-xl border bg-card p-3 h-fit">
        <PropertiesPanel
          element={selectedElement}
          onChange={handleElementChange}
          onDelete={handleDelete}
          onBringToFront={() => reorder('front')}
          onSendToBack={() => reorder('back')}
          design={design}
          onBackgroundChange={handleBackgroundChange}
          onSetAsBackground={handleSetImageAsBackground}
          hasLayoutOverride={selectedId ? hasElementOverride(design, currentLayout, selectedId) : false}
          onResetLayoutOverride={() => commit(clearElementOverride(design, currentLayout, selectedId))}
        />
      </aside>
    </div>
  )
}
