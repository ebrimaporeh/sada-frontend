import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { adminApi, analyticsApi } from '@/api/adminApi'

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

export function useAdminUpdateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => adminApi.updateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin?.reports?.() || ['admin', 'reports'] })
    },
  })
}
