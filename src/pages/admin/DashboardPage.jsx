import { Link } from '@tanstack/react-router'
import {
  TrendingUp,
  Users,
  Flag,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { ROUTES } from '@/constants'
import { formatGMD, formatDate } from '@/utils/formatters'
import { useFullDashboard } from '@/hooks/useAdmin'
import { useAdminCampaigns } from '@/hooks/useCampaigns'
import { useAdminReports } from '@/hooks/useAdmin'
import { CAMPAIGN_STATUS } from '@/constants'

const quickActions = [
  {
    label: 'Manage Users',
    icon: Users,
    to: ROUTES.ADMIN_USERS,
    description: 'View and manage platform users',
  },
  {
    label: 'Review Campaigns',
    icon: CheckCircle,
    to: ROUTES.ADMIN_CAMPAIGNS,
    description: 'Approve or reject campaigns',
  },
  {
    label: 'Campaign Reports',
    icon: AlertCircle,
    to: '/admin/reports',
    description: 'Review flagged campaigns',
  },
  {
    label: 'Financial Overview',
    icon: BarChart3,
    to: '/admin/finances',
    description: 'View platform finances',
  },
  {
    label: 'Donations',
    icon: DollarSign,
    to: ROUTES.ADMIN_DONATIONS,
    description: 'Monitor donations',
  },
  {
    label: 'Platform Settings',
    icon: Settings,
    to: '/admin/settings',
    description: 'Configure platform settings',
  },
]

export function AdminDashboardPage() {
  const { data: dashboardData, isLoading } = useFullDashboard()
  const { data: campaignsData } = useAdminCampaigns()
  const { data: reportsData } = useAdminReports({ limit: 5 })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const stats = dashboardData?.stats || { campaigns_count: 0, total_raised: 0, users_count: 0, donations_count: 0 }
  const recentActivities = []

  // Build recent activities from actual data
  if (dashboardData?.recentCampaigns?.length > 0) {
    dashboardData.recentCampaigns.forEach((c) => {
      recentActivities.push({
        type: 'campaign_created',
        description: `New campaign "${c.title}" created`,
        time: formatDate(c.created_at),
        icon: Flag,
        color: 'text-blue-600',
      })
    })
  }

  if (dashboardData?.recentDonations?.length > 0) {
    dashboardData.recentDonations.forEach((d) => {
      const donor = d.is_anonymous ? 'Anonymous' : d.donor_name || 'Donor'
      recentActivities.push({
        type: 'donation',
        description: `${formatGMD(d.amount)} donated to "${d.campaign_title}"`,
        time: formatDate(d.created_at),
        icon: DollarSign,
        color: 'text-green-600',
      })
    })
  }

  if (dashboardData?.recentReports?.length > 0) {
    dashboardData.recentReports.forEach((r) => {
      recentActivities.push({
        type: 'report_filed',
        description: `Report filed for "${r.campaign?.title}"`,
        time: formatDate(r.created_at),
        icon: AlertCircle,
        color: 'text-red-600',
      })
    })
  }

  if (dashboardData?.recentUsers?.length > 0) {
    recentActivities.push({
      type: 'user_registered',
      description: `${dashboardData.recentUsers.length} new users registered`,
      time: formatDate(dashboardData.recentUsers[0]?.created_at),
      icon: Users,
      color: 'text-purple-600',
    })
  }

  // Sort by date, most recent first
  recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time))

  const statCards = [
    {
      label: 'Total Campaigns',
      value: stats.campaigns_count?.toString() || '0',
      change: campaignsData?.campaigns?.filter((c) => c.status === CAMPAIGN_STATUS.ACTIVE).length || 0,
      changeLabel: 'active',
      icon: Flag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Raised',
      value: formatGMD(stats.total_raised || 0),
      change: stats.donations_count || 0,
      changeLabel: 'donations',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Active Users',
      value: stats.users_count?.toString() || '0',
      change: '+0 this month',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Donations',
      value: stats.donations_count?.toString() || '0',
      change: `${stats.donations_count || 0} total`,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ]

  const pendingReports = reportsData?.results?.filter((r) => r.status === 'pending').length || 0
  const pendingCampaigns = campaignsData?.campaigns?.filter((c) => c.status === CAMPAIGN_STATUS.PENDING).length || 0
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, change, changeLabel, icon: Icon, color, bgColor }) => (
          <div key={label} className="border rounded-xl p-5 bg-card space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
              <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{changeLabel}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickActions.map(({ label, icon: Icon, to, description }) => (
              <Link
                key={label}
                to={to}
                className="border rounded-xl p-4 hover:shadow-md transition-all hover:border-primary/50 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  {label === 'Manage Users' && (
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {stats.users_count || 0}
                    </span>
                  )}
                  {label === 'Review Campaigns' && pendingCampaigns > 0 && (
                    <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      {pendingCampaigns} pending
                    </span>
                  )}
                  {label === 'Campaign Reports' && pendingReports > 0 && (
                    <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      {pendingReports} pending
                    </span>
                  )}
                </div>
                <p className="font-semibold text-sm mb-1">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="border rounded-xl p-5 bg-card space-y-4 h-fit">
          <h2 className="text-lg font-bold">Key Metrics</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Pending Actions</p>
                <p className="text-sm font-bold text-primary">{pendingCampaigns + pendingReports}</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary rounded-full h-2" style={{ width: `${Math.min((pendingCampaigns + pendingReports) * 10, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Total Donations</p>
                <p className="text-sm font-bold text-primary">{stats.donations_count || 0}</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary rounded-full h-2" style={{ width: `${Math.min((stats.donations_count || 0) * 2, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Platform Users</p>
                <p className="text-sm font-bold text-green-600">{stats.users_count || 0}</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-600 rounded-full h-2" style={{ width: `${Math.min((stats.users_count || 0) / 10, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="border rounded-xl p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Platform Activities
          </h2>
        </div>
        {recentActivities.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No recent activities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
