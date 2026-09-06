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

// Public campaign page donor list — visible to any visitor, not just the
// campaign owner. 20 donors per page (the backend default), sorted by
// latest (default) or highest amount.
export function useCampaignDonors(slug, { page = 1, sort = 'latest' } = {}) {
  return useQuery({
    queryKey: queryKeys.donations.publicCampaign(slug, { page, sort }),
    queryFn: () => donationApi.getPublicCampaignDonors(slug, { page, sort }),
    select: (res) => ({
      donations: res?.results ?? [],
      count: res?.count ?? 0,
      totalPages: res?.total_pages ?? 1,
      hasNext: Boolean(res?.next),
      hasPrevious: Boolean(res?.previous),
    }),
    enabled: Boolean(slug),
    placeholderData: (previousData) => previousData,
  })
}

// Owner's own campaign donor list -- unlike useCampaignDonors above, scoped
// to campaigns the current user owns (returns full donor detail, not the
// anonymized public projection). 20 donors per page (the backend default).
export function useMyCampaignDonors(slug, { page = 1 } = {}) {
  return useQuery({
    queryKey: queryKeys.donations.campaignPaginated(slug, { page }),
    queryFn: () => donationApi.getCampaignDonors(slug, { page }),
    select: (res) => ({
      donations: res?.results ?? [],
      count: res?.count ?? 0,
      totalPages: res?.total_pages ?? 1,
      hasNext: Boolean(res?.next),
      hasPrevious: Boolean(res?.previous),
    }),
    enabled: Boolean(slug),
    placeholderData: (previousData) => previousData,
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

// Organization-donation counterpart to useVerifyDonation above -- same
// reconciliation call, different cache keys invalidated on success (the
// org's donation-stats/direct-donations queries instead of a campaign's).
export function useVerifyOrganizationDonation(reference, organizationId) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['donations', 'verify', reference],
    queryFn: () => donationApi.verifyDonation(reference),
    enabled: Boolean(reference),
    retry: false,
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data && organizationId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.donationStats(organizationId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.directDonations(organizationId) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, organizationId])

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

// Direct donation to an organization -- same createDonation call as
// useDonateToCampaign (the backend distinguishes by campaign_id vs
// organization_id in the payload, see apps/donations/serializers.py), just
// invalidating organization-scoped query keys instead of campaign ones.
export function useDonateToOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => donationApi.createDonation(data),
    onSuccess: (_, { organization_id }) => {
      if (organization_id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.donationStats(organization_id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.directDonations(organization_id) })
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
