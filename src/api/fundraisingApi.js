import { apiClient } from './client'

export const posterApi = {
  getMyPosters: (params) =>
    apiClient.get('/fundraising/posters/', { params }).then((r) => r.data),

  getPoster: (id) =>
    apiClient.get(`/fundraising/posters/${id}/`).then((r) => r.data),

  createPoster: (data) =>
    apiClient.post('/fundraising/posters/', data).then((r) => r.data),

  updatePoster: (id, data) =>
    apiClient.patch(`/fundraising/posters/${id}/`, data).then((r) => r.data),

  deletePoster: (id) =>
    apiClient.delete(`/fundraising/posters/${id}/`).then((r) => r.data),

  duplicatePoster: (id) =>
    apiClient.post(`/fundraising/posters/${id}/duplicate/`).then((r) => r.data),

  uploadPosterImage: (id, file) => {
    const form = new FormData()
    form.append('image', file)
    return apiClient
      .post(`/fundraising/posters/${id}/images/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
}

export const embedApi = {
  getMyEmbeds: (params) =>
    apiClient.get('/fundraising/embeds/', { params }).then((r) => r.data),

  getEmbed: (id) =>
    apiClient.get(`/fundraising/embeds/${id}/`).then((r) => r.data),

  // Public, unauthenticated -- backs the /embed/$id widget page. Uses the
  // same apiClient as everything else (it's same-origin to the backend, no
  // token attached since there's none to attach for an anonymous visitor).
  getPublicEmbed: (id) =>
    apiClient.get(`/fundraising/embeds/${id}/public/`).then((r) => r.data),

  createEmbed: (data) =>
    apiClient.post('/fundraising/embeds/', data).then((r) => r.data),

  updateEmbed: (id, data) =>
    apiClient.patch(`/fundraising/embeds/${id}/`, data).then((r) => r.data),

  deleteEmbed: (id) =>
    apiClient.delete(`/fundraising/embeds/${id}/`).then((r) => r.data),

  duplicateEmbed: (id) =>
    apiClient.post(`/fundraising/embeds/${id}/duplicate/`).then((r) => r.data),

  activateEmbed: (id) =>
    apiClient.post(`/fundraising/embeds/${id}/activate/`).then((r) => r.data),

  deactivateEmbed: (id) =>
    apiClient.post(`/fundraising/embeds/${id}/deactivate/`).then((r) => r.data),
}
