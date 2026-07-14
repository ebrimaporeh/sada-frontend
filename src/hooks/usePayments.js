import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { paymentApi } from '@/api/paymentApi'

export function useCampaignPayouts(slug) {
  return useQuery({
    queryKey: queryKeys.payments.payouts(slug),
    queryFn: () => paymentApi.getCampaignPayouts(slug),
    select: (res) => res?.data?.payouts ?? [],
    enabled: Boolean(slug),
  })
}

export function useRequestPayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => paymentApi.requestPayout(data),
    onSuccess: (_, { slug }) => {
      if (slug) queryClient.invalidateQueries({ queryKey: queryKeys.payments.payouts(slug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.mine() })
    },
  })
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: queryKeys.payments.settings(),
    queryFn: () => paymentApi.getPlatformSettings(),
    select: (res) => res?.data ?? { platform_fee_percent: '1.00', card_payments_enabled: false },
  })
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => paymentApi.updatePlatformSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.settings() })
    },
  })
}
