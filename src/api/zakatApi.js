import { apiClient } from '@/api/client'

export const zakatApi = {
  getSettings: () => apiClient.get('/zakat/settings/').then((r) => r.data),
  updateSettings: (data) => apiClient.patch('/zakat/settings/', data).then((r) => r.data),
  calculate: (data) => apiClient.post('/zakat/calculate/', data).then((r) => r.data),
  getRecommendedCampaigns: (limit = 10) =>
    apiClient.get('/zakat/recommended-campaigns/', { params: { limit } }).then((r) => r.data),
}
