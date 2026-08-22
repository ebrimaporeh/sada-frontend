import { apiClient } from './client'

export const paymentApi = {
  getGateways: () =>
    apiClient.get('/payments/gateways/').then((r) => r.data),

  requestPayout: (data) =>
    apiClient.post('/payments/payouts/', data).then((r) => r.data),

  getCampaignPayouts: (slug) =>
    apiClient.get(`/payments/payouts/${slug}/`).then((r) => r.data),

  getAdminCampaignPayouts: (campaignId) =>
    apiClient.get(`/payments/admin/campaign/${campaignId}/payouts/`).then((r) => r.data),

  getAdminOwnerPayouts: (ownerId) =>
    apiClient.get(`/payments/admin/campaigner/${ownerId}/payouts/`).then((r) => r.data),

  previewPayoutFee: (params) =>
    apiClient.get('/payments/payouts/fee-preview/', { params }).then((r) => r.data),

  getPlatformSettings: () =>
    apiClient.get('/payments/settings/').then((r) => r.data),

  updatePlatformSettings: (data) =>
    apiClient.patch('/payments/settings/', data).then((r) => r.data),
}
