import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { campaignApi } from '@/api/campaignApi'
import { donationApi } from '@/api/donationApi'
import { paymentApi } from '@/api/paymentApi'
import { useMe } from '@/hooks/useAuth'

// ── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  const query = useQuery({
    queryKey: queryKeys.campaigns.categories(),
    queryFn: campaignApi.getCategories,
    select: (res) => res?.data?.categories ?? [],
    staleTime: 1000 * 60 * 10,
  })
  return { categories: query.data ?? [], isLoading: query.isLoading }
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => campaignApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.categories() })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => campaignApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.categories() })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => campaignApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.categories() })
    },
  })
}

export function useUploadCategoryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }) => campaignApi.uploadCategoryImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.categories() })
    },
  })
}

export function usePublicStats() {
  const query = useQuery({
    queryKey: queryKeys.campaigns.publicStats(),
    queryFn: campaignApi.getPublicStats,
    select: (res) => res?.data,
    staleTime: 1000 * 60 * 5,
  })
  return { stats: query.data, isLoading: query.isLoading }
}

// ── Public campaign list ──────────────────────────────────────────────────────

export function useCampaigns(filters = {}) {
  const query = useQuery({
    queryKey: queryKeys.campaigns.list(filters),
    queryFn: () => campaignApi.getCampaigns(_toApiParams(filters)),
    select: (res) => ({
      campaigns: res?.results ?? [],
      count: res?.count ?? 0,
      totalPages: res?.total_pages ?? 1,
      page: res?.page ?? 1,
    }),
  })
  return {
    campaigns: query.data?.campaigns ?? [],
    count: query.data?.count ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    page: query.data?.page ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

function _toApiParams({ category, region, search, urgent, owner }) {
  const p = {}
  if (category && category !== 'all') p.category = category
  if (region) p.region = region
  if (search) p.search = search
  if (urgent) p.urgent = 'true'
  if (owner) p.owner = owner
  return p
}

// ── Public campaign detail ────────────────────────────────────────────────────

export function useCampaign(slug) {
  const query = useQuery({
    queryKey: queryKeys.campaigns.detail(slug),
    queryFn: () => campaignApi.getCampaign(slug),
    select: (res) => res?.data?.campaign ?? null,
    enabled: Boolean(slug),
  })
  return { campaign: query.data ?? null, isLoading: query.isLoading, isError: query.isError, error: query.error }
}

// Fire-and-forget view beacon — errors are swallowed since a dropped view
// count shouldn't ever surface to the visitor.
export function useRecordCampaignView() {
  return useMutation({
    mutationFn: (slug) => campaignApi.recordView(slug),
    onError: () => {},
  })
}

// ── Featured campaigns (home page) ───────────────────────────────────────────

export function useFeaturedCampaigns() {
  const query = useQuery({
    queryKey: queryKeys.campaigns.featured(),
    queryFn: campaignApi.getFeatured,
    select: (res) => res?.data?.campaigns ?? [],
    staleTime: 60_000,
  })
  return {
    campaigns: query.data ?? [],
    isLoading: query.isLoading,
  }
}

// Hero card (home page) — a single weighted-random pick from the backend
// (see campaign_service.get_hero_campaign), re-rolled per request rather
// than a fixed/curated list like useFeaturedCampaigns above. staleTime: 0
// so navigating back to the homepage re-rolls instead of showing a cached
// pick from earlier in the session.
export function useHeroCampaign() {
  const query = useQuery({
    queryKey: queryKeys.campaigns.hero(),
    queryFn: campaignApi.getHero,
    select: (res) => res?.data?.campaign ?? null,
    staleTime: 0,
  })
  return {
    campaign: query.data ?? null,
    isLoading: query.isLoading,
  }
}

// ── Filter state ─────────────────────────────────────────────────────────────

export function useCampaignFilters() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('')
  return { search, setSearch, category, setCategory, region, setRegion }
}

// ── Owner: my campaigns ───────────────────────────────────────────────────────

export function useMyMissions() {
  return useQuery({
    queryKey: queryKeys.campaigns.mine(),
    queryFn: campaignApi.getMyCampaigns,
    select: (res) => res?.data?.campaigns ?? [],
  })
}

// ── Owner: single campaign detail (manage page) ───────────────────────────────

export function useMyCampaign(slug) {
  const campaignQuery = useQuery({
    queryKey: queryKeys.campaigns.myDetail(slug),
    queryFn: () => campaignApi.getMyCampaign(slug),
    select: (res) => res?.data?.campaign ?? null,
    enabled: Boolean(slug),
  })

  const donorsQuery = useQuery({
    queryKey: queryKeys.donations.campaign(slug),
    queryFn: () => donationApi.getCampaignDonors(slug),
    select: (res) => res?.results ?? [],
    enabled: Boolean(slug),
  })

  const payoutsQuery = useQuery({
    queryKey: queryKeys.payments.payouts(slug),
    queryFn: () => paymentApi.getCampaignPayouts(slug),
    select: (res) => res?.data?.payouts ?? [],
    enabled: Boolean(slug),
  })

  const campaign = campaignQuery.data
  const donors = donorsQuery.data ?? []
  const payouts = payoutsQuery.data ?? []
  const totalPaidOut = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const availableBalance = campaign ? Number(campaign.raised ?? 0) - totalPaidOut : 0

  return {
    campaign,
    donors,
    payouts,
    totalPaidOut,
    availableBalance,
    isLoading: campaignQuery.isLoading,
    error: campaignQuery.error,
  }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => campaignApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.mine() })
    },
  })
}

