import { useState } from 'react'
import { AlertCircle, Flag, TrendingUp, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAdminReports } from '@/hooks/useAdmin'
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
  const [selectedReport, setSelectedReport] = useState(null)
  const { data: reportsData, isLoading } = useAdminReports({ status: filter === 'all' ? undefined : filter })

  const allReports = reportsData?.results || []
  const filteredReports = allReports

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flag className="w-8 h-8" />
          Campaign Reports
        </h1>
        <p className="text-muted-foreground mt-2">Review and manage campaign complaints and flags</p>
      </div>

      {/* Filters */}
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

      {/* Reports Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="border rounded-xl p-12 text-center flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="border rounded-xl p-12 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">No reports found</p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="text-sm text-primary hover:underline"
                >
                  View all reports
                </button>
              )}
            </div>
          ) : (
            filteredReports.map((report) => {
              const statusInfo = statusConfig[report.status]
              const reasonInfo = reasonLabels[report.reason]
              const StatusIcon = statusInfo.icon
              const reporter = report.reported_by?.full_name || report.reporter_name || 'Anonymous'
              const campaignTitle = report.campaign?.title || 'Unknown Campaign'
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={cn(
                    'w-full border rounded-xl p-4 text-left hover:shadow-md transition-all',
                    selectedReport?.id === report.id && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{campaignTitle}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reported by {reporter} • {formatDate(report.created_at)}
                      </p>
                    </div>
                    <div className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-2', reasonInfo.color)}>
                      {reasonInfo.label}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{report.description}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn('px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium', statusInfo.bgColor)}
                    >
                      <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                      <span className={statusInfo.color}>{statusInfo.label}</span>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Report Details */}
        <div className="lg:col-span-1">
          {selectedReport ? (
            <div className="border rounded-xl p-5 bg-card space-y-5 sticky top-20">
              <div>
                <h2 className="font-bold text-lg line-clamp-2">{selectedReport.campaign?.title || 'Unknown Campaign'}</h2>
                <p className="text-sm text-muted-foreground mt-1">Campaign Report Details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">REPORTER</p>
                  <p className="text-sm">{selectedReport.reported_by?.full_name || selectedReport.reporter_name || 'Anonymous'}</p>
                </div>

                {selectedReport.reported_by?.email && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">EMAIL</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.reported_by.email}</p>
                  </div>
                )}

                {selectedReport.reporter_phone && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">PHONE</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.reporter_phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">REASON</p>
                  <div className={cn('inline-block px-3 py-1.5 rounded-lg text-xs font-semibold', reasonLabels[selectedReport.reason]?.color)}>
                    {reasonLabels[selectedReport.reason]?.label || selectedReport.reason}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">DESCRIPTION</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{selectedReport.description}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">STATUS</p>
                  <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg', statusConfig[selectedReport.status]?.bgColor)}>
                    {(() => {
                      const StatusIcon = statusConfig[selectedReport.status]?.icon || AlertCircle
                      return (
                        <>
                          <StatusIcon className={`w-4 h-4 ${statusConfig[selectedReport.status]?.color}`} />
                          <span className={`text-sm font-medium ${statusConfig[selectedReport.status]?.color}`}>
                            {statusConfig[selectedReport.status]?.label || selectedReport.status}
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">REPORTED ON</p>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedReport.created_at)}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <button className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
                  Take Action
                </button>
                <button className="w-full px-4 py-2.5 border rounded-lg hover:bg-accent transition-colors text-sm font-medium">
                  View Campaign
                </button>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl p-8 text-center space-y-3 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto opacity-30" />
              <p>Select a report to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
