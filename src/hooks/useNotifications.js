import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { notificationApi } from '@/api/notificationApi'

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationApi.getNotifications(),
    select: (res) => ({ notifications: res?.results ?? [], count: res?.count ?? 0 }),
    refetchInterval: 30000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationApi.getUnreadCount,
    select: (res) => res?.data?.unread_count ?? 0,
    refetchInterval: 30000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}
