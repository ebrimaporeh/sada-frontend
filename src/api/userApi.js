import { apiClient } from './client'

export const userApi = {
  getMe: () => apiClient.get('/users/me/').then((r) => r.data),
  updateMe: (data) => apiClient.patch('/users/me/', data).then((r) => r.data),
  getUsers: (params) => apiClient.get('/users/', { params }).then((r) => r.data),
  getUser: (id) => apiClient.get(`/users/${id}/`).then((r) => r.data),
  updateUser: (id, data) => apiClient.patch(`/users/${id}/`, data).then((r) => r.data),
  deleteUser: (id) => apiClient.delete(`/users/${id}/`).then((r) => r.data),
}
