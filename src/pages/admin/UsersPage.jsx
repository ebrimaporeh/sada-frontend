import { useState } from 'react'
import { Eye, EyeOff, Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
// import { useUsersStats } from '@/hooks/useAdmin'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { StatSkeleton } from '@/components/custom/StatSkeleton'
import { UserSheet } from '@/components/custom/UserSheet'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const limit = 10

  // const { data: statsData, isLoading: statsLoading } = useUsersStats()
  const { data, isLoading } = useUsers({ page, page_size: limit })

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setIsSheetOpen(true)
  }

  const users = data?.results || []
  const totalPages = data?.total_pages || Math.ceil((data?.count || 0) / limit)

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
      {/* Header */}
      <div>
        <PageHeader
          title="Users"
          description={`${data?.count || 0} total users`}
        />
      </div>

      {/* Stats Grid */}
      {/* {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statsLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="border rounded-xl p-5 bg-card space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{statsData?.total_users || 0}</p>
                  <p className="text-xs text-muted-foreground">All registered users</p>
                </div>
              </div>
            </>
          )}
        </div>
      )} */}

      {/* Users Table */}
      {users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Verification', 'Joined'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">{user.full_name || '—'}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 capitalize">{user.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full',
                            user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                          )}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
                            user.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                          )}
                        >
                          {user.is_verified ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                          {user.is_verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDate(user.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {users.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={data?.count} limit={limit} />
      )}

      {/* User Detail Sheet */}
      <UserSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        user={selectedUser}
      />
    </div>
  )
}
