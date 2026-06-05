import { apiClient } from './client'

export const paymentApi = {
  requestPayout: (data) =>
    apiClient.post('/payments/payouts/', data).then((r) => r.data),

  getCampaignPayouts: (slug) =>
    apiClient.get(`/payments/payouts/${slug}/`).then((r) => r.data),
}
