import { useEffect } from 'react'
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

// Public campaign page donor list — visible to any visitor, not just the campaign owner.
export function useCampaignDonors(slug) {
  return useQuery({
    queryKey: queryKeys.donations.publicCampaign(slug),
    queryFn: () => donationApi.getPublicCampaignDonors(slug),
    select: (res) => ({ donations: res?.results ?? [], count: res?.count ?? 0 }),
    enabled: Boolean(slug),
  })
}

// Reconciles a donation directly with ModemPay when the donor lands back on
// the success page — the webhook can't reach a localhost backend at all, and
// this also covers a webhook that's simply late/missed in production.
export function useVerifyDonation(reference, slug) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['donations', 'verify', reference],
    queryFn: () => donationApi.verifyDonation(reference),
    enabled: Boolean(reference),
    retry: false,
    staleTime: 0,
  })

  // React Query v5 dropped per-query onSuccess — react to the resolved data instead.
  useEffect(() => {
    if (query.data && slug) {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(slug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.donations.publicCampaign(slug) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, slug])

  return query
}

export function useDonateToCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => donationApi.createDonation(data),
    onSuccess: (_, { campaign_id, slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all() })
      if (slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.donations.campaign(slug) })
        queryClient.invalidateQueries({ queryKey: queryKeys.donations.publicCampaign(slug) })
      }
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

export function useAdminUpdateDonation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => donationApi.adminUpdateDonation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.donations.adminAll() })
    },
  })
}

export function useAdminRefundDonation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }) => donationApi.adminRefundDonation(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.donations.adminAll() })
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all() })
    },
  })
}