export function useUpdateMyCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, ...data }) => campaignApi.updateMyCampaign(slug, data),
    onSuccess: (res, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.myDetail(slug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.mine() })
    },
  })
}

export function useUploadCampaignCover() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, file }) => campaignApi.uploadCover(slug, file),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.myDetail(slug) })
    },
  })
}

export function useUpdateCampaignMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, ...data }) => campaignApi.updateMedia(slug, data),
    onSuccess: (res, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.myDetail(slug) })
    },
  })
}

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, imageId }) => campaignApi.deleteGalleryImage(slug, imageId),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.myDetail(slug) })
    },
  })
}

export function useAddCampaignUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, ...data }) => campaignApi.addUpdate(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.myDetail(slug) })
    },
  })
}

export function useEditCampaignUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, updateId, data }) => campaignApi.editUpdate(slug, updateId, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.myDetail(slug) })
    },
  })
}

export function useDeleteCampaignUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, updateId }) => campaignApi.deleteUpdate(slug, updateId),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.myDetail(slug) })
    },
  })
}

export function useReportCampaign() {
  return useMutation({
    mutationFn: ({ slug, reason, description }) =>
      campaignApi.reportCampaign(slug, { reason, description }),
  })
}

export function useTogglePauseCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug) => campaignApi.togglePause(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.myDetail(slug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.mine() })
    },
  })
}

// Whether the signed-in user can perform `permission` on this specific
// campaign, independent of which profile is currently "active" in the
// switcher (see useActiveProfile's docstring for why those are deliberately
// separate) -- an individual campaign only ever grants its own owner, an
// org campaign checks the caller's real OrganizationMembership.permissions
// for that campaign's own organization_id, mirroring
// campaign_service.get_owner_campaign's Http404-vs-PermissionDenied split
// on the backend (this only answers "can they," it doesn't distinguish
// "can't see it" from "can see it, no permission" -- both render the same
// disabled/hidden UI here).
export function useCampaignPermission(campaign, permission) {
  const { data: me } = useMe()
  if (!campaign || !me) return false
  if (!campaign.organization_id) return campaign.owner_id === me.id
  const membership = (me.organizations ?? []).find((o) => o.id === campaign.organization_id)
  return Boolean(membership?.permissions?.includes(permission))
}

// ── Admin query ───────────────────────────────────────────────────────────────

export function useAdminCampaigns(params = {}) {
  return useQuery({
    queryKey: queryKeys.campaigns.adminList(params),
    queryFn: () => campaignApi.getAdminCampaigns(params),
    select: (res) => ({ campaigns: res?.results ?? [], count: res?.count ?? 0, totalPages: res?.total_pages ?? 1 }),
  })
}

// ── Admin mutations ───────────────────────────────────────────────────────────

export function useAdminCampaignAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action, reason, notes }) => campaignApi.campaignAction(id, action, { reason, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all() })
    },
  })
}

export function useAdminUpdateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => campaignApi.adminUpdateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all() })
    },
  })
}

export function useAdminChangeCampaignStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }) => campaignApi.adminChangeCampaignStatus(id, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all() })
    },
  })
}
