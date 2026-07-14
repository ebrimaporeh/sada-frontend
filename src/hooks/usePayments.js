import { useState, useEffect } from 'react'
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
    select: (res) => res?.data ?? { platform_fee_percent: '1.00' },
  })
}

// Debounced so typing a withdrawal amount doesn't fire a request (and a real
// ModemPay fee-check call) on every keystroke.
export function usePayoutFeePreview(amount, provider) {
  const [debouncedAmount, setDebouncedAmount] = useState(amount)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedAmount(amount), 400)
    return () => clearTimeout(timer)
  }, [amount])

  const query = useQuery({
    queryKey: queryKeys.payments.feePreview(debouncedAmount, provider),
    queryFn: () => paymentApi.previewPayoutFee({ amount: debouncedAmount, provider }),
    select: (res) => res?.data ?? null,
    enabled: Boolean(debouncedAmount) && debouncedAmount > 0 && Boolean(provider),
    retry: false,
    staleTime: 1000 * 10,
  })

  return {
    preview: query.data ?? null,
    isLoading: query.isLoading || debouncedAmount !== amount,
    isError: query.isError,
  }
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
