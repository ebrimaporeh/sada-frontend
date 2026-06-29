import { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { useUsersStats } from '@/hooks/useAdmin'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { StatSkeleton } from '@/components/custom/StatSkeleton'
import { formatDate } from '@/utils/formatters'

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [showStats, setShowStats] = useState(true)
  const limit = 10

  const { data: statsData, isLoading: statsLoading } = useUsersStats()
  const { data, isLoading } = useUsers({ limit, offset: (page - 1) * limit })

  const users = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / limit)

  return (
    <div className="space-y-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <PageHeader title="Users" description={`${data?.count || 0} total users`} />
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
        >
          {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Stats Grid */}
      {showStats && (
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
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted">
                  <tr>
                    {['Name', 'Email', 'Role', 'Joined'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">{user.full_name || '—'}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3 capitalize">{user.role}</td>
                        <td className="px-4 py-3">{formatDate(user.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-primary-foreground'
                          : 'border hover:bg-accent'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
