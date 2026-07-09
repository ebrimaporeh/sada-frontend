import { apiClient } from './client'

export const donationApi = {
  createDonation: (data) =>
    apiClient.post('/donations/', data).then((r) => r.data),

  // Reconciles a donation directly against ModemPay — needed because the
  // webhook can't reach a localhost backend, and is a useful safety net even
  // when it can.
  verifyDonation: (reference) =>
    apiClient.get(`/donations/verify/${reference}/`).then((r) => r.data),

  getMyDonations: (params) =>
    apiClient.get('/donations/my/', { params }).then((r) => r.data),

  getCampaignDonors: (slug, params) =>
    apiClient.get(`/donations/campaign/${slug}/`, { params }).then((r) => r.data),

  getPublicCampaignDonors: (slug, params) =>
    apiClient.get(`/donations/campaign/${slug}/public/`, { params }).then((r) => r.data),

  getAdminDonations: (params) =>
    apiClient.get('/donations/admin/all/', { params }).then((r) => r.data),

  adminUpdateDonation: (id, data) =>
    apiClient.patch(`/donations/admin/${id}/update/`, data).then((r) => r.data),
}
