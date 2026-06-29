import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { adminApi } from '@/api/adminApi'

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.admin?.stats?.() || ['admin', 'stats'],
    queryFn: adminApi.getDashboardStats,
  })
}

export function useFullDashboard() {
  return useQuery({
    queryKey: queryKeys.admin?.full?.() || ['admin', 'dashboard'],
    queryFn: adminApi.getFullDashboard,
  })
}

export function useAdminReports(params = {}) {
  return useQuery({
    queryKey: queryKeys.admin?.reports?.(params) || ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  })
}

export function useFinancialOverview() {
  return useQuery({
    queryKey: queryKeys.admin?.finances?.() || ['admin', 'finances'],
    queryFn: adminApi.getFinancialOverview,
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

export function useFinancesStats() {
  return useQuery({
    queryKey: ['admin', 'stats', 'finances'],
    queryFn: adminApi.getFinancesStats,
  })
}

export function useReportsStats() {
  return useQuery({
    queryKey: ['admin', 'stats', 'reports'],
    queryFn: adminApi.getReportsStats,
  })
}
