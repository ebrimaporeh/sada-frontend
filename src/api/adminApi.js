import { apiClient } from './client'

// Analytics endpoints for efficient data fetching
const analyticsApi = {
  getStats: (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/analytics/stats/?${params}`).then(r => r.data)
  },

  getDonationsByDay: (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/analytics/donations-by-day/?${params}`).then(r => r.data)
  },

  getCampaignStatus: (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/analytics/campaign-status/?${params}`).then(r => r.data)
  },

  getTopCampaigns: (startDate, endDate, limit = 5) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    params.append('limit', limit)
    return apiClient.get(`/analytics/top-campaigns/?${params}`).then(r => r.data)
  },

  getTopDonors: (startDate, endDate, limit = 5) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    params.append('limit', limit)
    return apiClient.get(`/analytics/top-donors/?${params}`).then(r => r.data)
  },

  getRecentDonations: (startDate, endDate, limit = 10) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    params.append('limit', limit)
    return apiClient.get(`/analytics/recent-donations/?${params}`).then(r => r.data)
  },

  // period: 'week' | 'month' | 'year' | 'custom'. startDate/endDate only used for 'custom'.
  getFinanceSummary: (period, startDate, endDate, limit = 10) => {
    const params = new URLSearchParams()
    if (period) params.append('period', period)
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    params.append('limit', limit)
    return apiClient.get(`/analytics/finance-summary/?${params}`).then(r => r.data)
  },
}

export const adminApi = {
  // Stats — computed server-side, one lightweight call per page, independent of list pagination.
  getUsersStats: () => apiClient.get('/users/stats/').then(r => r.data.data),
  getCampaignsStats: () => apiClient.get('/campaigns/admin/stats/').then(r => r.data.data),
  getDonationsStats: () => apiClient.get('/donations/admin/stats/').then(r => r.data.data),
  getReportsStats: () => apiClient.get('/campaigns/admin/reports/stats/').then(r => r.data.data),

  // Reports with filtering and pagination
  getReports: (params = {}) =>
    apiClient.get('/campaigns/admin/reports/', { params }).then(r => r.data),

  getReportedCampaigns: () =>
    apiClient.get('/campaigns/admin/reports/campaigns/').then(r => r.data),
}

export { analyticsApi }

