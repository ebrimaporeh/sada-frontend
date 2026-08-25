import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronsUpDown, User, Building2, Check, Plus, Settings } from 'lucide-react'
import { useActiveProfile, INDIVIDUAL_PROFILE_ID } from '@/hooks/useActiveProfile'
import { ROUTES } from '@/constants'
import { initials } from '@/utils/formatters'
import { cn } from '@/utils/cn'

// Dashboard-level "who am I acting as" control — personal profile, or any
// organization the signed-in user belongs to (created or invited-and-
// accepted, useMe() doesn't distinguish the two, both are just
// OrganizationMembership rows). See useActiveProfile for exactly what
// switching this does and doesn't gate.
export function ProfileSwitcher() {
  const { profileId, isOrg, organization, organizations, setProfile } = useActiveProfile()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const activeLabel = isOrg ? organization.organization_name : 'Personal account'

  return (
    <div ref={containerRef} className="relative px-3 py-2 border-b">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-accent transition-colors text-left"
      >
        <div className={cn(
          'w-8 h-8 flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary text-xs font-bold',
          isOrg ? 'rounded-lg' : 'rounded-full',
        )}>
          {isOrg ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{activeLabel}</p>
          <p className="text-[11px] text-muted-foreground">{isOrg ? organization.role : 'Individual'}</p>
        </div>
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute left-3 right-3 mt-1 z-40 bg-card border rounded-xl shadow-lg py-1 max-h-80 overflow-y-auto">
          <button
            type="button"
            onClick={() => { setProfile(INDIVIDUAL_PROFILE_ID); setOpen(false) }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
              profileId === INDIVIDUAL_PROFILE_ID && 'bg-primary/5',
            )}
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="flex-1 truncate font-medium">Personal account</span>
            {profileId === INDIVIDUAL_PROFILE_ID && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
          </button>

          {organizations.length > 0 && <div className="my-1 border-t" />}

          {organizations.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => { setProfile(org.id); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
                profileId === org.id && 'bg-primary/5',
              )}
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                {initials(org.organization_name)}
              </div>
              <span className="flex-1 min-w-0 truncate font-medium">{org.organization_name}</span>
              {profileId === org.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>
          ))}

          <div className="my-1 border-t" />

          {isOrg && (
            <Link
              to={ROUTES.ORGANIZATION_OVERVIEW}
              params={{ id: organization.id }}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent transition-colors text-muted-foreground"
            >
              <Settings className="w-3.5 h-3.5 flex-shrink-0" />
              Manage {organization.organization_name}
            </Link>
          )}
          <Link
            to={ROUTES.ORGANIZATION_NEW}
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent transition-colors text-muted-foreground"
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            Create an organization
          </Link>
        </div>
      )}
    </div>
  )
}
