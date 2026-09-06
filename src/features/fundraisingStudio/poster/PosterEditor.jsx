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

const AUTOSAVE_DEBOUNCE_MS = 1200

export function PosterEditor({ poster }) {
  const updatePoster = useUpdatePoster()
  const stageRef = useRef(null)
  const [selectedId, setSelectedId] = useState(null)
  const [saveState, setSaveState] = useState('saved') // 'saved' | 'unsaved' | 'saving'
  const [isExporting, setIsExporting] = useState(false)

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

  function handleExport(pixelRatio) {
    if (!stageRef.current) return
    setIsExporting(true)
    setSelectedId(null)
    // Wait a tick for the Transformer's selection handles to actually
    // clear off the canvas before rasterizing -- otherwise they'd get
    // baked into the exported PNG.
    requestAnimationFrame(() => {
      exportPosterAsPng(stageRef.current, { pixelRatio, filename: `${poster.name}.png` })
      setIsExporting(false)
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2">
          <div className="flex items-center gap-1">
            <button type="button" disabled={!canUndo} onClick={undo} className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30" title="Undo">
              <Undo2 className="w-4 h-4" />
            </button>
            <button type="button" disabled={!canRedo} onClick={redo} className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30" title="Redo">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveState === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>}
            {saveState === 'saved' && <><Check className="w-3 h-3" /> Saved</>}
            {saveState === 'unsaved' && 'Unsaved changes'}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                type="button"
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Export
              </button>
              <div className="absolute right-0 mt-1 w-40 bg-card border rounded-lg shadow-lg py-1 hidden group-hover:block z-20">
                <button type="button" onClick={() => handleExport(1)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent">
                  Standard (1080px)
                </button>
                <button type="button" onClick={() => handleExport(2)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent">
                  High-res (2160px)
                </button>
              </div>
            </div>
            {poster.share_url && (
              <ShareCampaign title={poster.name} url={poster.share_url} buttonLabel="Share" />
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card px-2 py-1.5 overflow-x-auto">
          <ElementsPanel posterId={poster.id} onAdd={handleAdd} />
        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
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
