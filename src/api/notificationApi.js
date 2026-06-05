import { apiClient } from './client'

export const notificationApi = {
  getNotifications: (params) =>
    apiClient.get('/notifications/', { params }).then((r) => r.data),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count/').then((r) => r.data),

  markRead: (id) =>
    apiClient.post(`/notifications/${id}/read/`).then((r) => r.data),

  markAllRead: () =>
    apiClient.post('/notifications/mark-all-read/').then((r) => r.data),
}
