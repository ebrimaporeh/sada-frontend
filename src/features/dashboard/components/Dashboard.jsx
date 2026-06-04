import { useMe } from '@/hooks/useAuth'
import { PageHeader } from '@/components/custom/PageHeader'

export function Dashboard() {
  const { data: user } = useMe()

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.first_name || 'there'}!`}
        description="Here's what's happening in your account."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground">Account</p>
          <p className="text-2xl font-bold mt-1">{user?.role}</p>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground">Email verified</p>
          <p className="text-2xl font-bold mt-1">{user?.email_verified ? 'Yes' : 'No'}</p>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground">Member since</p>
          <p className="text-2xl font-bold mt-1">
            {user?.created_at ? new Date(user.created_at).getFullYear() : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
