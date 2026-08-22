import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { auditApi } from '@/api/auditApi'

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn: () => auditApi.getAuditLogs(params),
    select: (res) => ({ logs: res?.results ?? [], count: res?.count ?? 0, totalPages: res?.total_pages ?? 1 }),
    placeholderData: (previousData) => previousData,
  })
}

export function useAuditActions() {
  return useQuery({
    queryKey: queryKeys.audit.actions(),
    queryFn: () => auditApi.getAuditActions(),
    select: (res) => res?.data?.actions ?? [],
    staleTime: Infinity, // a fixed enum, not something that changes at runtime
  })
}

export function useAuditActors() {
  return useQuery({
    queryKey: queryKeys.audit.actors(),
    queryFn: () => auditApi.getAuditActors(),
    select: (res) => res?.data?.actors ?? [],
  })
}
