import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Check, ChevronLeft, Copy, Loader2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES } from '@/constants'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useEmbed, useSetEmbedActive, useUpdateEmbed } from '@/hooks/useEmbeds'
import { EmbedLayoutPicker } from '@/features/fundraisingStudio/embed/EmbedLayoutPicker'
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
  const [returnUrl, setReturnUrl] = useState('')
  const [saveState, setSaveState] = useState('saved')
  const [copied, setCopied] = useState(false)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (embed) {
      setName(embed.name)
      setLayout(embed.layout)
      setConfiguration(embed.configuration)
      setReturnUrl(embed.return_url || '')
    }
  }, [embed])

  const debouncedLayout = useDebouncedValue(layout, AUTOSAVE_DEBOUNCE_MS)
  const debouncedConfiguration = useDebouncedValue(configuration, AUTOSAVE_DEBOUNCE_MS)
  const debouncedReturnUrl = useDebouncedValue(returnUrl, AUTOSAVE_DEBOUNCE_MS)

  useEffect(() => {
    if (isFirstRun.current || !embed) {
      isFirstRun.current = false
      return
    }
    setSaveState('saving')
    updateEmbed.mutate(
      {
        id: embed.id,
        layout: debouncedLayout,
        configuration: debouncedConfiguration,
        // Omitted (not sent as '') when blank -- return_url is required
        // once set, so an empty value here can only mean a pre-existing
        // embed that predates this field; leave it alone rather than
        // reject the whole autosave (which would also block layout/
        // configuration changes) over a field the user isn't touching.
        ...(debouncedReturnUrl ? { return_url: debouncedReturnUrl } : {}),
      },
      { onSuccess: () => setSaveState('saved'), onError: () => setSaveState('unsaved') },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLayout, debouncedConfiguration, debouncedReturnUrl])

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
  // height="500" gives the in-place Donate form (see DonateModal.jsx) room
  // to render inside the iframe's own box -- it can't expand past its own
  // bounds on the host page, so an unset/too-short height would clip it.
  const snippet = `<iframe src="${embed.embed_url}" width="100%" height="500" style="border:0;" loading="lazy" title="${embed.name}"></iframe>`

  return (
    <div>
      {/* Back button inline with the title (not its own row) -- keeps the
          header compact, same treatment as PosterDetailPage.jsx. */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to={ROUTES.FUNDRAISING_EMBEDS}
            title="Back to Embeds"
            className="shrink-0 p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              className="w-full text-lg font-bold tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0"
            />
            <p className="text-sm text-muted-foreground truncate">{embed.destination?.title}</p>
          </div>
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

      {/* Three columns on large screens -- layout | preview + embed code |
          content/appearance/return-url -- instead of cramming every
          control into one narrow sidebar, which left the rest of a wide
          screen unused next to a small preview card. */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_340px] gap-4 items-start">
        <aside className="rounded-xl border bg-card p-4 h-fit">
          <EmbedLayoutPicker layout={layout} onLayoutChange={setLayout} />
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

        <aside className="rounded-xl border bg-card p-4 h-fit">
          <EmbedConfigForm
            embed={{ configuration, return_url: returnUrl }}
            onConfigurationChange={setConfiguration}
            onReturnUrlChange={setReturnUrl}
          />
        </aside>
      </div>
    </div>
  )
}
