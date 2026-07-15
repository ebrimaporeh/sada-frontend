import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { zakatApi } from '@/api/zakatApi'

export function useZakatSettings() {
  const query = useQuery({
    queryKey: queryKeys.zakat.settings(),
    queryFn: () => zakatApi.getSettings().then((r) => r.data),
  })
  return { settings: query.data ?? null, isLoading: query.isLoading }
}

export function useUpdateZakatSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => zakatApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zakat.settings() })
    },
  })
}

export function useCalculateZakat() {
  return useMutation({
    mutationFn: (data) => zakatApi.calculate(data).then((r) => r.data),
  })
}

export function useRecommendedCampaigns(limit = 10, { enabled = true } = {}) {
  const query = useQuery({
    queryKey: queryKeys.zakat.recommendedCampaigns(limit),
    queryFn: () => zakatApi.getRecommendedCampaigns(limit).then((r) => r.data),
    enabled,
  })
  return { campaigns: query.data ?? [], isLoading: query.isLoading }
}
