import { useEffect, useRef, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { ROUTES } from '@/constants'
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications'
import { getNotificationIcon } from '@/utils/notificationIcons'
import { timeAgo } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  const router = useRouter()

  const { data: unreadCount = 0 } = useUnreadCount()
  const { data, isLoading } = useNotifications({ page_size: 5 }, { enabled: isOpen })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllRead()

  const notifications = data?.notifications ?? []

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = (notification) => {
    if (!notification.is_read) markRead.mutate(notification.id)
    setIsOpen(false)
    if (notification.link) router.navigate({ to: notification.link })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-donate rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute inset-x-3 top-16 sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80 max-w-full sm:max-w-[90vw] bg-card border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-semibold text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">You're all caught up.</p>
            ) : (
              notifications.map((n) => {
                const { icon: Icon, className } = getNotificationIcon(n.notification_type)
                return (
                  <button
                    key={n.id}
                    onClick={() => handleSelect(n)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left border-b last:border-b-0 hover:bg-accent transition-colors',
                      !n.is_read && 'bg-primary/5',
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', className)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm line-clamp-1', !n.is_read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </button>
                )
              })
            )}
          </div>

          <button
            onClick={() => {
              setIsOpen(false)
              router.navigate({ to: ROUTES.NOTIFICATIONS })
            }}
            className="w-full text-center px-4 py-2.5 text-sm font-medium text-primary hover:bg-accent transition-colors border-t"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}
