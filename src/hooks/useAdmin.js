import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { adminApi, analyticsApi } from '@/api/adminApi'
import { userApi } from '@/api/userApi'

export function useAdminReports(params = {}) {
  return useQuery({
    queryKey: queryKeys.admin?.reports?.(params) || ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  })
}

// period: 'week' | 'month' | 'year' | 'custom'. startDate/endDate only required for 'custom'.
export function useFinanceSummary(period, startDate, endDate, limit = 10) {
  const isCustom = period === 'custom'
  return useQuery({
    queryKey: queryKeys.admin.financeSummary({ period, startDate, endDate, limit }),
    queryFn: () => analyticsApi.getFinanceSummary(period, startDate, endDate, limit),
    enabled: !isCustom || Boolean(startDate && endDate),
  })
}

// Separate stats hooks for individual pages
export function useUsersStats() {
  return useQuery({
    queryKey: ['admin', 'stats', 'users'],
    queryFn: adminApi.getUsersStats,
  })
}

export function useCampaignsStats() {
  return useQuery({
    queryKey: ['admin', 'stats', 'campaigns'],
    queryFn: adminApi.getCampaignsStats,
  })
}

export function useDonationsStats() {
  return useQuery({
    queryKey: ['admin', 'stats', 'donations'],
    queryFn: adminApi.getDonationsStats,
  })
}

export function useReportsStats() {
  return useQuery({
    queryKey: ['admin', 'stats', 'reports'],
    queryFn: adminApi.getReportsStats,
  })
}

// Sidebar nav badge counts — pending (not yet resolved/reviewed) reports and
// verifications. Polled like the notification bell's unread count so the
// badge stays live without a manual refresh. `enabled` should be gated on
// the viewer actually having Resource.REPORTS/VERIFICATIONS access (see
// src/utils/permissions.js) so a role without that access — e.g. Finance
// Officer — never fires these requests.
export function useAdminBadgeCounts({ enabled = true } = {}) {
  const reportsQuery = useQuery({
    queryKey: ['admin', 'badge-counts', 'reports'],
    queryFn: adminApi.getReportsStats,
    select: (data) => data?.pending_reports ?? 0,
    refetchInterval: 30000,
    enabled,
  })
  const verificationsQuery = useQuery({
    queryKey: ['admin', 'badge-counts', 'verifications'],
    queryFn: () => userApi.getVerifications({ status: 'pending', page_size: 1 }),
    select: (data) => data?.count ?? 0,
    refetchInterval: 30000,
    enabled,
  })
  const organizationVerificationsQuery = useQuery({
    queryKey: ['admin', 'badge-counts', 'organization-verifications'],
    queryFn: () => userApi.getOrganizationVerifications({ status: 'pending', page_size: 1 }),
    select: (data) => data?.count ?? 0,
    refetchInterval: 30000,
    enabled,
  })
  const organizationChangeRequestsQuery = useQuery({
    queryKey: ['admin', 'badge-counts', 'organization-change-requests'],
    queryFn: () => userApi.getOrganizationChangeRequests({ status: 'pending', page_size: 1 }),
    select: (data) => data?.count ?? 0,
    refetchInterval: 30000,
    enabled,
  })
  return {
    pendingReports: reportsQuery.data ?? 0,
    pendingVerifications: (verificationsQuery.data ?? 0) + (organizationVerificationsQuery.data ?? 0) + (organizationChangeRequestsQuery.data ?? 0),
  }
}

export function useAdminUpdateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => adminApi.updateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin?.reports?.() || ['admin', 'reports'] })
    },
  })
}
