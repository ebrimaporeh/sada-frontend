import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronLeft, Loader2, Image as ImageIcon, QrCode } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES } from '@/constants'
import { useFundraisingDestinations } from '@/features/fundraisingStudio/shared/useFundraisingDestinations'
import { DestinationPicker } from '@/features/fundraisingStudio/shared/DestinationPicker'
import { buildInitialDesign } from '@/features/fundraisingStudio/poster/templateCompositions'
import { useCreatePoster } from '@/hooks/usePosters'

// A poster now covers all three layouts (square/story/wide) at once --
// see .claude/backend/fundraising.md -- so there's no "pick a size" step
// here anymore, just this one Square preview (the canonical layout every
// poster is built at, see templateCompositions.js) to confirm what the
// chosen destination will actually look like before creating it.
function DestinationPreviewThumb({ destination }) {
  return (
    <div className="relative w-full aspect-square rounded-md overflow-hidden border bg-slate-900">
      {destination?.coverImageUrl ? (
        <img src={destination.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-white/25" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2.5 pr-8">
        <p className="text-[11px] font-bold text-white leading-tight line-clamp-2">
          {destination?.title || 'Your campaign title'}
        </p>
        <p className="text-[8px] font-medium text-white/70 truncate mt-0.5">
          {destination?.subtitle || 'Organization donation page'}
        </p>
      </div>
      <div className="absolute bottom-2 right-2 w-4 h-4 rounded-[3px] bg-white flex items-center justify-center">
        <QrCode className="w-2.5 h-2.5 text-slate-900" />
      </div>
    </div>
  )
}

export function PosterNewPage() {
  const navigate = useNavigate()
  // Set when arriving via a "Design Poster" button on a campaign/
  // organization page (see MyCampaignDetailPage.jsx / OrganizationOverview.jsx)
  // -- pre-selects that destination below instead of making the user pick
  // it again from a list they just came from.
  const search = useSearch({ strict: false })
  const { campaignDestinations, organizationDestinations, isLoading } = useFundraisingDestinations()
  const createPoster = useCreatePoster()

  const [destination, setDestination] = useState(null)

  useEffect(() => {
    if (destination || isLoading || !search?.destinationType || !search?.destinationId) return
    const list = search.destinationType === 'campaign' ? campaignDestinations : organizationDestinations
    const match = list.find((d) => d.id === search.destinationId)
    if (match) setDestination(match)
  }, [destination, isLoading, search?.destinationType, search?.destinationId, campaignDestinations, organizationDestinations])

  function handleCreate() {
    if (!destination) return
    createPoster.mutate(
      {
        destination_type: destination.type,
        ...(destination.type === 'campaign' ? { campaign_id: destination.id } : { organization_id: destination.id }),
        name: `${destination.title} Poster`,
        template: 'square',
        design: buildInitialDesign(destination.type),
      },
      { onSuccess: (res) => navigate({ to: ROUTES.FUNDRAISING_POSTER_DETAIL, params: { id: res.data.poster.id } }) },
    )
  }

  if (isLoading) return <LoadingSpinner className="py-16" />

  return (
    <div>
      <Link
        to={ROUTES.FUNDRAISING_POSTERS}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Posters
      </Link>
      <PageHeader title="Create Poster" description="Choose what you're promoting -- the editor covers every layout from there." />

      <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
        <section className="lg:sticky lg:top-6">
          <p className="font-medium mb-3">Destination</p>
          <DestinationPicker
            campaignDestinations={campaignDestinations}
            organizationDestinations={organizationDestinations}
            value={destination}
            onChange={setDestination}
            columns={1}
          />
        </section>

        <section>
          <p className="font-medium mb-3">Preview</p>
          <div className="max-w-xs">
            {destination ? (
              <DestinationPreviewThumb destination={destination} />
            ) : (
              <p className="text-sm text-muted-foreground">Choose a destination first.</p>
            )}
          </div>

          {createPoster.isError && (
            <p className="text-sm text-destructive mt-6">
              {createPoster.error?.response?.data?.message ?? 'Could not create the poster. Please try again.'}
            </p>
          )}

          <button
            type="button"
            disabled={!destination || createPoster.isPending}
            onClick={handleCreate}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createPoster.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue to editor
          </button>
        </section>
      </div>
    </div>
  )
}
