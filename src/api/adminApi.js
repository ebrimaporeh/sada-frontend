import { apiClient } from './client'

export const adminApi = {
  // Dashboard stats aggregation
  getDashboardStats: async () => {
    try {
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
    } catch (error) {
      return {
        campaigns_count: 0,
        total_raised: 0,
        users_count: 0,
        donations_count: 0,
      }
    }
  },

  // Stats by page
  getUsersStats: async () => {
    try {
      const users = await apiClient.get('/users/?limit=1').then(r => r.data)
      return { total_users: users.count || 0 }
    } catch {
      return { total_users: 0 }
    }
  },

  getCampaignsStats: async () => {
    try {
      const campaigns = await apiClient.get('/campaigns/admin/all/?limit=1').then(r => r.data)
      const allCampaigns = campaigns.results || []
      return {
        total_campaigns: campaigns.count || 0,
        active_campaigns: allCampaigns.filter(c => c.status === 'active').length,
        pending_campaigns: allCampaigns.filter(c => c.status === 'pending').length,
        completed_campaigns: allCampaigns.filter(c => c.status === 'completed').length,
      }
    } catch {
      return { total_campaigns: 0, active_campaigns: 0, pending_campaigns: 0, completed_campaigns: 0 }
    }
  },

  getDonationsStats: async () => {
    try {
      const donations = await apiClient.get('/donations/admin/all/?limit=1000').then(r => r.data)
      const allDonations = donations.results || []
      const totalRaised = allDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
      const avgDonation = allDonations.length > 0 ? Math.round(totalRaised / allDonations.length) : 0
      return {
        total_donations: donations.count || 0,
        total_raised: totalRaised,
        average_donation: avgDonation,
        anonymous_count: allDonations.filter(d => d.is_anonymous).length,
      }
    } catch {
      return { total_donations: 0, total_raised: 0, average_donation: 0, anonymous_count: 0 }
    }
  },

  getFinancesStats: async () => {
    try {
      const donations = await apiClient.get('/donations/admin/all/?limit=1000').then(r => r.data)
      const allDonations = donations.results || []
      const totalRaised = allDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
      const avgDonation = allDonations.length > 0 ? Math.round(totalRaised / allDonations.length) : 0
      return {
        total_donations: totalRaised,
        total_payouts: 0,
        platform_fees: 0,
        average_donation: avgDonation,
      }
    } catch {
      return { total_donations: 0, total_payouts: 0, platform_fees: 0, average_donation: 0 }
    }
  },

  getReportsStats: async () => {
    try {
      const reports = await apiClient.get('/campaigns/admin/reports/?limit=1').then(r => r.data)
      return {
        total_reports: reports.count || 0,
        pending_reports: reports.results?.filter(r => r.status === 'pending').length || 0,
        investigating_reports: reports.results?.filter(r => r.status === 'investigating').length || 0,
        resolved_reports: reports.results?.filter(r => r.status === 'resolved').length || 0,
      }
    } catch {
      return { total_reports: 0, pending_reports: 0, investigating_reports: 0, resolved_reports: 0 }
    }
  },

  // Reports with filtering and pagination
  getReports: (params = {}) =>
    apiClient.get('/campaigns/admin/reports/', { params }).then(r => r.data),

  // Get all dashboard data (stats + recent activity)
  getFullDashboard: async () => {
    try {
      const stats = await adminApi.getDashboardStats()
      const results = await Promise.allSettled([
        apiClient.get('/campaigns/admin/all/?limit=5&ordering=-created_at').then(r => r.data),
        apiClient.get('/donations/admin/all/?limit=5&ordering=-created_at').then(r => r.data),
        apiClient.get('/campaigns/admin/reports/?limit=5&ordering=-created_at').then(r => r.data),
        apiClient.get('/users/?limit=5&ordering=-created_at').then(r => r.data),
      ])

      return {
        stats,
        recentCampaigns: results[0].status === 'fulfilled' ? results[0].value.results || [] : [],
        recentDonations: results[1].status === 'fulfilled' ? results[1].value.results || [] : [],
        recentReports: results[2].status === 'fulfilled' ? results[2].value.results || [] : [],
        recentUsers: results[3].status === 'fulfilled' ? results[3].value.results || [] : [],
      }
    } catch (error) {
      return {
        stats: { campaigns_count: 0, total_raised: 0, users_count: 0, donations_count: 0 },
        recentCampaigns: [],
        recentDonations: [],
        recentReports: [],
        recentUsers: [],
      }
    }
  },

  // Financial overview
  getFinancialOverview: async () => {
    try {
      const results = await Promise.allSettled([
        apiClient.get('/donations/admin/all/?limit=1000').then(r => r.data),
        apiClient.get('/campaigns/admin/all/?limit=100').then(r => r.data),
      ])

      const allDonations = results[0].status === 'fulfilled' ? results[0].value.results || [] : []
      const allCampaigns = results[1].status === 'fulfilled' ? results[1].value.results || [] : []

      const totalRaised = allDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
      const avgDonation = allDonations.length > 0 ? Math.round(totalRaised / allDonations.length) : 0

      const topCampaigns = allCampaigns
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
    } catch (error) {
      return {
        total_donations: 0,
        total_payouts: 0,
        platform_fees: 0,
        average_donation: 0,
        top_campaigns: [],
        all_donations: [],
      }
    }
  },
}
