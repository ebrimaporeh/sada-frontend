import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { campaignApi } from '@/api/campaignApi'
import { useMe } from '@/hooks/useAuth'
import { OrganizationPermission } from '@/constants'

// Everything Poster Studio / Embed Studio need to know to let someone pick
// a destination -- reuses the existing "my campaigns" and "my
// organizations" data rather than a new endpoint. This is the one place
// the frontend does its own "which destinations can this person manage"
// filtering; every mutating call still gets re-checked server-side by
// fundraising_destination.check_destination_manage_access, this is purely
// for not showing options that would just 403.
export function useFundraisingDestinations() {
  const { data: me } = useMe()

  const campaignsQuery = useQuery({
    queryKey: queryKeys.campaigns.mine(),
    queryFn: campaignApi.getMyCampaigns,
    select: (res) => res?.data?.campaigns ?? [],
  })

  const campaignDestinations = (campaignsQuery.data ?? []).map((c) => ({
    type: 'campaign',
    id: c.id,
    title: c.title,
    subtitle: c.organization_name ? `${c.organization_name} campaign` : 'Individual campaign',
    coverImageUrl: c.cover_image_url,
  }))

  const organizationDestinations = (me?.organizations ?? [])
    .filter((o) => o.permissions?.includes(OrganizationPermission.MANAGE_ORGANIZATION))
    .map((o) => ({
      type: 'organization',
      id: o.id,
      title: o.organization_name,
      subtitle: 'Organization donation page',
      coverImageUrl: o.cover_image,
    }))

  return {
    campaignDestinations,
    organizationDestinations,
    hasAnyDestination: campaignDestinations.length > 0 || organizationDestinations.length > 0,
    isLoading: campaignsQuery.isLoading,
  }
}
