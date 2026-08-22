import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
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
} from 'lucide-react'
import { ROUTES, CAMPAIGN_STATUS } from '@/constants'
import { formatGMD } from '@/utils/formatters'
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

// Light, semantic per-status colors -- mirrors the status badge colors used
// elsewhere in the admin (campaigns table, campaign detail page), just as
// hex values since a Recharts Cell fill can't take a Tailwind class.
// Distinct hues matter here (unlike the money charts elsewhere on this
// page, which share the brand gradient) since each slice is a genuinely
// different category, not just a different point on the same series.
const CAMPAIGN_STATUS_PIE_COLORS = {
  [CAMPAIGN_STATUS.ACTIVE]: '#86efac',
  [CAMPAIGN_STATUS.APPROVED]: '#86efac',
  [CAMPAIGN_STATUS.COMPLETED]: '#93c5fd',
  [CAMPAIGN_STATUS.PENDING]: '#fcd34d',
  [CAMPAIGN_STATUS.SUSPENDED]: '#fdba74',
  [CAMPAIGN_STATUS.REJECTED]: '#fca5a5',
  [CAMPAIGN_STATUS.DRAFT]: '#d1d5db',
}
const DEFAULT_STATUS_PIE_COLOR = '#d1d5db'

function StatCardSkeleton() {
  return (
    <div className="border rounded-xl p-3 sm:p-5 bg-card min-w-0 animate-pulse">
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <div className="h-3 sm:h-4 bg-muted rounded w-16" />
        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-muted flex-shrink-0" />
      </div>
      <div className="h-5 sm:h-7 bg-muted rounded w-20" />
    </div>
  )
}

function ChartSkeleton({ height = 300 }) {
  return <div className="bg-muted rounded-lg animate-pulse" style={{ height }} />
}

function ListRowSkeleton() {
  return (
    <div className="flex items-center justify-between pb-3 border-b last:border-0 animate-pulse">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3.5 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
      <div className="text-right ml-2 space-y-1.5 flex-shrink-0">
        <div className="h-3.5 bg-muted rounded w-16 ml-auto" />
        <div className="h-3 bg-muted rounded w-12 ml-auto" />
      </div>
    </div>
  )
}

function DateRangeSelector({ selectedRange, customRange, onRangeChange, onApplyCustom }) {
  const isCustomActive = Boolean(customRange)
  const [draftStart, setDraftStart] = useState(customRange?.start || '')
  const [draftEnd, setDraftEnd] = useState(customRange?.end || '')

  // Picking a preset clears the applied custom range on the parent -- clear
  // the visible draft inputs to match, so they don't keep showing stale
  // dates that no longer reflect what's actually being queried.
  useEffect(() => {
    if (!customRange) {
      setDraftStart('')
      setDraftEnd('')
    }
  }, [customRange])

  function handleApply() {
    if (draftStart && draftEnd) onApplyCustom(draftStart, draftEnd)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-2 flex-wrap">
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

      <div className="flex items-center gap-2 flex-wrap">
        <DatePicker
          value={draftStart}
          onChange={(e) => setDraftStart(e.target.value)}
          max={draftEnd || new Date()}
          placeholder="From"
          className="w-36"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <DatePicker
          value={draftEnd}
          onChange={(e) => setDraftEnd(e.target.value)}
          min={draftStart || undefined}
          max={new Date()}
          placeholder="To"
          className="w-36"
        />
        <button
          onClick={handleApply}
          disabled={!draftStart || !draftEnd}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[0])
  const [customDates, setCustomDates] = useState(null)

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

  // The actual brand gradient (--primary-gradient in index.css) -- same
  // colors as the primary buttons, applied to every chart on this page
  // including the pie slices below (each slice gets its own yellow-to-green
  // sweep since gradientUnits defaults to each shape's own bounding box).
  const brandGradientFrom = '#ebd617'
  const brandGradientTo = '#7ac815'
  const donationLineColor = brandGradientTo
  const barGradientLight = brandGradientFrom
  const barGradientDark = brandGradientTo

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
          onApplyCustom={(start, end) => setCustomDates({ start, end })}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          statCards.map(({ label, value, icon: Icon, color, bgColor }) => (
            <div key={label} className="border rounded-xl p-3 sm:p-5 bg-card hover:shadow-md transition-shadow min-w-0">
              <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{label}</p>
                <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${color}`} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold truncate">{value}</p>
            </div>
          ))
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Donations Over Time */}
        <div className="border rounded-xl p-5 bg-card min-w-0 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Donations Over Time</h3>
          {donationsLoading ? (
            <ChartSkeleton height={320} />
          ) : donationsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={donationsByDay} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={donationLineColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={donationLineColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="donationStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={brandGradientFrom} />
                    <stop offset="100%" stopColor={brandGradientTo} />
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
                    boxShadow: '0 4px 12px rgba(122, 200, 21, 0.15)'
                  }}
                  labelStyle={{ color: '#000' }}
                />
                <Area
                  type="natural"
                  dataKey="amount"
                  stroke="url(#donationStrokeGradient)"
                  strokeWidth={3}
                  dot={{ fill: donationLineColor, r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  isAnimationActive={true}
                  name="Amount (D)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-muted-foreground">
              No donation data available for this period
            </div>
          )}
        </div>

        {/* Campaign Status Distribution */}
        <div className="border rounded-xl p-5 bg-card min-w-0 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Campaign Status Distribution</h3>
          {statusLoading ? (
            <ChartSkeleton height={300} />
          ) : campaignStatus.length > 0 ? (
            <div className="w-full max-w-xs mx-auto">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={campaignStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    paddingAngle={2}
                    label={({ status, count }) => `${status}: ${count}`}
                    labelLine={true}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {campaignStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CAMPAIGN_STATUS_PIE_COLORS[entry.status] || DEFAULT_STATUS_PIE_COLOR}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} campaigns`, 'Count']}
                    contentStyle={{
                      backgroundColor: '#f0fdf4',
                      border: `2px solid ${donationLineColor}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(122, 200, 21, 0.15)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
          {topDonorsLoading ? (
            <ChartSkeleton height={360} />
          ) : topDonors.length > 0 ? (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={topDonors} margin={{ top: 20, right: 30, left: 0, bottom: 40 }} barCategoryGap="20%">
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
                  height={60}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, (max) => Math.ceil(max * 1.1)]} />
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
                <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={64} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[360px] flex items-center justify-center text-muted-foreground">
              No donor data available for this period
            </div>
          )}
        </div>

        {/* Top Campaigns */}
        <div className="border rounded-xl p-5 bg-card min-w-0">
          <h3 className="text-lg font-bold mb-4">Top Campaigns</h3>
          {topCampaignsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
            </div>
          ) : topCampaigns.length > 0 ? (
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
            {recentLoading ? (
              Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)
            ) : recentDonations.length > 0 ? (
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
    </div>
  )
}
