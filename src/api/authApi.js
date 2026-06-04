import { apiClient } from './client'

export const authApi = {
  register: (data) => apiClient.post('/auth/register/', data).then((r) => r.data),
  login: (data) => apiClient.post('/auth/login/', data).then((r) => r.data),
  logout: (refresh) => apiClient.post('/auth/logout/', { refresh }).then((r) => r.data),
  refresh: (refresh) => apiClient.post('/auth/refresh/', { refresh }).then((r) => r.data),
  changePassword: (data) => apiClient.post('/auth/change-password/', data).then((r) => r.data),
  verifyEmail: (token) => apiClient.post('/auth/verify-email/', { token }).then((r) => r.data),
  requestPasswordReset: (email) =>
    apiClient.post('/auth/password-reset/', { email }).then((r) => r.data),
  confirmPasswordReset: (data) =>
    apiClient.post('/auth/password-reset/confirm/', data).then((r) => r.data),
}
