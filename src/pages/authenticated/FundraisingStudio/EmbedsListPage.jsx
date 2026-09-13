import { Navigate, Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Code2, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { EmptyState } from '@/components/custom/EmptyState'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES, OrganizationPermission } from '@/constants'
import { useMe } from '@/hooks/useAuth'

// There's exactly one embed per organization now (see
// .claude/backend/fundraising.md) -- no more list-of-embeds, no more
// destination picker. This page's job shrinks to "which of your
// organizations' embeds do you want to manage" -- skipping straight to it
// when there's only one, same as any single-choice picker would.
export function EmbedsListPage() {
  const { data: me, isLoading } = useMe()

  if (isLoading) return <LoadingSpinner className="py-16" />

  const organizations = (me?.organizations ?? []).filter(
    (o) => o.permissions?.includes(OrganizationPermission.MANAGE_ORGANIZATION),
  )

  if (organizations.length === 1) {
    return <Navigate to={ROUTES.FUNDRAISING_EMBED_DETAIL} params={{ organizationId: organizations[0].id }} replace />
  }

  return (
    <div>
      <Link
        to={ROUTES.FUNDRAISING_STUDIO}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Fundraising Studio
      </Link>
      <PageHeader title="Embeds" description="Each organization has one embeddable donation widget you can customize and install." />

      {organizations.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="Bring your fundraising to your website"
          description="You don't have an organization you can manage fundraising materials for yet."
        />
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              to={ROUTES.FUNDRAISING_EMBED_DETAIL}
              params={{ organizationId: org.id }}
              className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {org.logo ? (
                  <img src={org.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{org.organization_name}</p>
                <p className="text-xs text-muted-foreground truncate">Manage embed widget</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
