import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
} from 'lucide-react'
import { formatGMD } from '@/utils/formatters'
import { useFinanceSummary } from '@/hooks/useAdmin'
import { DatePicker } from '@/components/custom/DatePicker'

const PERIODS = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

export function FinancesPage() {
  const [showStats, setShowStats] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 5

  const [period, setPeriod] = useState('week')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [appliedRange, setAppliedRange] = useState({ start: '', end: '' })

  const { data: summaryData, isLoading } = useFinanceSummary(
    period,
    period === 'custom' ? appliedRange.start : undefined,
    period === 'custom' ? appliedRange.end : undefined,
    10
  )

  const summary = summaryData?.data

  const donations = summary?.donations || { total_amount: 0, count: 0, average_amount: 0 }
  const payouts = summary?.payouts || { completed_amount: 0, completed_count: 0, pending_amount: 0, pending_count: 0 }
  const transactions = summary?.transactions || { paid: 0, failed: 0, pending: 0, refunded: 0, total: 0, success_rate: 0 }
  const donationsTrend = summary?.donations_trend || []
  const providerBreakdown = summary?.provider_breakdown || []
  const topCampaigns = summary?.top_campaigns || []

  const totalPages = Math.ceil(topCampaigns.length / limit)
  const paginatedCampaigns = topCampaigns.slice((page - 1) * limit, page * limit)

  const transactionData = [
    { name: 'Paid', value: transactions.paid, color: '#10b981' },
    { name: 'Failed', value: transactions.failed, color: '#ef4444' },
    { name: 'Pending', value: transactions.pending, color: '#f59e0b' },
    { name: 'Refunded', value: transactions.refunded, color: '#6b7280' },
  ].filter((d) => d.value > 0)

  const financialStats = [
    {
      label: 'Total Donations',
      value: formatGMD(donations.total_amount),
      change: `${donations.count} donations`,
      icon: ArrowUpRight,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Payouts',
      value: formatGMD(payouts.completed_amount),
      change: payouts.pending_count > 0
        ? `${formatGMD(payouts.pending_amount)} pending (${payouts.pending_count})`
        : 'No pending payouts',
      icon: ArrowDownLeft,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Success Rate',
      value: `${transactions.success_rate}%`,
      change: `${transactions.total} transactions`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Average Donation',
      value: formatGMD(donations.average_amount),
      change: 'Per donation',
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  const barGradientLight = '#34d399'
  const barGradientDark = '#059669'

  const handleSelectPeriod = (value) => {
    setPeriod(value)
    setPage(1)
  }

  const handleApplyCustomRange = () => {
    if (customStart && customEnd) {
      setAppliedRange({ start: customStart, end: customEnd })
      setPage(1)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Financial Overview
          </h1>
          <p className="text-muted-foreground mt-2">Platform finances and transaction monitoring</p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
        >
          {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleSelectPeriod(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              period === value ? 'bg-green-600 text-white border-green-600' : 'hover:bg-accent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex flex-wrap items-end gap-3 border rounded-xl p-4 bg-card">
          <div className="border rounded-lg p-3 space-y-1.5 w-48">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <DatePicker
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              max={customEnd || new Date()}
              placeholder="Start date"
            />
          </div>
          <div className="border rounded-lg p-3 space-y-1.5 w-48">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <DatePicker
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              min={customStart || undefined}
              max={new Date()}
              placeholder="End date"
            />
          </div>
          <button
            onClick={handleApplyCustomRange}
            disabled={!customStart || !customEnd}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            Apply
          </button>
          {appliedRange.start && appliedRange.end && (
            <p className="text-xs text-muted-foreground">
              Showing {appliedRange.start} to {appliedRange.end}
            </p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialStats.map(({ label, value, change, icon: Icon, color, bg }) => (
            <div key={label} className="border rounded-xl p-5 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-2">{isLoading ? '—' : value}</p>
              <p className="text-xs text-muted-foreground">{change}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Donations Trend */}
        <div className="border rounded-xl p-5 bg-card">
          <h3 className="text-lg font-bold mb-4">Donations Trend</h3>
          {donationsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donationsTrend} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={barGradientLight} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={barGradientDark} stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value) => formatGMD(value)}
                  contentStyle={{
                    backgroundColor: '#f0fdf4',
                    border: `2px solid ${barGradientDark}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                  }}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="amount" fill="url(#trendGradient)" radius={[8, 8, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No donation data for this period
            </div>
          )}
        </div>

        {/* Transaction Status */}
        <div className="border rounded-xl p-5 bg-card">
          <h3 className="text-lg font-bold mb-4">Transaction Status</h3>
          {transactions.total > 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={transactionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={true}
                  >
                    {transactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} transactions`, 'Count']}
                    contentStyle={{
                      backgroundColor: '#f0fdf4',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-sm text-muted-foreground mt-2">
                Success Rate: <span className="font-bold text-green-600">{transactions.success_rate}%</span>
              </p>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No transaction data for this period
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border rounded-xl p-5 bg-linear-to-br from-green-50 to-emerald-50 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">TOTAL DONATIONS</p>
          <div>
            <p className="text-3xl font-bold text-green-700">{formatGMD(donations.total_amount)}</p>
            <p className="text-sm text-green-600 mt-1">{donations.count} donations</p>
          </div>
          <p className="text-xs text-green-600/70">Average: {formatGMD(donations.average_amount)} per donation</p>
        </div>

        <div className="border rounded-xl p-5 bg-linear-to-br from-orange-50 to-amber-50 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">PENDING PAYOUTS</p>
          <div>
            <p className="text-3xl font-bold text-orange-700">{formatGMD(payouts.pending_amount)}</p>
            <p className="text-sm text-orange-600 mt-1">{payouts.pending_count} pending payouts</p>
          </div>
          <p className="text-xs text-orange-600/70">
            {payouts.pending_count > 0 ? 'Awaiting processing' : 'System is fully processed'}
          </p>
        </div>
      </div>

      {/* Top Campaigns Table */}
      <div className="border rounded-xl p-5 bg-card space-y-4">
        <h2 className="text-lg font-bold">Top Campaigns Performance</h2>
        {topCampaigns.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No campaigns for this period</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-muted-foreground text-left text-xs font-semibold">
                  <tr>
                    <th className="pb-3">Campaign</th>
                    <th className="pb-3">Raised</th>
                    <th className="pb-3">Goal</th>
                    <th className="pb-3">Progress</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-medium max-w-[200px] line-clamp-1">{campaign.title}</td>
                      <td className="py-3 font-semibold text-green-600">{formatGMD(campaign.raised)}</td>
                      <td className="py-3 text-muted-foreground">{formatGMD(campaign.goal)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-green-600 rounded-full h-2 transition-all"
                              style={{ width: `${Math.min(campaign.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{campaign.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : campaign.status === 'completed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} · Showing {(page - 1) * limit + 1}-
                  {Math.min(page * limit, topCampaigns.length)} of {topCampaigns.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          p === page ? 'bg-green-600 text-white' : 'border hover:bg-accent'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Provider Breakdown */}
      <div className="border rounded-xl p-5 bg-card space-y-4">
        <h2 className="text-lg font-bold">Payment Provider Breakdown</h2>
        {providerBreakdown.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No transactions for this period</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providerBreakdown.map((provider) => (
              <div key={provider.provider} className="border rounded-lg p-4 bg-linear-to-br from-green-50 to-emerald-50 space-y-2">
                <p className="font-semibold text-gray-900 capitalize">{provider.provider.replace('_', ' ')}</p>
                <p className="text-lg font-bold text-green-700">{formatGMD(provider.amount)}</p>
                <p className="text-xs text-green-600">{provider.count} transactions</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
