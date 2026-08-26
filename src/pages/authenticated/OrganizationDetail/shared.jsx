import { Link, useParams } from '@tanstack/react-router'
import { ChevronLeft, ShieldCheck, Building2 } from 'lucide-react'
import { useOrganization } from '@/hooks/useOrganizations'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { ROUTES } from '@/constants'

// Overview/Members/Roles/Settings used to be tabs on one page -- they're
// real nav items/routes now (see AuthenticatedLayout's org-context nav and
// rootRoute.jsx's organization*Route entries; the sibling OrganizationOverview/
// OrganizationMembers/OrganizationRoles/OrganizationSettings components are
// named accordingly, not "*Tab"), so each of those pages fetches its own
// org data and renders this header, instead of one shell switching between
// tab bodies.
export function OrganizationHeader({ organization }) {
  return (
    <div>
      <Link
        to={ROUTES.ORGANIZATIONS}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Organizations
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold leading-snug flex items-center gap-2">
            {organization.organization_name}
            {organization.is_verified && <ShieldCheck className="w-5 h-5 text-green-600" />}
          </h1>
          <p className="text-sm text-muted-foreground">{organization.organization_type_name}</p>
        </div>
      </div>
    </div>
  )
}

// Fetches the org from the $id route param, renders the header, then hands
// the org to `Content` -- the shared shape all 4 org detail pages
// (OrganizationOverview/Members/Roles/Settings) need around their one
// differing piece.
export function OrganizationDetailPage({ Content }) {
  const { id } = useParams({ strict: false })
  const { data: organization, isLoading, isError } = useOrganization(id)

  if (isLoading) return <LoadingSpinner className="py-32" />
  if (isError || !organization) {
    return (
      <EmptyState
        title="Organization not found"
        description="This organization doesn't exist or you're not a member of it."
      />
    )
  }

  return (
    <div className="space-y-6">
      <OrganizationHeader organization={organization} />
      <Content organization={organization} />
    </div>
  )
}
