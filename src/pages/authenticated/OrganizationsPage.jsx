import { Link } from '@tanstack/react-router'
import { PlusCircle, Building2, Loader2, ShieldCheck, Users, Mail } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { useMyOrganizations, useMyInvitations } from '@/hooks/useOrganizations'
import { ROUTES } from '@/constants'

function OrganizationCard({ org }) {
  return (
    <Link
      to={ROUTES.ORGANIZATION_OVERVIEW}
      params={{ id: org.id }}
      className="border rounded-xl bg-card p-5 hover:shadow-md transition-shadow flex items-start gap-4"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
        <Building2 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold leading-snug truncate">{org.organization_name}</h3>
          {org.is_verified && <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{org.role}</p>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Users className="w-3 h-3" /> {org.member_count} member{org.member_count === 1 ? '' : 's'}
        </p>
      </div>
    </Link>
  )
}

function InvitationBanner({ invitation }) {
  return (
    <Link
      to={ROUTES.INVITATIONS}
      search={{ token: invitation.token }}
      className="flex items-center gap-3 border border-primary/30 bg-primary/5 rounded-xl p-4 hover:bg-primary/10 transition-colors"
    >
      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
      <p className="text-sm flex-1 min-w-0">
        <span className="font-semibold">{invitation.organization_name}</span> invited you to join as{' '}
        <span className="font-semibold">{invitation.role_name}</span>.
      </p>
      <span className="text-sm font-semibold text-primary flex-shrink-0">Review</span>
    </Link>
  )
}

export function OrganizationsPage() {
  const { data: organizations = [], isLoading } = useMyOrganizations()
  const { data: invitations = [] } = useMyInvitations()

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Organizations"
          description="Manage the organizations you run or belong to."
        />
        <Link
          to={ROUTES.ORGANIZATION_NEW}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Create Organization
        </Link>
      </div>

      {invitations.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wide">
            Pending Invitations ({invitations.length})
          </h2>
          <div className="space-y-2">
            {invitations.map((inv) => <InvitationBanner key={inv.id} invitation={inv} />)}
          </div>
        </section>
      )}

      {organizations.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-16 text-center space-y-4">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground" />
          <div>
            <p className="font-semibold text-lg">No organizations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create one to fundraise as an organization, invite teammates, and assign roles.
            </p>
          </div>
          <Link
            to={ROUTES.ORGANIZATION_NEW}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Create your first organization
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {organizations.map((org) => <OrganizationCard key={org.id} org={org} />)}
        </div>
      )}
    </div>
  )
}
