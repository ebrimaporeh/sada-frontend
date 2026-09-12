import { useEffect, useRef, useState } from 'react'
import { Check, Download, Loader2, Redo2, Undo2 } from 'lucide-react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useUpdatePoster } from '@/hooks/usePosters'
import { ShareCampaign } from '@/components/custom/ShareCampaign'
import { emptyDesign } from './designSchema'
import { useDesignHistory } from './useDesignHistory'
import { PosterCanvas } from './PosterCanvas'
import { ElementsPanel } from './ElementsPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { exportPosterAsPng } from './exportPoster'
import { buildInitialDesign } from './templateCompositions'
import { POSTER_TEMPLATES } from '../shared/posterTemplates'

const AUTOSAVE_DEBOUNCE_MS = 1200

function UndoRedoControls({ canUndo, canRedo, undo, redo }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={!canUndo} onClick={undo} className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30" title="Undo">
        <Undo2 className="w-4 h-4" />
      </button>
      <button type="button" disabled={!canRedo} onClick={redo} className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30" title="Redo">
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
function ExportMenu({ menuRef, isOpen, onToggle, isExporting, onExport, width }) {
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

  const selectedElement = design.elements.find((el) => el.id === selectedId) || null
  const currentSize = POSTER_TEMPLATES.find((t) => t.width === design.width && t.height === design.height)?.value

  function handleAdd(element) {
    commit({ ...design, elements: [...design.elements, element] })
    setSelectedId(element.id)
  }

  function handleElementsChange(nextElements) {
    commit({ ...design, elements: nextElements })
  }

  function handlePropertyChange(updated) {
    commit({ ...design, elements: design.elements.map((el) => (el.id === updated.id ? updated : el)) })
  }

  function handleDelete() {
    if (!selectedId) return
    commit({ ...design, elements: design.elements.filter((el) => el.id !== selectedId) })
    setSelectedId(null)
  }

  function reorder(direction) {
    if (!selectedId) return
    const elements = design.elements.filter((el) => el.id !== selectedId)
    const element = design.elements.find((el) => el.id === selectedId)
    commit({ ...design, elements: direction === 'front' ? [...elements, element] : [element, ...elements] })
  }

  // Regenerates the template's own starting elements at the new size rather
  // than rescaling them -- a linear x/y/font transform can't reproduce the
  // same bottom-anchored layout math templateCompositions.js uses across
  // wildly different aspect ratios (e.g. Story's 9:16 down to Wide's
  // ~1.9:1) without producing visibly broken results. Anything the user
  // added themselves (unmarked by `fromTemplate`) isn't template-generated
  // in the first place, so there's no such layout math to reproduce for it
  // -- it's kept and proportionally rescaled onto the new canvas instead of
  // being thrown away. Undo remains the safety net for the template part.
  function handleSizeChange(nextTemplate) {
    const size = POSTER_TEMPLATES.find((t) => t.value === nextTemplate)
    if (!size || (design.width === size.width && design.height === size.height)) return
    const scaleX = size.width / design.width
    const scaleY = size.height / design.height
    const scale = Math.min(scaleX, scaleY) // uniform, so rescaled elements keep their own proportions
    const customElements = design.elements
      .filter((el) => !el.fromTemplate)
      .map((el) => ({
        ...el,
        x: Math.round(el.x * scaleX),
        y: Math.round(el.y * scaleY),
        ...(typeof el.width === 'number' ? { width: Math.round(el.width * scale) } : {}),
        ...(typeof el.height === 'number' ? { height: Math.round(el.height * scale) } : {}),
        ...(typeof el.fontSize === 'number' ? { fontSize: Math.round(el.fontSize * scale) } : {}),
      }))
    const next = buildInitialDesign(nextTemplate, poster.destination?.type)
    commit({ ...next, elements: [...next.elements, ...customElements] })
    setSelectedId(null)
    updatePoster.mutate({ id: poster.id, template: nextTemplate })
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
      exportPosterAsPng(stageRef.current, { pixelRatio, filename: `${poster.name}.png`, width: design.width, height: design.height })
      setIsExporting(false)
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
          <ElementsPanel posterId={poster.id} onAdd={handleAdd} currentSize={currentSize} onSizeChange={handleSizeChange} />
          <div className="flex items-center gap-2 ml-auto">
            <SaveStateIndicator saveState={saveState} />
            <ExportMenu
              menuRef={exportMenuRefLg}
              isOpen={isExportMenuOpen}
              onToggle={toggleExportMenu}
              isExporting={isExporting}
              onExport={handleExport}
              width={design.width}
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
                width={design.width}
              />
              {shareButton}
            </div>
          </div>

          <div className="rounded-xl border bg-card px-2 py-1.5 overflow-x-auto">
            <ElementsPanel posterId={poster.id} onAdd={handleAdd} currentSize={currentSize} onSizeChange={handleSizeChange} />
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4 h-[70vh] max-h-[820px] min-h-[360px]">
          <PosterCanvas
            design={design}
            destination={poster.destination}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onElementChange={handleElementsChange}
            stageRef={stageRef}
          />
        </div>
      </div>

      <aside className="rounded-xl border bg-card p-3 h-fit">
        <PropertiesPanel
          element={selectedElement}
          onChange={handlePropertyChange}
          onDelete={handleDelete}
          onBringToFront={() => reorder('front')}
          onSendToBack={() => reorder('back')}
        />
      </aside>
    </div>
  )
}
