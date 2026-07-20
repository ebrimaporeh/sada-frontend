import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, Loader2, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAdminReports, useAdminUpdateReport } from '@/hooks/useAdmin'
import { useAdminChangeCampaignStatus } from '@/hooks/useCampaigns'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { ReportSheet } from '@/components/custom/ReportSheet'
import { EmptyState } from '@/components/custom/EmptyState'
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

export function ReportsTab({ campaign }) {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingCampaignStatus, setIsChangingCampaignStatus] = useState(false)
  const limit = 10

  useEffect(() => { setPage(1) }, [filter])

  const { data: reportsData, isLoading } = useAdminReports({
    campaign: campaign.id,
    status: filter === 'all' ? undefined : filter,
    page,
    page_size: limit,
  })
  const { mutateAsync: updateReport } = useAdminUpdateReport()
  const { mutateAsync: changeCampaignStatus } = useAdminChangeCampaignStatus()

  const reports = reportsData?.results || []
  const totalPages = reportsData?.total_pages || 1
  const totalCount = reportsData?.count || 0

  const handleSelectReport = (report) => {
    setSelectedReport(report)
    setEditData({
      status: report.status || 'pending',
      admin_notes: report.admin_notes || '',
      reason: report.reason || '',
      description: report.description || '',
    })
    setIsEditMode(false)
    setIsSheetOpen(true)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await updateReport({ id: selectedReport.id, ...editData })
      setIsEditMode(false)
      setIsSheetOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCampaignStatusChange = async (campaignId, newStatus, reason) => {
    setIsChangingCampaignStatus(true)
    try {
      await changeCampaignStatus({ id: campaignId, status: newStatus, reason: reason || '' })
      setSelectedReport((prev) => ({ ...prev, campaign: { ...prev.campaign, status: newStatus } }))
    } finally {
      setIsChangingCampaignStatus(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors border',
              filter === s ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent',
            )}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="border rounded-xl p-12 text-center flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No reports"
          description={filter === 'all' ? "No one has reported this campaign." : `No ${filter} reports for this campaign.`}
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const statusInfo = statusConfig[report.status]
            const reasonInfo = reasonLabels[report.reason]
            const StatusIcon = statusInfo.icon
            const reporter = report.reported_by_name || 'Anonymous'
            return (
              <button
                key={report.id}
                onClick={() => handleSelectReport(report)}
                className="w-full border rounded-xl p-4 text-left hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs text-muted-foreground">Reported by {reporter} · {formatDate(report.created_at)}</p>
                  <div className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0', reasonInfo.color)}>
                    {reasonInfo.label}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{report.description}</p>
                <div className={cn('inline-flex px-3 py-1.5 rounded-lg items-center gap-1.5 text-xs font-medium', statusInfo.bgColor)}>
                  <StatusIcon className={cn('w-3.5 h-3.5', statusInfo.color)} />
                  <span className={statusInfo.color}>{statusInfo.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {reports.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={totalCount} limit={limit} />
      )}

      <ReportSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        report={selectedReport}
        isEditMode={isEditMode}
        onEditMode={setIsEditMode}
        editData={editData}
        onEditChange={(data) => setEditData({ ...editData, ...data })}
        onSave={handleSaveChanges}
        isSaving={isSaving}
        onCampaignStatusChange={handleCampaignStatusChange}
        isChangingCampaignStatus={isChangingCampaignStatus}
      />
    </div>
  )
}
