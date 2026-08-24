import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, ShieldCheck, ShieldOff, User, Building2 } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ORGANIZATION_TYPES, ACCOUNT_TYPES } from '@/constants'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const ORG_TYPE_LABELS = Object.fromEntries(ORGANIZATION_TYPES.map((t) => [t.value, t.label]))

export function UsersPage() {
  const navigate = useNavigate()
  const [type, setType] = useState('individual') // individual | organization
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    setPage(1)
  }, [type, debouncedSearch])

  const { data, isLoading } = useUsers({ account_type: type, page, page_size: limit, search: debouncedSearch || undefined })

  const handleSelectUser = (user) => {
    navigate({ to: '/admin/users/$id', params: { id: user.id } })
  }

  const users = data?.results || []
  const totalPages = data?.total_pages || Math.ceil((data?.count || 0) / limit)
  const isOrg = type === 'organization'

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
      {/* Header */}
      <div>
        <PageHeader
          title="Campaigners"
          description={`${data?.count || 0} total ${isOrg ? 'organizations' : 'users'}`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setType('individual')}
          className={cn(
            'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            type === 'individual' ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent text-muted-foreground',
          )}
        >
          <User className="w-4 h-4" /> Users
        </button>
        <button
          onClick={() => setType('organization')}
          className={cn(
            'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            type === 'organization' ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent text-muted-foreground',
          )}
        >
          <Building2 className="w-4 h-4" /> Organizations
        </button>
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${isOrg ? 'organizations' : 'campaigners'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Users Table */}
      {!isLoading && users.length === 0 ? (
        <EmptyState title={`No ${isOrg ? 'organizations' : 'users'} found`} />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted">
                <tr>
                  {(isOrg
                    ? ['Organization', 'Email', 'Type', 'Status', 'Verification', 'Joined']
                    : ['Name', 'Email', 'Status', 'Verification', 'Joined']
                  ).map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={isOrg ? 6 : 5} className="px-4 py-8 text-center">
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
                      {isOrg && (
                        <td className="px-4 py-3 capitalize">
                          {ORG_TYPE_LABELS[user.organization_type] || '—'}
                        </td>
                      )}
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
    </div>
  )
}
