import { useRef, useState } from 'react'
import { Type, Image as ImageIcon, Square, Circle as CircleIcon, Minus, QrCode, Loader2 } from 'lucide-react'
import { compressImage } from '@/utils/imageCompression'
import { useUploadPosterImage } from '@/hooks/usePosters'
import { createImageElement, createQrElement, createShapeElement, createTextElement } from './designSchema'

// Click-to-add, not drag-and-drop -- see the architecture doc's "why not
// @dnd-kit" note. Konva's own drag handling already covers moving an
// element once it's on the canvas.
//
// Rendered as a horizontal bar above the canvas (not a side column) --
// PosterEditor.jsx places this in its own row, so the canvas/properties
// area only needs two columns, not three.
export function ElementsPanel({ posterId, onAdd }) {
  const fileInputRef = useRef(null)
  const uploadImage = useUploadPosterImage()
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setIsUploading(true)
    try {
      const compressed = await compressImage(file, 'poster_image')
      const res = await uploadImage.mutateAsync({ id: posterId, file: compressed })
      onAdd(createImageElement({ src: res.data.image.image_url, x: 100, y: 100, width: 400, height: 300 }))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <PanelButton icon={Type} label="Text" onClick={() => onAdd(createTextElement())} />
      <PanelButton
        icon={isUploading ? Loader2 : ImageIcon}
        iconClassName={isUploading ? 'animate-spin' : ''}
        label={isUploading ? 'Uploading…' : 'Image'}
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
      <PanelButton icon={Square} label="Rectangle" onClick={() => onAdd(createShapeElement({ shapeType: 'rect' }))} />
      <PanelButton
        icon={Square}
        label="Rounded Rect"
        onClick={() => onAdd(createShapeElement({ shapeType: 'rect', cornerRadius: 24 }))}
      />
      <PanelButton icon={CircleIcon} label="Circle" onClick={() => onAdd(createShapeElement({ shapeType: 'circle', width: 160, height: 160 }))} />
      <PanelButton icon={Minus} label="Line" onClick={() => onAdd(createShapeElement({ shapeType: 'line', width: 300, height: 4, fill: '#111111' }))} />
      <PanelButton icon={QrCode} label="QR Code" onClick={() => onAdd(createQrElement())} />
    </div>
  )
}

function PanelButton({ icon: Icon, label, onClick, disabled, iconClassName }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs hover:bg-accent transition-colors disabled:opacity-50 min-w-[64px]"
    >
      <Icon className={`w-4 h-4 text-muted-foreground ${iconClassName || ''}`} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}
