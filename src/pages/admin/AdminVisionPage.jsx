import { useEffect, useState } from 'react'
import {
  Loader2, Plus, Edit2, Trash2, ArrowLeft, CheckCircle2, AlertCircle, Compass, Eye, EyeOff,
} from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { EmptyState } from '@/components/custom/EmptyState'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { MarkdownEditor } from '@/components/custom/MarkdownEditor'
import {
  useAdminVisionTopics, useCreateVisionTopic, useUpdateVisionTopic, useDeleteVisionTopic,
} from '@/hooks/useVision'

const PHASE_TABS = [
  { key: 'current_state', label: 'Current State' },
  { key: 'implementation', label: 'Implementation' },
  { key: 'short_term_vision', label: 'Short-Term Vision' },
  { key: 'long_term_vision', label: 'Long-Term Vision' },
]

const EMPTY_FORM = {
  title: '', slug: '', summary: '', order: 0, is_published: false,
  current_state: '', implementation: '', short_term_vision: '', long_term_vision: '',
}

export function AdminVisionPage() {
  const { topics, isLoading } = useAdminVisionTopics()
  const createTopic = useCreateVisionTopic()
  const updateTopic = useUpdateVisionTopic()
  const deleteTopic = useDeleteVisionTopic()

  const [editingSlug, setEditingSlug] = useState(null) // null = list, 'new' = creating, else editing that slug
  const [form, setForm] = useState(EMPTY_FORM)
  const [activeTab, setActiveTab] = useState(PHASE_TABS[0].key)
  const [notification, setNotification] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const isEditorOpen = editingSlug !== null
  const isSaving = createTopic.isPending || updateTopic.isPending

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleNew = () => {
    setForm(EMPTY_FORM)
    setActiveTab(PHASE_TABS[0].key)
    setEditingSlug('new')
  }

  const handleEdit = (topic) => {
    setForm({
      title: topic.title, slug: topic.slug, summary: topic.summary || '',
      order: topic.order, is_published: topic.is_published,
      current_state: topic.current_state || '', implementation: topic.implementation || '',
      short_term_vision: topic.short_term_vision || '', long_term_vision: topic.long_term_vision || '',
    })
    setActiveTab(PHASE_TABS[0].key)
    setEditingSlug(topic.slug)
  }

  const handleCancel = () => setEditingSlug(null)

  const handleSave = () => {
    if (!form.title.trim()) {
      showNotification('error', 'Title is required.')
      return
    }
    const isCreating = editingSlug === 'new'
    const mutation = isCreating ? createTopic : updateTopic
    const payload = isCreating ? form : { slug: editingSlug, ...form }
    mutation.mutate(payload, {
      onSuccess: () => {
        showNotification('success', isCreating ? 'Topic created.' : 'Topic updated.')
        setEditingSlug(null)
      },
      onError: (err) => showNotification('error', err?.response?.data?.message || 'Could not save topic.'),
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteTopic.mutate(deleteTarget.slug, {
      onSuccess: () => {
        setDeleteTarget(null)
        showNotification('success', 'Topic deleted.')
      },
    })
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
        {notification && (
          <div
            className={`fixed top-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg z-40 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}

        {!isEditorOpen ? (
          <>
            <PageHeader
              title="Platform Vision"
              description="Roadmap documentation shown publicly at /vision — current state, implementation, and where each topic is headed."
              action={
                <button
                  onClick={handleNew}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> New Topic
                </button>
              }
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : topics.length === 0 ? (
              <EmptyState icon={Compass} title="No topics yet" description="Create one to start documenting the roadmap." />
            ) : (
              <div className="space-y-3">
                {topics.map((topic) => (
                  <div
                    key={topic.slug}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{topic.title}</h3>
                        <span
                          className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            topic.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {topic.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {topic.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">/{topic.slug} · order {topic.order}</p>
                      {topic.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{topic.summary}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { deleteTopic.reset(); setDeleteTarget(topic) }}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-accent transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">{editingSlug === 'new' ? 'New Vision Topic' : `Edit: ${form.title}`}</h1>
            </div>

            <div className="border rounded-xl bg-card p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">TITLE</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                    placeholder="e.g. Entity & Account Architecture"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">SLUG (leave blank to auto-generate)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring font-mono"
                    placeholder="entity-account-architecture"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">SUMMARY (shown on the public index page)</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">DISPLAY ORDER</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                    className="w-4 h-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm font-medium">Published (visible at /vision)</span>
                </label>
              </div>
            </div>

            <div className="border rounded-xl bg-card p-5 space-y-4">
              <div className="flex gap-2 flex-wrap border-b pb-4">
                {PHASE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <MarkdownEditor
                value={form[activeTab]}
                onChange={(e) => setForm((f) => ({ ...f, [activeTab]: e.target.value }))}
                placeholder="Write this phase's documentation here…"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-60"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving…' : 'Save Topic'}
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This permanently removes the topic and all four of its documentation phases. It also disappears from the public /vision page immediately."
        confirmLabel="Delete Topic"
        isLoading={deleteTopic.isPending}
        errorMessage={deleteTopic.isError ? deleteTopic.error?.response?.data?.message || 'Failed to delete topic.' : null}
      />
    </div>
  )
}
