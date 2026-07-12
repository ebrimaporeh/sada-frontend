import { BadgeCheck } from 'lucide-react'
import { cn } from '@/utils/cn'

// Inline "blue tick" identity-verified marker — for sitting right next to a
// campaign owner's name wherever it's shown publicly, not the standalone
// green "Verified" pill used on the profile/verification pages.
export function VerifiedTick({ className, size = 'w-4 h-4' }) {
  return (
    <BadgeCheck
      className={cn(size, 'text-blue-500 fill-blue-500/15 flex-shrink-0', className)}
      title="Identity verified"
    />
  )
}
