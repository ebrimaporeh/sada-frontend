import { apiClient } from './client'

export const donationApi = {
  createDonation: (data) =>
    apiClient.post('/donations/', data).then((r) => r.data),

  getMyDonations: (params) =>
    apiClient.get('/donations/my/', { params }).then((r) => r.data),

  getCampaignDonors: (slug, params) =>
    apiClient.get(`/donations/campaign/${slug}/`, { params }).then((r) => r.data),

  getAdminDonations: (params) =>
    apiClient.get('/donations/admin/all/', { params }).then((r) => r.data),
}
