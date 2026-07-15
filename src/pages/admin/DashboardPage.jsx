import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Megaphone,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Activity,
  Calendar,
  Loader2,
} from 'lucide-react'
import { ROUTES } from '@/constants'
import { formatGMD, formatDate } from '@/utils/formatters'
import { analyticsApi } from '@/api/adminApi'
import { DatePicker } from '@/components/custom/DatePicker'

const quickActions = [
  { label: 'Campaigns', icon: Megaphone, to: ROUTES.ADMIN_CAMPAIGNS, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Users', icon: Users, to: ROUTES.ADMIN_USERS, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Donations', icon: DollarSign, to: ROUTES.ADMIN_DONATIONS, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Reports', icon: AlertCircle, to: '/admin/reports', color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Categories', icon: CheckCircle, to: '/admin/categories', color: 'text-amber-600', bg: 'bg-amber-50' },
]

const DATE_RANGES = [
  { label: 'Last 7 Days', value: 'week', days: 7 },
  { label: 'Last 30 Days', value: 'month', days: 30 },
  { label: 'Last 90 Days', value: 'year', days: 90 },
  { label: 'All Time', value: 'all', days: null },
]

function DateRangeSelector({ selectedRange, customRange, onRangeChange, onCustomDate }) {
  const isCustomActive = Boolean(customRange)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-2">
        {DATE_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => onRangeChange(range)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !isCustomActive && selectedRange?.value === range.value
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-accent'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      <button
        onClick={onCustomDate}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isCustomActive
            ? 'bg-primary text-primary-foreground'
            : 'border hover:bg-accent'
        }`}
      >
        <Calendar className="w-4 h-4" />
        {isCustomActive ? `${formatDate(customRange.start)} – ${formatDate(customRange.end)}` : 'Custom'}
      </button>
    </div>
  )
}

function CustomDateModal({ isOpen, onClose, onApply }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Select Date Range</h3>
        <div className="space-y-3">
          <div className="border rounded-lg p-3 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <DatePicker
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || new Date()}
              placeholder="Start date"
            />
          </div>
          <div className="border rounded-lg p-3 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <DatePicker
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              max={new Date()}
              placeholder="End date"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg border hover:bg-accent">
            Cancel
          </button>
          <button onClick={handleApply} disabled={!startDate || !endDate} className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[0])
  const [customDates, setCustomDates] = useState(null)
  const [showCustomModal, setShowCustomModal] = useState(false)

  const getDateRange = () => {
    let endDate = new Date()
    let startDate = new Date()

    if (customDates) {
      return customDates
    }

    if (selectedRange.days) {
      startDate.setDate(endDate.getDate() - selectedRange.days)
    } else {
      startDate = new Date('2020-01-01')
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    }
  }

  const dateRange = getDateRange()

  // Fetch all data in parallel
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics', 'stats', dateRange.start, dateRange.end],
    queryFn: () => analyticsApi.getStats(dateRange.start, dateRange.end),
  })

  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ['analytics', 'donations-by-day', dateRange.start, dateRange.end],
    queryFn: () => analyticsApi.getDonationsByDay(dateRange.start, dateRange.end),
  })

  const { data: campaignStatusData, isLoading: statusLoading } = useQuery({
    queryKey: ['analytics', 'campaign-status', dateRange.start, dateRange.end],
    queryFn: () => analyticsApi.getCampaignStatus(dateRange.start, dateRange.end),
  })

  const { data: topCampaignsData, isLoading: topCampaignsLoading } = useQuery({
    queryKey: ['analytics', 'top-campaigns', dateRange.start, dateRange.end],
    queryFn: () => analyticsApi.getTopCampaigns(dateRange.start, dateRange.end, 5),
  })

  const { data: topDonorsData, isLoading: topDonorsLoading } = useQuery({
    queryKey: ['analytics', 'top-donors', dateRange.start, dateRange.end],
    queryFn: () => analyticsApi.getTopDonors(dateRange.start, dateRange.end, 5),
  })

  const { data: recentDonationsData, isLoading: recentLoading } = useQuery({
    queryKey: ['analytics', 'recent-donations', dateRange.start, dateRange.end],
    queryFn: () => analyticsApi.getRecentDonations(dateRange.start, dateRange.end, 10),
  })

  const isLoading = statsLoading || donationsLoading || statusLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const stats = statsData?.data || { campaigns_count: 0, total_raised: 0, users_count: 0, donations_count: 0 }
  const donationsByDay = donationsData?.data || []
  const campaignStatus = campaignStatusData?.data || []
  const topCampaigns = topCampaignsData?.data || []
  const topDonors = topDonorsData?.data || []
  const recentDonations = recentDonationsData?.data || []

  const statCards = [
    {
      label: 'Total Campaigns',
      value: stats.campaigns_count?.toString() || '0',
      icon: Megaphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Raised',
      value: formatGMD(stats.total_raised || 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Donations',
      value: stats.donations_count?.toString() || '0',
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Total Users',
      value: stats.users_count?.toString() || '0',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  // Beautiful green color palette
  const chartColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']
  const donationLineColor = '#10b981' // Emerald green
  const donationGradientColor = '#34d399' // Light emerald
  const barGradientLight = '#34d399' // Light green
  const barGradientDark = '#059669' // Dark green

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform metrics and analytics</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-card border rounded-xl p-4">
        <DateRangeSelector
          selectedRange={selectedRange}
          customRange={customDates}
          onRangeChange={(range) => {
            setSelectedRange(range)
            setCustomDates(null)
          }}
          onCustomDate={() => setShowCustomModal(true)}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bgColor }) => (
          <div key={label} className="border rounded-xl p-3 sm:p-5 bg-card hover:shadow-md transition-shadow min-w-0">
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{label}</p>
              <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${color}`} />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Donations Over Time */}
        <div className="border rounded-xl p-5 bg-card min-w-0 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Donations Over Time</h3>
          {donationsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={donationsByDay} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={donationLineColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={donationLineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value) => formatGMD(value)}
                  contentStyle={{
                    backgroundColor: '#f0fdf4',
                    border: `2px solid ${donationLineColor}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}
                  labelStyle={{ color: '#000' }}
                />
                <Line
                  type="natural"
                  dataKey="amount"
                  stroke={donationLineColor}
                  strokeWidth={3}
                  dot={{ fill: donationLineColor, r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  isAnimationActive={true}
                  name="Amount (D)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No donation data available for this period
            </div>
          )}
        </div>

        {/* Campaign Status Distribution */}
        <div className="border rounded-xl p-5 bg-card min-w-0 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Campaign Status Distribution</h3>
          {campaignStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ status, count }) => `${status}: ${count}`}
                  labelLine={true}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {campaignStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} campaigns`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#f0fdf4',
                    border: `2px solid ${donationLineColor}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No campaign data available for this period
            </div>
          )}
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Donors */}
        <div className="border rounded-xl p-5 bg-card min-w-0 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Top Donors</h3>
          {topDonors.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDonors} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={barGradientLight} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={barGradientDark} stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="donor"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value) => formatGMD(value)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: `2px solid ${barGradientDark}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No donor data available for this period
            </div>
          )}
        </div>

        {/* Top Campaigns */}
        <div className="border rounded-xl p-5 bg-card min-w-0">
          <h3 className="text-lg font-bold mb-4">Top Campaigns</h3>
          {topCampaigns.length > 0 ? (
            <div className="space-y-3">
              {topCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{campaign.title}</p>
                    <p className="text-xs text-muted-foreground">{campaign.category}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold text-green-600">{formatGMD(campaign.raised)}</p>
                    <p className="text-xs text-muted-foreground">{campaign.percentage}% of goal</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No campaign data available for this period</div>
          )}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 min-w-0">
          <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map(({ label, icon: Icon, to, color, bg }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-md hover:border-primary/50 transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 min-w-0">
          <h2 className="text-lg font-bold mb-3">Recent Donations</h2>
          <div className="border rounded-xl p-5 bg-card space-y-3">
            {recentDonations.length > 0 ? (
              recentDonations.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{d.donor_name}</p>
                    <p className="text-xs text-muted-foreground">{d.campaign_title}</p>
                  </div>
                  <p className="text-sm font-bold text-green-600">{formatGMD(d.amount)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No donations for this period</div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Date Modal */}
      <CustomDateModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onApply={(start, end) => {
          setCustomDates({ start, end })
        }}
      />
    </div>
  )
}
