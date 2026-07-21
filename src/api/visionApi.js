import { apiClient } from '@/api/client'

export const visionApi = {
  getTopics: () => apiClient.get('/vision/').then((r) => r.data),
  getTopic: (slug) => apiClient.get(`/vision/${slug}/`).then((r) => r.data),

  getAdminTopics: () => apiClient.get('/vision/admin/').then((r) => r.data),
  getAdminTopic: (slug) => apiClient.get(`/vision/admin/${slug}/`).then((r) => r.data),
  createTopic: (data) => apiClient.post('/vision/admin/', data).then((r) => r.data),
  updateTopic: (slug, data) => apiClient.patch(`/vision/admin/${slug}/`, data).then((r) => r.data),
  deleteTopic: (slug) => apiClient.delete(`/vision/admin/${slug}/`).then((r) => r.data),
}
