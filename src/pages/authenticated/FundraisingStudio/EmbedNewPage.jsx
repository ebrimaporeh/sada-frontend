import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants'
import { useFundraisingDestinations } from '@/features/fundraisingStudio/shared/useFundraisingDestinations'
import { DestinationPicker } from '@/features/fundraisingStudio/shared/DestinationPicker'
import { EMBED_LAYOUTS } from '@/features/fundraisingStudio/shared/embedLayouts'
import { useCreateEmbed } from '@/hooks/useEmbeds'

export function EmbedNewPage() {
  const navigate = useNavigate()
  const { campaignDestinations, organizationDestinations, isLoading } = useFundraisingDestinations()
  const createEmbed = useCreateEmbed()

  const [destination, setDestination] = useState(null)
  const [layout, setLayout] = useState('card')

  function handleCreate() {
    if (!destination) return
    createEmbed.mutate(
      {
        destination_type: destination.type,
        ...(destination.type === 'campaign' ? { campaign_id: destination.id } : { organization_id: destination.id }),
        name: `${destination.title} Widget`,
        layout,
      },
      { onSuccess: (res) => navigate({ to: ROUTES.FUNDRAISING_EMBED_DETAIL, params: { id: res.data.embed.id } }) },
    )
  }

  if (isLoading) return <LoadingSpinner className="py-16" />

  return (
    <div className="max-w-2xl">
      <PageHeader title="Create Embed" description="Choose what you're promoting, then a layout." />

      <div className="space-y-8">
        <section>
          <p className="font-medium mb-3">1. Choose a destination</p>
          <DestinationPicker
            campaignDestinations={campaignDestinations}
            organizationDestinations={organizationDestinations}
            value={destination}
            onChange={setDestination}
          />
        </section>

        {destination && (
          <section>
            <p className="font-medium mb-3">2. Choose a layout</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {EMBED_LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLayout(l.value)}
                  className={cn(
                    'text-left rounded-lg border p-3 transition-colors',
                    layout === l.value ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                  )}
                >
                  <p className="text-sm font-medium">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.description}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {createEmbed.isError && (
          <p className="text-sm text-destructive">
            {createEmbed.error?.response?.data?.message ?? 'Could not create the embed. Please try again.'}
          </p>
        )}

        <button
          type="button"
          disabled={!destination || createEmbed.isPending}
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {createEmbed.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Continue to configuration
        </button>
      </div>
    </div>
  )
}
