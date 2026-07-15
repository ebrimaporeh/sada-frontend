import { apiClient } from './client'

export const userApi = {
  getMe: () => apiClient.get('/users/me/').then((r) => r.data),
  updateMe: (data) => apiClient.patch('/users/me/', data).then((r) => r.data),
  getUsers: (params) => apiClient.get('/users/', { params }).then((r) => r.data),
  getUser: (id) => apiClient.get(`/users/${id}/`).then((r) => r.data),
  updateUser: (id, data) => apiClient.patch(`/users/${id}/`, data).then((r) => r.data),
  deleteUser: (id) => apiClient.delete(`/users/${id}/`).then((r) => r.data),
  adminCreateUser: (data) => apiClient.post('/users/admin/create/', data).then((r) => r.data),
  getStaff: (params) => apiClient.get('/users/admin/staff/', { params }).then((r) => r.data),
  changeStaffRole: (id, role) => apiClient.post(`/users/admin/staff/${id}/role/`, { role }).then((r) => r.data),

  getMyVerification: () => apiClient.get('/users/verification/me/').then((r) => r.data),
  submitVerification: (data) => {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v)
    })
    return apiClient.post('/users/verification/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
  getVerifications: (params) => apiClient.get('/users/admin/verifications/', { params }).then((r) => r.data),
  reviewVerification: (id, action, reason) =>
    apiClient.post(`/users/admin/verifications/${id}/${action}/`, reason ? { reason } : {}).then((r) => r.data),

  getMyOrganizationVerification: () => apiClient.get('/users/organization-verification/me/').then((r) => r.data),
  submitOrganizationVerification: (data) => {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v)
    })
    return apiClient.post('/users/organization-verification/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
  getOrganizationVerifications: (params) => apiClient.get('/users/admin/organization-verifications/', { params }).then((r) => r.data),
  reviewOrganizationVerification: (id, action, reason) =>
    apiClient.post(`/users/admin/organization-verifications/${id}/${action}/`, reason ? { reason } : {}).then((r) => r.data),

  getMyOrganizationChangeRequests: () => apiClient.get('/users/organization-change-requests/mine/').then((r) => r.data),
  submitOrganizationChangeRequest: (data) => apiClient.post('/users/organization-change-requests/', data).then((r) => r.data),
  getOrganizationChangeRequests: (params) => apiClient.get('/users/admin/organization-change-requests/', { params }).then((r) => r.data),
  reviewOrganizationChangeRequest: (id, action, reason) =>
    apiClient.post(`/users/admin/organization-change-requests/${id}/${action}/`, reason ? { reason } : {}).then((r) => r.data),

  getCampaigners: (params) => apiClient.get('/users/campaigners/', { params }).then((r) => r.data),
  getCampaigner: (id) => apiClient.get(`/users/campaigners/${id}/`).then((r) => r.data),
}
