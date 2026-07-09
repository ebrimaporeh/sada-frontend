import { apiClient } from './client'

export const campaignApi = {
  // ── Public ───────────────────────────────────────────────────────────────
  getCategories: () =>
    apiClient.get('/campaigns/categories/').then((r) => r.data),

  getCampaigns: (params) =>
    apiClient.get('/campaigns/', { params }).then((r) => r.data),

  getFeatured: () =>
    apiClient.get('/campaigns/featured/').then((r) => r.data),

  getCampaign: (slug) =>
    apiClient.get(`/campaigns/${slug}/`).then((r) => r.data),

  // ── Owner ────────────────────────────────────────────────────────────────
  createCampaign: (data) =>
    apiClient.post('/campaigns/create/', data).then((r) => r.data),

  getMyCampaigns: () =>
    apiClient.get('/campaigns/my/').then((r) => r.data),

  getMyCampaign: (slug) =>
    apiClient.get(`/campaigns/my/${slug}/`).then((r) => r.data),

  updateMyCampaign: (slug, data) =>
    apiClient.patch(`/campaigns/my/${slug}/`, data).then((r) => r.data),

  deleteMyCampaign: (slug) =>
    apiClient.delete(`/campaigns/my/${slug}/`).then((r) => r.data),

  uploadCover: (slug, file) => {
    const form = new FormData()
    form.append('cover_image', file)
    return apiClient
      .post(`/campaigns/my/${slug}/cover/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  updateMedia: (slug, { cover, gallery }) => {
    const form = new FormData()
    if (cover) form.append('cover', cover)
    if (gallery?.length) gallery.forEach((f) => form.append('gallery', f))
    return apiClient
      .post(`/campaigns/my/${slug}/media/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  deleteGalleryImage: (slug, imageId) =>
    apiClient.delete(`/campaigns/my/${slug}/media/${imageId}/`).then((r) => r.data),

  addUpdate: (slug, { data }) =>
    apiClient.post(`/campaigns/my/${slug}/updates/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  editUpdate: (slug, updateId, data) =>
    apiClient.patch(`/campaigns/my/${slug}/updates/${updateId}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  deleteUpdate: (slug, updateId) =>
    apiClient.delete(`/campaigns/my/${slug}/updates/${updateId}/`).then((r) => r.data),

  reportCampaign: (slug, data) =>
    apiClient.post(`/campaigns/${slug}/report/`, data).then((r) => r.data),

  togglePause: (slug) =>
    apiClient.post(`/campaigns/my/${slug}/pause/`).then((r) => r.data),

  // ── Admin ────────────────────────────────────────────────────────────────
  getAdminCampaigns: (params) =>
    apiClient.get('/campaigns/admin/all/', { params }).then((r) => r.data),

  getAdminCampaignDetail: (id) =>
    apiClient.get(`/campaigns/admin/${id}/`).then((r) => r.data),

  campaignAction: (id, action, data = {}) =>
    apiClient.post(`/campaigns/admin/${id}/action/${action}/`, data).then((r) => r.data),

  adminUpdateCampaign: (id, data) =>
    apiClient.patch(`/campaigns/admin/${id}/update/`, data).then((r) => r.data),

  adminChangeCampaignStatus: (id, data) =>
    apiClient.post(`/campaigns/admin/${id}/status-change/`, data).then((r) => r.data),
}
