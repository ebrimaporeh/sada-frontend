import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { settingsApi } from '@/api/settingsApi'

export function useNotificationSettings() {
  const query = useQuery({
    queryKey: queryKeys.notificationSettings.all(),
    queryFn: () => settingsApi.getNotificationSettings().then((r) => r.data),
  })
  return { settings: query.data ?? null, isLoading: query.isLoading }
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => settingsApi.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationSettings.all() })
    },
  })
}
