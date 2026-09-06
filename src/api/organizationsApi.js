import { apiClient } from './client'

export const organizationsApi = {
  getTypes: () => apiClient.get('/organizations/types/').then((r) => r.data),

  create: (data) => apiClient.post('/organizations/', data).then((r) => r.data),
  getMine: () => apiClient.get('/organizations/mine/').then((r) => r.data),
  getDetail: (id) => apiClient.get(`/organizations/${id}/`).then((r) => r.data),
  updateDetail: (id, data) => apiClient.patch(`/organizations/${id}/`, data).then((r) => r.data),
  uploadCover: (id, file) => {
    const form = new FormData()
    form.append('cover_image', file)
    return apiClient
      .post(`/organizations/${id}/cover/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  transferOwnership: (id, userId) =>
    apiClient.post(`/organizations/${id}/transfer-ownership/`, { user_id: userId }).then((r) => r.data),

  // ── Public donation page (/give/<slug>) -- no auth, distinct from every
  // uuid-addressed endpoint above ─────────────────────────────────────────
  getPublicDonate: (slug) => apiClient.get(`/organizations/give/${slug}/`).then((r) => r.data),

  // ── Direct-donation dashboard (any current member can view) ─────────────
  getDonationStats: (id) => apiClient.get(`/organizations/${id}/donations/stats/`).then((r) => r.data),
  getDirectDonations: (id, params) => apiClient.get(`/organizations/${id}/donations/`, { params }).then((r) => r.data),

  getRoles: (id) => apiClient.get(`/organizations/${id}/roles/`).then((r) => r.data),
  createRole: (id, data) => apiClient.post(`/organizations/${id}/roles/`, data).then((r) => r.data),
  updateRole: (id, roleId, data) => apiClient.patch(`/organizations/${id}/roles/${roleId}/`, data).then((r) => r.data),
  deleteRole: (id, roleId) => apiClient.delete(`/organizations/${id}/roles/${roleId}/`).then((r) => r.data),

  getMembers: (id) => apiClient.get(`/organizations/${id}/members/`).then((r) => r.data),
  changeMemberRole: (id, userId, roleId) =>
    apiClient.patch(`/organizations/${id}/members/${userId}/`, { role_id: roleId }).then((r) => r.data),
  // Not exclusive -- any number of members can be flagged as a contact
  // person (see OrganizationMembership.is_contact_person on the backend).
  setContactPerson: (id, userId, isContactPerson) =>
    apiClient.patch(`/organizations/${id}/members/${userId}/`, { is_contact_person: isContactPerson }).then((r) => r.data),
  removeMember: (id, userId) => apiClient.delete(`/organizations/${id}/members/${userId}/`).then((r) => r.data),

  getInvitations: (id) => apiClient.get(`/organizations/${id}/invitations/`).then((r) => r.data),
  inviteMember: (id, email, roleId) =>
    apiClient.post(`/organizations/${id}/invitations/`, { email, role_id: roleId }).then((r) => r.data),
  cancelInvitation: (id, invitationId) =>
    apiClient.post(`/organizations/${id}/invitations/${invitationId}/cancel/`).then((r) => r.data),
  resendInvitation: (id, invitationId) =>
    apiClient.post(`/organizations/${id}/invitations/${invitationId}/resend/`).then((r) => r.data),

  getMyInvitations: () => apiClient.get('/organizations/invitations/mine/').then((r) => r.data),
  previewInvitation: (token) =>
    apiClient.get('/organizations/invitations/preview/', { params: { token } }).then((r) => r.data),
  acceptInvitation: (token) => apiClient.post('/organizations/invitations/accept/', { token }).then((r) => r.data),
  rejectInvitation: (token) => apiClient.post('/organizations/invitations/reject/', { token }).then((r) => r.data),

  // ── Admin -- not membership-gated, see AdminOrganizationListView ─────────
  getAdminList: (params) => apiClient.get('/organizations/admin/all/', { params }).then((r) => r.data),
  getAdminDetail: (id) => apiClient.get(`/organizations/admin/${id}/`).then((r) => r.data),
  getAdminMembers: (id) => apiClient.get(`/organizations/admin/${id}/members/`).then((r) => r.data),
}
