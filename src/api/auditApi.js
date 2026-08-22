import { apiClient } from './client'

export const auditApi = {
  getAuditLogs: (params) =>
    apiClient.get('/audit/admin/', { params }).then((r) => r.data),

  getAuditActions: () =>
    apiClient.get('/audit/admin/actions/').then((r) => r.data),

  getAuditActors: () =>
    apiClient.get('/audit/admin/actors/').then((r) => r.data),
}
