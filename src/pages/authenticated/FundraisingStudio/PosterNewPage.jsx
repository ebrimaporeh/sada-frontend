import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants'
import { useFundraisingDestinations } from '@/features/fundraisingStudio/shared/useFundraisingDestinations'
import { DestinationPicker } from '@/features/fundraisingStudio/shared/DestinationPicker'
import { POSTER_TEMPLATES } from '@/features/fundraisingStudio/shared/posterTemplates'
import { buildInitialDesign } from '@/features/fundraisingStudio/poster/templateCompositions'
import { useCreatePoster } from '@/hooks/usePosters'

export function PosterNewPage() {
  const navigate = useNavigate()
  const { campaignDestinations, organizationDestinations, isLoading } = useFundraisingDestinations()
  const createPoster = useCreatePoster()

  const [destination, setDestination] = useState(null)
  const [template, setTemplate] = useState(null)

  function handleCreate() {
    if (!destination || !template) return
    createPoster.mutate(
      {
        destination_type: destination.type,
        ...(destination.type === 'campaign' ? { campaign_id: destination.id } : { organization_id: destination.id }),
        name: `${destination.title} Poster`,
        template,
        design: buildInitialDesign(template, destination.type),
      },
      { onSuccess: (res) => navigate({ to: ROUTES.FUNDRAISING_POSTER_DETAIL, params: { id: res.data.poster.id } }) },
    )
  }

  if (isLoading) return <LoadingSpinner className="py-16" />

  return (
    <div className="max-w-2xl">
      <PageHeader title="Create Poster" description="Choose what you're promoting, then a starting template." />

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
            <p className="font-medium mb-3">2. Choose a template</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {POSTER_TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTemplate(t.value)}
                  className={cn(
                    'text-left rounded-lg border p-3 transition-colors',
                    template === t.value ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                  )}
                >
                  <div className={cn('h-16 rounded-md mb-2', t.swatchClass)} />
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {createPoster.isError && (
          <p className="text-sm text-destructive">
            {createPoster.error?.response?.data?.message ?? 'Could not create the poster. Please try again.'}
          </p>
        )}

        <button
          type="button"
          disabled={!destination || !template || createPoster.isPending}
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {createPoster.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Continue to editor
        </button>
      </div>
    </div>
  )
}
