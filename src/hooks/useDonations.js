import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { donationApi } from '@/api/donationApi'

export function useMyDonations() {
  return useQuery({
    queryKey: queryKeys.donations.mine(),
    queryFn: () => donationApi.getMyDonations(),
    select: (res) => ({ donations: res?.results ?? [], count: res?.count ?? 0 }),
  })
}

export function useCampaignDonors(slug) {
  return useQuery({
    queryKey: queryKeys.donations.campaign(slug),
    queryFn: () => donationApi.getCampaignDonors(slug),
    select: (res) => ({ donations: res?.results ?? [], count: res?.count ?? 0 }),
    enabled: Boolean(slug),
  })
}

export function useDonateToCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => donationApi.createDonation(data),
    onSuccess: (_, { campaign_id, slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all() })
      if (slug) queryClient.invalidateQueries({ queryKey: queryKeys.donations.campaign(slug) })
    },
  })
}

export function useAdminDonations(params = {}) {
  return useQuery({
    queryKey: queryKeys.donations.adminList(params),
    queryFn: () => donationApi.getAdminDonations(params),
    select: (res) => ({ donations: res?.results ?? [], count: res?.count ?? 0, totalPages: res?.total_pages ?? 1 }),
  })
}
