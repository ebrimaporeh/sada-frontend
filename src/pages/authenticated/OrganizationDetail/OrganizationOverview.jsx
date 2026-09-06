import { Link } from '@tanstack/react-router'
import { Building2, ShieldCheck, ShieldQuestion, Users, Megaphone, Calendar, Wallet } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import { ROUTES } from '@/constants'

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value || '—'}</p>
    </div>
  )
}

export function OrganizationOverview({ organization }) {
  return (
    <div className="space-y-6">
      <div className="border rounded-2xl bg-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
          {organization.logo ? (
            <img src={organization.logo} alt={organization.organization_name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-7 h-7" />
          )}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <p className="font-bold text-lg">{organization.organization_name}</p>
          <p className="text-sm text-muted-foreground capitalize">{organization.organization_type_name}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
            {organization.is_verified ? (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                <ShieldQuestion className="w-3.5 h-3.5" /> Not verified
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-full font-medium">
              <Users className="w-3.5 h-3.5" /> {organization.member_count} member{organization.member_count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">Details</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoField label="Phone" value={organization.phone} />
          <InfoField label="Second Phone" value={organization.phone_2} />
          <InfoField label="Recovery Email 1" value={organization.recovery_email_1} />
          <InfoField label="Recovery Email 2" value={organization.recovery_email_2} />
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="font-medium text-sm flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {formatDate(organization.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to={ROUTES.MY_CAMPAIGNS}
          className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Megaphone className="w-4 h-4" /> View campaigns
        </Link>
        <Link
          to={ROUTES.ORGANIZATION_DONATIONS}
          params={{ id: organization.id }}
          className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Wallet className="w-4 h-4" /> View donations
        </Link>
      </div>
    </div>
  )
}
