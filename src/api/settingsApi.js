import { apiClient } from '@/api/client'

export const settingsApi = {
  getSiteSettings: () => apiClient.get('/settings/').then((r) => r.data),
  updateSiteSettings: (data) => {
    const hasFile = Object.values(data).some((v) => v instanceof File)
    if (!hasFile) return apiClient.patch('/settings/', data).then((r) => r.data)

    const form = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, value)
    })
    return apiClient.patch('/settings/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  getLegalContent: () => apiClient.get('/settings/legal/').then((r) => r.data),
  updateLegalContent: (data) => apiClient.patch('/settings/legal/', data).then((r) => r.data),
}
