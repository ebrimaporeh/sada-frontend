import { useEffect, useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { Check, Copy, Loader2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useEmbed, useSetEmbedActive, useUpdateEmbed } from '@/hooks/useEmbeds'
import { EmbedConfigForm } from '@/features/fundraisingStudio/embed/EmbedConfigForm'
import { EmbedPreview } from '@/features/fundraisingStudio/embed/EmbedPreview'

const AUTOSAVE_DEBOUNCE_MS = 1000

export function EmbedDetailPage() {
  const { id } = useParams({ strict: false })
  const { embed, isLoading } = useEmbed(id)
  const updateEmbed = useUpdateEmbed()
  const setActive = useSetEmbedActive()

  const [name, setName] = useState('')
  const [layout, setLayout] = useState(null)
  const [configuration, setConfiguration] = useState(null)
  const [saveState, setSaveState] = useState('saved')
  const [copied, setCopied] = useState(false)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (embed) {
      setName(embed.name)
      setLayout(embed.layout)
      setConfiguration(embed.configuration)
    }
  }, [embed])

  const debouncedLayout = useDebouncedValue(layout, AUTOSAVE_DEBOUNCE_MS)
  const debouncedConfiguration = useDebouncedValue(configuration, AUTOSAVE_DEBOUNCE_MS)

  useEffect(() => {
    if (isFirstRun.current || !embed) {
      isFirstRun.current = false
      return
    }
    setSaveState('saving')
    updateEmbed.mutate(
      { id: embed.id, layout: debouncedLayout, configuration: debouncedConfiguration },
      { onSuccess: () => setSaveState('saved'), onError: () => setSaveState('unsaved') },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLayout, debouncedConfiguration])

  function handleNameBlur() {
    if (name && embed && name !== embed.name) updateEmbed.mutate({ id: embed.id, name })
  }

  function handleCopy(snippet) {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading || !embed || layout === null) return <LoadingSpinner className="py-16" />

  const previewEmbed = { ...embed, layout, configuration, is_active: true }
  const snippet = `<iframe src="${embed.embed_url}" width="100%" style="border:0;" loading="lazy" title="${embed.name}"></iframe>`

  return (
    <div>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            className="text-xl font-bold tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0"
          />
          <p className="text-sm text-muted-foreground">{embed.destination?.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveState === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>}
            {saveState === 'saved' && <><Check className="w-3 h-3" /> Saved</>}
            {saveState === 'unsaved' && 'Unsaved changes'}
          </div>
          <button
            type="button"
            onClick={() => setActive.mutate({ id: embed.id, isActive: !embed.is_active })}
            className="text-xs font-medium px-3 py-1.5 rounded-md border hover:bg-accent transition-colors"
          >
            {embed.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-xl border bg-card p-4 h-fit">
          <EmbedConfigForm embed={{ layout, configuration }} onLayoutChange={setLayout} onConfigurationChange={setConfiguration} />
        </aside>

        <div className="space-y-4">
          <EmbedPreview embed={previewEmbed} />

          <div className="rounded-xl border bg-card p-4">
            <label className="text-sm font-medium block mb-2">Embed code</label>
            <div className="flex items-start gap-2">
              <code className="flex-1 text-xs bg-muted rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">{snippet}</code>
              <button
                type="button"
                onClick={() => handleCopy(snippet)}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border hover:bg-accent transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Paste this into your website's HTML. It stays live -- content updates here without needing to change the code again.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
