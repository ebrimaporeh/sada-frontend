import { useUsers } from '@/hooks/useUsers'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { formatDate } from '@/utils/formatters'

export function UsersPage() {
  const { data, isLoading } = useUsers()

  if (isLoading) return <LoadingSpinner className="py-20" />

  const users = data?.results || []

  return (
    <div>
      <PageHeader title="Users" description={`${data?.count || 0} total users`} />
      {users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted">
              <tr>
                {['Name', 'Email', 'Role', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">{user.full_name || '—'}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
