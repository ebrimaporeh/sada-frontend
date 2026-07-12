import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { EmptyState } from '@/components/custom/EmptyState'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { useNotifications, useMarkNotificationRead, useMarkAllRead, useUnreadCount } from '@/hooks/useNotifications'
import { getNotificationIcon } from '@/utils/notificationIcons'
import { timeAgo } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
]

export function NotificationsPage() {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const limit = 10
  const router = useRouter()

  useEffect(() => {
    setPage(1)
  }, [filter])

  const { data, isLoading } = useNotifications({
    page,
    page_size: limit,
    is_read: filter === 'unread' ? false : undefined,
  })
  const { data: unreadCount = 0 } = useUnreadCount()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllRead()

  const notifications = data?.notifications ?? []
  const totalCount = data?.count ?? 0
  const totalPages = data?.totalPages ?? 1

  const handleSelect = (notification) => {
    if (!notification.is_read) markRead.mutate(notification.id)
    if (notification.link) router.navigate({ to: notification.link })
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
        <PageHeader
          title="Notifications"
          description={unreadCount > 0 ? `${unreadCount} unread` : 'You\'re all caught up.'}
          action={
            unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="inline-flex items-center gap-2 border font-medium px-4 py-2 rounded-xl hover:bg-muted transition-colors text-sm disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            )
          }
        />

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f.value ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent text-muted-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description="We'll let you know when something happens on your campaigns."
          />
        ) : (
          <div className="border rounded-xl overflow-hidden bg-card divide-y">
            {notifications.map((n) => {
              const { icon: Icon, className } = getNotificationIcon(n.notification_type)
              return (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={cn(
                    'w-full flex items-start gap-4 px-4 sm:px-5 py-4 text-left hover:bg-accent/50 transition-colors',
                    !n.is_read && 'bg-primary/5',
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', className)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', !n.is_read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-2" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={totalCount} limit={limit} />
      )}
    </div>
  )
}
