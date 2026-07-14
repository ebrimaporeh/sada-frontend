import { apiClient } from './client'

export const paymentApi = {
  requestPayout: (data) =>
    apiClient.post('/payments/payouts/', data).then((r) => r.data),

  getCampaignPayouts: (slug) =>
    apiClient.get(`/payments/payouts/${slug}/`).then((r) => r.data),

  previewPayoutFee: (params) =>
    apiClient.get('/payments/payouts/fee-preview/', { params }).then((r) => r.data),

  getPlatformSettings: () =>
    apiClient.get('/payments/settings/').then((r) => r.data),

  updatePlatformSettings: (data) =>
    apiClient.patch('/payments/settings/', data).then((r) => r.data),
}
