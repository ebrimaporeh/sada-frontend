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
