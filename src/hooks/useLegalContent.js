import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { settingsApi } from '@/api/settingsApi'

export function useLegalContent() {
  const query = useQuery({
    queryKey: queryKeys.legalContent.all(),
    queryFn: () => settingsApi.getLegalContent().then((r) => r.data),
  })
  return { content: query.data ?? null, isLoading: query.isLoading }
}

export function useUpdateLegalContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => settingsApi.updateLegalContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legalContent.all() })
    },
  })
}
