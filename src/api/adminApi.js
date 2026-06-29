import { apiClient } from './client'

export const adminApi = {
  // Dashboard stats aggregation
  getDashboardStats: async () => {
    const [campaigns, donations, users] = await Promise.all([
      apiClient.get('/campaigns/admin/all/?limit=1').then(r => r.data),
      apiClient.get('/donations/admin/all/?limit=1').then(r => r.data),
      apiClient.get('/users/?limit=1').then(r => r.data),
    ])

    const totalRaised = donations.results?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

    return {
      campaigns_count: campaigns.count || 0,
      total_raised: totalRaised,
      users_count: users.count || 0,
      donations_count: donations.count || 0,
    }
  },

  // Reports with filtering and pagination
  getReports: (params = {}) =>
    apiClient.get('/campaigns/admin/reports/', { params }).then(r => r.data),

  // Get all dashboard data (stats + recent activity)
  getFullDashboard: async () => {
    const stats = await adminApi.getDashboardStats()
    const [campaigns, donations, reports, users] = await Promise.all([
      apiClient.get('/campaigns/admin/all/?limit=5&ordering=-created_at').then(r => r.data),
      apiClient.get('/donations/admin/all/?limit=5&ordering=-created_at').then(r => r.data),
      apiClient.get('/campaigns/admin/reports/?limit=5&ordering=-created_at').then(r => r.data),
      apiClient.get('/users/?limit=5&ordering=-created_at').then(r => r.data),
    ])

    return {
      stats,
      recentCampaigns: campaigns.results || [],
      recentDonations: donations.results || [],
      recentReports: reports.results || [],
      recentUsers: users.results || [],
    }
  },

  // Financial overview
  getFinancialOverview: async () => {
    const donations = await apiClient.get('/donations/admin/all/?limit=1000').then(r => r.data)
    const allDonations = donations.results || []

    const totalRaised = allDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const avgDonation = allDonations.length > 0 ? Math.round(totalRaised / allDonations.length) : 0

    // Get top campaigns for financial view
    const campaigns = await apiClient.get('/campaigns/admin/all/?limit=100').then(r => r.data)
    const topCampaigns = (campaigns.results || [])
      .filter(c => c.raised > 0)
      .sort((a, b) => (b.raised || 0) - (a.raised || 0))
      .slice(0, 4)

    return {
      total_donations: totalRaised,
      total_payouts: 0,
      platform_fees: 0,
      average_donation: avgDonation,
      top_campaigns: topCampaigns,
      all_donations: allDonations,
    }
  },
}
