import { useEffect, useState } from 'react'
import { ShieldCheck, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, ZoomIn, User, Building2, RefreshCw, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { Sheet } from '@/components/custom/Sheet'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { ImageZoomModal } from '@/components/custom/ImageZoomModal'
import {
  useAdminVerifications, useReviewVerification,
  useAdminOrganizationVerifications, useReviewOrganizationVerification,
  useAdminOrganizationChangeRequests, useReviewOrganizationChangeRequest,
} from '@/hooks/useUsers'
import { ORGANIZATION_TYPES } from '@/constants'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const ID_TYPE_LABELS = {
  national_id: 'National ID Card',
  passport: 'Passport',
  drivers_license: "Driver's License",
}

const ORG_TYPE_LABELS = Object.fromEntries(ORGANIZATION_TYPES.map((t) => [t.value, t.label]))

const STATUS_CONFIG = {
  pending: { icon: Clock, label: 'Pending Review', color: 'text-amber-600', bg: 'bg-amber-50' },
  approved: { icon: CheckCircle2, label: 'Approved', color: 'text-green-600', bg: 'bg-green-50' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
}

export function VerificationsPage() {
  const [type, setType] = useState('individual') // individual | organization | change_request
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [zoomedPhoto, setZoomedPhoto] = useState(null)
  const limit = 10

  useEffect(() => {
    setPage(1)
  }, [filter, type])

  const queryParams = { status: filter === 'all' ? undefined : filter, page, page_size: limit }
  const { data: indivData, isLoading: indivLoading } = useAdminVerifications(queryParams, { enabled: type === 'individual' })
  const { data: orgData, isLoading: orgLoading } = useAdminOrganizationVerifications(queryParams, { enabled: type === 'organization' })
  const { data: changeData, isLoading: changeLoading } = useAdminOrganizationChangeRequests(queryParams, { enabled: type === 'change_request' })
  const reviewVerification = useReviewVerification()
  const reviewOrgVerification = useReviewOrganizationVerification()
  const reviewChangeRequest = useReviewOrganizationChangeRequest()

  const isOrg = type === 'organization'
  const isChangeRequest = type === 'change_request'
  const data = isChangeRequest ? changeData : isOrg ? orgData : indivData
  const isLoading = isChangeRequest ? changeLoading : isOrg ? orgLoading : indivLoading
  const reviewMutation = isChangeRequest ? reviewChangeRequest : isOrg ? reviewOrgVerification : reviewVerification

  const requests = data?.results || []
  const totalPages = data?.total_pages || 1
  const totalCount = data?.count || 0

  const handleSelect = (request) => {
    setSelected(request)
    setReason('')
    setIsSheetOpen(true)
  }

  const handleReview = (action) => {
    reviewMutation.mutate(
      { id: selected.id, action, reason: action === 'reject' ? reason : undefined },
      {
        onSuccess: (res) => {
          setSelected(isChangeRequest ? res.data.change_request : res.data.verification)
          if (action === 'approve') setIsSheetOpen(false)
        },
      },
    )
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
        <PageHeader
          title="Verifications"
          description={`${totalCount} request${totalCount === 1 ? '' : 's'} in this view`}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setType('individual')}
            className={cn(
              'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              type === 'individual' ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent text-muted-foreground',
            )}
          >
            <User className="w-4 h-4" /> Individual
          </button>
          <button
            onClick={() => setType('organization')}
            className={cn(
              'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              type === 'organization' ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent text-muted-foreground',
            )}
          >
            <Building2 className="w-4 h-4" /> Organization
          </button>
          <button
            onClick={() => setType('change_request')}
            className={cn(
              'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              type === 'change_request' ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent text-muted-foreground',
            )}
          >
            <RefreshCw className="w-4 h-4" /> Change Requests
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                filter === status ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent text-muted-foreground',
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="border rounded-xl p-12 text-center flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="border rounded-xl p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">No verification requests found</p>
            </div>
          ) : (
            requests.map((req) => {
              const status = STATUS_CONFIG[req.status]
              return (
                <button
                  key={req.id}
                  onClick={() => handleSelect(req)}
                  className="w-full border rounded-xl p-4 text-left hover:shadow-md transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{req.user_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{req.user_email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isChangeRequest
                        ? req.field_label
                        : isOrg ? ORG_TYPE_LABELS[req.organization_type] : ID_TYPE_LABELS[req.id_type]
                      } · Submitted {formatDate(req.created_at)}
                    </p>
                  </div>
                  <div className={cn('px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium flex-shrink-0', status.bg)}>
                    <status.icon className={`w-3.5 h-3.5 ${status.color}`} />
                    <span className={status.color}>{status.label}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {requests.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={totalCount} limit={limit} />
      )}

      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={isChangeRequest ? 'Change Request' : isOrg ? 'Organization Verification' : 'Verification Request'}
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <p className="font-semibold">{selected.user_name}</p>
              <p className="text-sm text-muted-foreground">{selected.user_email}</p>
            </div>

            <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium', STATUS_CONFIG[selected.status].bg)}>
              {(() => { const Icon = STATUS_CONFIG[selected.status].icon; return <Icon className={`w-3.5 h-3.5 ${STATUS_CONFIG[selected.status].color}`} /> })()}
              <span className={STATUS_CONFIG[selected.status].color}>{STATUS_CONFIG[selected.status].label}</span>
            </div>

            {isChangeRequest ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Field</p>
                    <p className="font-medium">{selected.field_label}</p>
                  </div>
                </div>
                <div className="border rounded-xl p-4 bg-muted/30 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Current</p>
                    <p className="text-sm font-medium truncate">{selected.current_value || '—'}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Proposed</p>
                    <p className="text-sm font-medium truncate text-primary">{selected.proposed_value}</p>
                  </div>
                </div>
              </>
            ) : isOrg ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Organization Type</p>
                    <p className="font-medium">{ORG_TYPE_LABELS[selected.organization_type]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact ID Type</p>
                    <p className="font-medium">{ID_TYPE_LABELS[selected.contact_id_type]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact ID Number</p>
                    <p className="font-medium">{selected.contact_id_number}</p>
                  </div>
                </div>

                {[
                  ['Contact ID — Front', selected.contact_id_photo_front],
                  ['Contact ID — Back', selected.contact_id_photo_back],
                  ['Registration Document', selected.registration_document],
                  ['Organization Photo', selected.organization_photo],
                ].filter(([, src]) => src).map(([label, src]) => (
                  <div key={label} className="space-y-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <button
                      type="button"
                      onClick={() => setZoomedPhoto({ src, alt: label })}
                      className="relative block w-full group"
                    >
                      <img
                        src={src}
                        alt={label}
                        className="w-full max-h-[28rem] rounded-lg border object-contain bg-muted"
                      />
                      <span className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">ID Type</p>
                    <p className="font-medium">{ID_TYPE_LABELS[selected.id_type]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID Number</p>
                    <p className="font-medium">{selected.id_number}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Front Photo</p>
                  <button
                    type="button"
                    onClick={() => setZoomedPhoto({ src: selected.id_photo_front, alt: 'ID front' })}
                    className="relative block w-full group"
                  >
                    <img
                      src={selected.id_photo_front}
                      alt="ID front"
                      className="w-full max-h-[28rem] rounded-lg border object-contain bg-muted"
                    />
                    <span className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                </div>
                {selected.id_photo_back && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Back Photo</p>
                    <button
                      type="button"
                      onClick={() => setZoomedPhoto({ src: selected.id_photo_back, alt: 'ID back' })}
                      className="relative block w-full group"
                    >
                      <img
                        src={selected.id_photo_back}
                        alt="ID back"
                        className="w-full max-h-[28rem] rounded-lg border object-contain bg-muted"
                      />
                      <span className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}

            {selected.status === 'rejected' && selected.rejection_reason && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-3 flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Rejection reason</p>
                  <p className="text-red-700 mt-0.5">{selected.rejection_reason}</p>
                </div>
              </div>
            )}

            {selected.reviewed_by_name && (
              <p className="text-xs text-muted-foreground">
                Reviewed by {selected.reviewed_by_name} on {formatDate(selected.reviewed_at)}
              </p>
            )}

            {selected.status === 'pending' && (
              <div className="space-y-3 border-t pt-4">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for rejection (required if rejecting)..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview('reject')}
                    disabled={reviewMutation.isPending || !reason.trim()}
                    className="flex-1 px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                  </button>
                  <button
                    onClick={() => handleReview('approve')}
                    disabled={reviewMutation.isPending}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>

      <ImageZoomModal
        isOpen={!!zoomedPhoto}
        onClose={() => setZoomedPhoto(null)}
        src={zoomedPhoto?.src}
        alt={zoomedPhoto?.alt}
      />
    </div>
  )
}
