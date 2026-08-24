import { apiClient } from './client'

export const permissionsApi = {
  getRolePermissions: () =>
    apiClient.get('/permissions/roles/').then((r) => r.data),

  updateRolePermissions: (role, resources) =>
    apiClient.patch(`/permissions/roles/${role}/`, { resources }).then((r) => r.data),

  createRole: (name, resources) =>
    apiClient.post('/permissions/roles/', { name, resources }).then((r) => r.data),

  deleteRole: (role) =>
    apiClient.delete(`/permissions/roles/${role}/`).then((r) => r.data),
}
