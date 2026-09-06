import { useState } from 'react'
import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { cn } from '@/utils/cn'
import { FundraisingWidget } from './widget/FundraisingWidget'

const VIEWPORTS = [
  { value: 'desktop', label: 'Desktop', icon: Monitor, width: 480 },
  { value: 'tablet', label: 'Tablet', icon: Tablet, width: 380 },
  { value: 'mobile', label: 'Mobile', icon: Smartphone, width: 320 },
]

// Renders the exact same FundraisingWidget the public /embed/$id page
// does, just inside different fixed-width containers -- per the spec's
// "same widget, different viewport containers" requirement, not a
// separate preview-only implementation.
export function EmbedPreview({ embed }) {
  const [viewport, setViewport] = useState('desktop')
  const active = VIEWPORTS.find((v) => v.value === viewport)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1">
        {VIEWPORTS.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setViewport(v.value)}
            title={v.label}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewport === v.value ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground',
            )}
          >
            <v.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <div className="flex justify-center p-6 rounded-xl border bg-muted/30">
        <div style={{ width: active.width }} className="max-w-full">
          <FundraisingWidget embed={embed} interactive={false} />
        </div>
      </div>
    </div>
  )
}
