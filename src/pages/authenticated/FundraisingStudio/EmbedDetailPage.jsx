import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Copy, Loader2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES } from '@/constants'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useOrganizationEmbed, useSetEmbedActive, useUpdateEmbed } from '@/hooks/useEmbeds'
import { EmbedLayoutPicker } from '@/features/fundraisingStudio/embed/EmbedLayoutPicker'
import { EmbedLayoutDropdown } from '@/features/fundraisingStudio/embed/EmbedLayoutDropdown'
import { EmbedConfigForm } from '@/features/fundraisingStudio/embed/EmbedConfigForm'
import { DonationFlowConfigForm } from '@/features/fundraisingStudio/embed/DonationFlowConfigForm'
import { EmbedPreview } from '@/features/fundraisingStudio/embed/EmbedPreview'
import { DonationFlowPreview } from '@/features/fundraisingStudio/embed/widget/DonationFlowPreview'
import { mergeConfiguration } from '@/features/fundraisingStudio/embed/defaultConfiguration'

const AUTOSAVE_DEBOUNCE_MS = 1000

function EmbedCodePanel({ snippet, copied, onCopy }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <label className="text-sm font-medium block mb-2">Embed code</label>
      <div className="flex items-start gap-2">
        <code className="flex-1 text-xs bg-muted rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">{snippet}</code>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border hover:bg-accent transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Paste this into your website's HTML. It stays live -- content updates here without needing to change the code again.
        This snippet always renders the layout currently selected on the left -- pick a different one and copy again to
        install that layout somewhere else on your site. One embed, as many placements and layouts as you like.
      </p>
    </div>
  )
}

// "Step 2" -- a dedicated screen, not a cramped tab inside the card
// editor's own sidebar. Design controls on the left, a live, always-on
// preview of the real donation flow on the right -- DonationFlowPreview is
// the exact same component the real DonateModal renders, so what's shown
// here is exactly what a donor sees, styling included, updating instantly
// as the form on the left changes (no debounce -- that only gates the
// autosave network call, not this in-memory preview).
function DonationFlowStep({ embed, configuration, onConfigurationChange, returnUrl, onReturnUrlChange }) {
  const previewDestination = embed.destinations?.[0]
  const donationFlowTheme = mergeConfiguration(configuration).donationFlow

  return (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <div className="rounded-xl border bg-card p-4 order-2 lg:order-1">
        <DonationFlowConfigForm
          embed={{ configuration, return_url: returnUrl }}
          onConfigurationChange={onConfigurationChange}
          onReturnUrlChange={onReturnUrlChange}
        />
      </div>
      <div className="order-1 lg:order-2 lg:sticky lg:top-4">
        <p className="section-label mb-2">Live preview</p>
        {previewDestination ? (
          <DonationFlowPreview destination={previewDestination} theme={donationFlowTheme} className="rounded-2xl" />
        ) : (
          <div className="p-4 rounded-xl border bg-muted text-center text-sm text-muted-foreground">
            Turn on your organization's own card or an active campaign's "Show in embed widget" toggle first --
            there's nothing to preview a donation flow for yet.
          </div>
        )}
      </div>
    </div>
  )
}

export function EmbedDetailPage() {
  const { organizationId } = useParams({ strict: false })
  const { embed, isLoading } = useOrganizationEmbed(organizationId)
  const updateEmbed = useUpdateEmbed()
  const setActive = useSetEmbedActive()

  const [name, setName] = useState('')
  const [layout, setLayout] = useState(null)
  const [configuration, setConfiguration] = useState(null)
  const [returnUrl, setReturnUrl] = useState('')
  const [step, setStep] = useState('card')
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
        organizationId,
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
    if (name && embed && name !== embed.name) updateEmbed.mutate({ id: embed.id, organizationId, name })
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
  // `?layout=` is always explicit here (never left to the embed's own
  // stored default) -- see EmbedPublicView on the backend -- so this exact
  // snippet keeps rendering the layout currently selected even if the
  // stored default is changed later from a different placement's snippet.
  const snippet = `<iframe src="${embed.embed_url}?layout=${layout}" width="100%" height="500" style="border:0;" loading="lazy" title="${embed.name}"></iframe>`

  return (
    <div>
      {/* Back button inline with the title (not its own row) -- keeps the
          header compact, same treatment as PosterDetailPage.jsx. */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to={ROUTES.FUNDRAISING_EMBEDS}
            className="shrink-0 flex items-center gap-0.5 py-1 pl-1.5 pr-2 -ml-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Embeds
          </Link>
          <div className="min-w-0">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              className="w-full text-lg font-bold tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0"
            />
            <p className="text-sm text-muted-foreground truncate">{embed.organization?.organization_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveState === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>}
            {saveState === 'saved' && <><Check className="w-3 h-3" /> Saved</>}
            {saveState === 'unsaved' && 'Unsaved changes'}
          </div>
          {/* The step switch itself -- deliberately up here, not a tab
              tucked into the (already narrow) config sidebar, since step 2
              is a full alternate layout, not just a different form. */}
          {step === 'card' ? (
            <button
              type="button"
              onClick={() => setStep('donationFlow')}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next: Design Donation Flow <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep('card')}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Design Card
            </button>
          )}
          <button
            type="button"
            onClick={() => setActive.mutate({ id: embed.id, organizationId, isActive: !embed.is_active })}
            className="text-xs font-medium px-3 py-1.5 rounded-md border hover:bg-accent transition-colors"
          >
            {embed.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {step === 'donationFlow' ? (
        <DonationFlowStep
          embed={previewEmbed}
          configuration={configuration}
          onConfigurationChange={setConfiguration}
          returnUrl={returnUrl}
          onReturnUrlChange={setReturnUrl}
        />
      ) : (
        <>
          {/* Mobile/tablet (<lg): a compact layout dropdown up top instead
              of the full card list (which alone can run 400+px tall and
              push everything else below a scroll before it's even
              visible), then the preview, then the editing controls right
              below it -- so a change and its effect stay close together --
              with the copy-paste embed code (more a one-time final step
              than something tweaked alongside the preview) pushed to the
              very bottom. */}
          <div className="lg:hidden space-y-4">
            <EmbedLayoutDropdown layout={layout} onLayoutChange={setLayout} />
            <EmbedPreview embed={previewEmbed} />
            <div className="rounded-xl border bg-card p-4">
              <EmbedConfigForm embed={{ configuration }} onConfigurationChange={setConfiguration} />
            </div>
            <EmbedCodePanel snippet={snippet} copied={copied} onCopy={() => handleCopy(snippet)} />
          </div>

          {/* Desktop (lg+): three columns side by side -- layout | preview +
              embed code | content/appearance. */}
          <div className="hidden lg:grid lg:grid-cols-[240px_1fr_340px] gap-4 items-start">
            <aside className="rounded-xl border bg-card p-4 h-fit">
              <EmbedLayoutPicker layout={layout} onLayoutChange={setLayout} />
            </aside>

            <div className="space-y-4">
              <EmbedPreview embed={previewEmbed} />
              <EmbedCodePanel snippet={snippet} copied={copied} onCopy={() => handleCopy(snippet)} />
            </div>

            <aside className="rounded-xl border bg-card p-4 h-fit">
              <EmbedConfigForm embed={{ configuration }} onConfigurationChange={setConfiguration} />
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
