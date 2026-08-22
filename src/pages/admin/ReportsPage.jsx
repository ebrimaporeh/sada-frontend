import { useEffect, useState } from 'react'
import { AlertCircle, Flag, TrendingUp, CheckCircle, Clock, Loader2, Eye, EyeOff, Search, SearchX } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAdminReports, useReportsStats, useAdminReportedCampaigns } from '@/hooks/useAdmin'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useStatsVisibility } from '@/hooks/useStatsVisibility'
import { StatSkeleton } from '@/components/custom/StatSkeleton'
import { ReportSheet } from '@/components/custom/ReportSheet'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { Select } from '@/components/custom/Select'
import { formatDate } from '@/utils/formatters'

const reasonLabels = {
  fraudulent: { label: 'Fraudulent Activity', color: 'bg-red-100 text-red-700' },
  misleading: { label: 'Misleading Info', color: 'bg-orange-100 text-orange-700' },
  inappropriate: { label: 'Inappropriate', color: 'bg-pink-100 text-pink-700' },
  spam: { label: 'Spam/Scam', color: 'bg-yellow-100 text-yellow-700' },
  duplicate: { label: 'Duplicate', color: 'bg-blue-100 text-blue-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending Review', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  investigating: { icon: TrendingUp, label: 'Investigating', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  resolved: { icon: CheckCircle, label: 'Resolved', color: 'text-green-600', bgColor: 'bg-green-50' },
  dismissed: { icon: AlertCircle, label: 'Dismissed', color: 'text-gray-600', bgColor: 'bg-gray-50' },
}

export function ReportsPage() {
  const [filter, setFilter] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [showStats, setShowStats] = useStatsVisibility('reports')
  const limit = 10

  const debouncedSearch = useDebouncedValue(search)

  // Reset to page 1 whenever a filter changes so we don't land on an empty page.
  useEffect(() => {
    setPage(1)
  }, [filter, campaignFilter, debouncedSearch])

  const { data: statsData, isLoading: statsLoading } = useReportsStats()
  const { data: reportedCampaigns = [] } = useAdminReportedCampaigns()
  const { data: reportsData, isLoading } = useAdminReports({
    status: filter === 'all' ? undefined : filter,
    campaign: campaignFilter || undefined,
    search: debouncedSearch || undefined,
    page,
    page_size: limit,
  })

  const campaignOptions = [
    { value: '', label: 'All Campaigns' },
    ...reportedCampaigns.map((c) => ({ value: c.id, label: c.title })),
  ]

  const reports = reportsData?.results || []
  const totalPages = reportsData?.total_pages || 1
  const totalCount = reportsData?.count || 0

  const handleSelectReport = (report) => {
    setSelectedReport(report)
    setIsSheetOpen(true)
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Flag className="w-8 h-8" />
            Campaign Reports
          </h1>
          <p className="text-muted-foreground mt-2">Review and manage campaign complaints and flags</p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
        >
          {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Stats Grid */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="border rounded-xl p-4 bg-card">
                <p className="text-2xl font-extrabold text-blue-600">{statsData?.total_reports || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Reports</p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <p className="text-2xl font-extrabold text-amber-600">{statsData?.pending_reports || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pending Review</p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <p className="text-2xl font-extrabold text-blue-600">{statsData?.investigating_reports || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Investigating</p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <p className="text-2xl font-extrabold text-green-600">{statsData?.resolved_reports || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Resolved</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-accent text-muted-foreground'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <Select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            options={campaignOptions}
            className="w-56"
          />
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reporter or campaign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Clear search"
              >
                <SearchX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {isLoading ? (
        <div className="border rounded-xl p-12 text-center flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <div className="border rounded-xl p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-muted-foreground">No reports found</p>
          {(filter !== 'all' || campaignFilter) && (
            <button
              onClick={() => { setFilter('all'); setCampaignFilter('') }}
              className="text-sm text-primary hover:underline"
            >
              View all reports
            </button>
          )}
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted">
                <tr>
                  {['Campaign', 'Reporter', 'Reason', 'Status', 'Reported On'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((report) => {
                  const statusInfo = statusConfig[report.status]
                  const reasonInfo = reasonLabels[report.reason]
                  const StatusIcon = statusInfo.icon
                  const reporter = report.reported_by_name || 'Anonymous'
                  const campaignTitle = report.campaign?.title || 'Unknown Campaign'
                  return (
                    <tr
                      key={report.id}
                      onClick={() => handleSelectReport(report)}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium max-w-[240px]">
                        <span className="block truncate" title={campaignTitle}>{campaignTitle}</span>
                      </td>
                      <td className="px-4 py-3">{reporter}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap', reasonInfo.color)}>
                          {reasonInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', statusInfo.bgColor)}>
                          <StatusIcon className={cn('w-3.5 h-3.5', statusInfo.color)} />
                          <span className={statusInfo.color}>{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(report.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {reports.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={totalCount} limit={limit} />
      )}

      {/* Report Detail Sheet */}
      <ReportSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        report={selectedReport}
      />
    </div>
  )
}
