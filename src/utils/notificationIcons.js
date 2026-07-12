import { HandCoins, CheckCircle2, XCircle, Wallet, Megaphone, Trophy, Bell } from 'lucide-react'

export const NOTIFICATION_ICONS = {
  donation_received: { icon: HandCoins, className: 'text-green-600 bg-green-100' },
  campaign_approved: { icon: CheckCircle2, className: 'text-green-600 bg-green-100' },
  campaign_rejected: { icon: XCircle, className: 'text-red-600 bg-red-100' },
  payout_processed: { icon: Wallet, className: 'text-blue-600 bg-blue-100' },
  campaign_update: { icon: Megaphone, className: 'text-amber-600 bg-amber-100' },
  goal_reached: { icon: Trophy, className: 'text-purple-600 bg-purple-100' },
}

export function getNotificationIcon(type) {
  return NOTIFICATION_ICONS[type] || { icon: Bell, className: 'text-muted-foreground bg-muted' }
}
