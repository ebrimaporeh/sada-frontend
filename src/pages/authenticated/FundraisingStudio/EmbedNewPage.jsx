import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES } from '@/constants'
import { useFundraisingDestinations } from '@/features/fundraisingStudio/shared/useFundraisingDestinations'
import { DestinationPicker } from '@/features/fundraisingStudio/shared/DestinationPicker'
import { useCreateEmbed } from '@/hooks/useEmbeds'

export function EmbedNewPage() {
  const navigate = useNavigate()
  // Set when arriving via a "Create Embed" button on a campaign/
  // organization page (see MyCampaignDetailPage.jsx / OrganizationOverview.jsx)
  // -- pre-selects that destination below instead of making the user pick
  // it again from a list they just came from.
  const search = useSearch({ strict: false })
  const { campaignDestinations, organizationDestinations, isLoading } = useFundraisingDestinations()
  const createEmbed = useCreateEmbed()

  const [destination, setDestination] = useState(null)
  const [returnUrl, setReturnUrl] = useState('')

  useEffect(() => {
    if (destination || isLoading || !search?.destinationType || !search?.destinationId) return
    const list = search.destinationType === 'campaign' ? campaignDestinations : organizationDestinations
    const match = list.find((d) => d.id === search.destinationId)
    if (match) setDestination(match)
  }, [destination, isLoading, search?.destinationType, search?.destinationId, campaignDestinations, organizationDestinations])

  const canCreate = destination && returnUrl.trim()

  function handleCreate() {
    if (!canCreate) return
    createEmbed.mutate(
      {
        destination_type: destination.type,
        ...(destination.type === 'campaign' ? { campaign_id: destination.id } : { organization_id: destination.id }),
        name: `${destination.title} Widget`,
        // Layout is chosen later, in the editor (EmbedLayoutPicker/
        // EmbedLayoutDropdown) -- omitted here so the backend's own
        // default (Embed.Layout.CARD) applies; not asking for it up front
        // keeps this form to exactly the one thing that's actually
        // required before creating an embed.
        return_url: returnUrl.trim(),
      },
      { onSuccess: (res) => navigate({ to: ROUTES.FUNDRAISING_EMBED_DETAIL, params: { id: res.data.embed.id } }) },
    )
  }

  if (isLoading) return <LoadingSpinner className="py-16" />

  return (
    <div className="max-w-2xl">
      <Link
        to={ROUTES.FUNDRAISING_EMBEDS}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Embeds
      </Link>
      <PageHeader title="Create Embed" description="Choose what you're promoting, then where to send donors back to." />

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
            <p className="font-medium mb-3">2. Where should donors go back to?</p>
            <input
              type="url"
              value={returnUrl}
              onChange={(e) => setReturnUrl(e.target.value)}
              placeholder="https://yoursite.com"
              required
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              After someone donates through this embed, we'll send them back here instead of leaving them on Dolelma.
            </p>
          </section>
        )}

        {createEmbed.isError && (
          <p className="text-sm text-destructive">
            {createEmbed.error?.response?.data?.message ?? 'Could not create the embed. Please try again.'}
          </p>
        )}

        <button
          type="button"
          disabled={!canCreate || createEmbed.isPending}
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
