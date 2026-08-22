import { useEffect, useState } from 'react'
import { Search, Loader2, SearchX } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { Sheet } from '@/components/custom/Sheet'
import { Select } from '@/components/custom/Select'
import { formatDateTime } from '@/utils/formatters'
import { useAuditLogs, useAuditActions, useAuditActors } from '@/hooks/useAudit'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/utils/cn'

const VERB_COLORS = {
  deleted: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
  refunded: 'bg-amber-100 text-amber-700',
  unpublished: 'bg-amber-100 text-amber-700',
  paused: 'bg-amber-100 text-amber-700',
}
const DEFAULT_VERB_COLOR = 'bg-green-100 text-green-700'

export function AuditPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [actorFilter, setActorFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const limit = 15

  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, actionFilter, actorFilter])

  const { data: actions = [] } = useAuditActions()
  const actionOptions = [{ value: '', label: 'All Action' }, ...actions]

  const { data: actors = [] } = useAuditActors()
  const actorOptions = [{ value: '', label: 'User' }, ...actors.map((a) => ({ value: a.id, label: a.name }))]

  const { data, isLoading } = useAuditLogs({
    page,
    page_size: limit,
    action: actionFilter || undefined,
    actor: actorFilter || undefined,
    search: debouncedSearch || undefined,
  })
  const logs = data?.logs ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.count ?? 0

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
        <PageHeader title="Activity Log" description="A trail of changes across the platform" />

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            options={actionOptions}
            className="w-48"
            buttonClassName="py-2"
          />
          <Select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            options={actorOptions}
            className="w-48"
            buttonClassName="py-2"
          />
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {['Actor', 'Action', 'Description', 'Time'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{entry.actor_name || entry.actor_email || 'System'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap capitalize', VERB_COLORS[entry.verb] || DEFAULT_VERB_COLOR)}>
                          {entry.verb}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[360px]">
                        <p className="line-clamp-1">{entry.description}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(entry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && logs.length === 0 && (
            <div className="py-16 text-center">
              <SearchX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No activity matches your filters.</p>
            </div>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={totalCount} limit={limit} />
      )}

      <Sheet isOpen={Boolean(selectedEntry)} onClose={() => setSelectedEntry(null)} title="Activity Detail">
        {selectedEntry && (
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Action</p>
              <span className={cn('inline-block text-xs font-semibold px-2 py-1 rounded-full capitalize', VERB_COLORS[selectedEntry.verb] || DEFAULT_VERB_COLOR)}>
                {selectedEntry.verb}
              </span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm font-medium">{selectedEntry.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Time</p>
                <p className="text-sm font-medium">{formatDateTime(selectedEntry.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Actor</p>
                <p className="text-sm font-medium">{selectedEntry.actor_name || selectedEntry.actor_email || 'System'}</p>
              </div>
              {selectedEntry.target_type && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Target</p>
                  <p className="text-sm font-medium">{selectedEntry.target_type}</p>
                </div>
              )}
              {selectedEntry.target_repr && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Target detail</p>
                  <p className="text-sm font-medium break-words">{selectedEntry.target_repr}</p>
                </div>
              )}
            </div>

            {selectedEntry.metadata && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Details</p>
                <pre className="text-xs bg-muted/50 border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(selectedEntry.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}
