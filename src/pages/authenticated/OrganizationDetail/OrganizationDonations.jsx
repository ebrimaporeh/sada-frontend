import { useState } from 'react'
import { Link2, Check, Wallet, Gift, Megaphone } from 'lucide-react'
import { useOrganizationDonationStats, useOrganizationDirectDonations } from '@/hooks/useOrganizations'
import { formatGMD, formatDate } from '@/utils/formatters'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="border rounded-2xl bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function PublicDonateLink({ organization }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/give/${organization.slug}`

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border rounded-2xl bg-card p-5 space-y-2">
      <h2 className="font-semibold text-sm flex items-center gap-2">
        <Link2 className="w-4 h-4" /> Public Donation Link
      </h2>
      <p className="text-xs text-muted-foreground">
        This link works even when {organization.organization_name} has no active campaigns — share it directly with
        donors.
      </p>
      <div className="flex items-center gap-2">
        <input readOnly value={url} className="flex-1 min-w-0 px-3 py-2 border rounded-lg text-sm bg-muted/30 truncate" />
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border hover:bg-muted transition-colors flex-shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function DirectDonationsList({ organizationId }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrganizationDirectDonations(organizationId, { page })
  const donations = data?.donations ?? []

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (donations.length === 0) {
    return (
      <EmptyState
        title="No direct donations yet"
        description="Donations made straight to your organization (not through a campaign) will show up here."
      />
    )
  }

  return (
    <div className="space-y-2">
      <div className="border rounded-2xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Donor</th>
                <th className="text-left px-4 py-2.5 font-medium">Amount</th>
                <th className="text-left px-4 py-2.5 font-medium">Message</th>
                <th className="text-left px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {donations.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2.5 font-medium">{d.donor_name}</td>
                  <td className="px-4 py-2.5 text-primary font-semibold">{formatGMD(d.amount)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground max-w-[240px] truncate">{d.message || '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(d.paid_at || d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {(data?.totalPages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="text-muted-foreground">Page {page} of {data.totalPages}</span>
          <button
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export function OrganizationDonations({ organization }) {
  const { data: stats, isLoading: statsLoading } = useOrganizationDonationStats(organization.id)

  return (
    <div className="space-y-6">
      <PublicDonateLink organization={organization} />

      {statsLoading ? (
        <LoadingSpinner className="py-8" />
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Total Raised" value={formatGMD(stats?.total_raised ?? 0)} icon={Wallet} sub="Direct donations + campaigns" />
          <StatCard label="Direct Donations" value={formatGMD(stats?.direct_total ?? 0)} sub={`${stats?.direct_count ?? 0} donation${(stats?.direct_count ?? 0) === 1 ? '' : 's'}`} icon={Gift} />
          <StatCard label="Campaign Donations" value={formatGMD(stats?.campaign_total ?? 0)} sub={`${stats?.campaign_count ?? 0} donation${(stats?.campaign_count ?? 0) === 1 ? '' : 's'}`} icon={Megaphone} />
        </div>
      )}

      <div>
        <h2 className="font-semibold text-base mb-3">Direct Donations</h2>
        <DirectDonationsList organizationId={organization.id} />
      </div>
    </div>
  )
}
