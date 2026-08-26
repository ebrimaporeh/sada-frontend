import { Building2, User } from 'lucide-react'
import { useProfileSwitchStore } from '@/store/profileSwitchStore'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'

// Mounted once in AuthenticatedLayout -- triggered from anywhere that calls
// useActiveProfile().setProfile() (the sidebar switcher, and
// OrganizationNewPage right after creating an org). Same backdrop-card
// pattern as the Google OAuth "Setting up your account…" overlay elsewhere
// in this app.
export function ProfileSwitchOverlay() {
  const switchingTo = useProfileSwitchStore((s) => s.switchingTo)
  if (!switchingTo) return null

  const Icon = switchingTo.isOrg ? Building2 : User

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-card border rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-muted-foreground" /> Switching to {switchingTo.label}…
        </p>
      </div>
    </div>
  )
}
