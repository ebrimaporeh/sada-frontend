import { useState, useRef } from 'react'
import { PlusCircle, X, ImagePlus, AlertCircle, Megaphone, Edit2, Trash2 } from 'lucide-react'
import { useAddCampaignUpdate, useEditCampaignUpdate, useDeleteCampaignUpdate } from '@/hooks/useCampaigns'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function UpdatesTab({ campaign }) {
  const addUpdate = useAddCampaignUpdate()
  const editUpdate = useEditCampaignUpdate()
  const deleteUpdate = useDeleteCampaignUpdate()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [images, setImages] = useState([])
  const [imagesToRemove, setImagesToRemove] = useState([])
  const [submitError, setSubmitError] = useState('')
  const fileRef = useRef()

  const updates = campaign.updates || []

  function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f), isNew: true }))
    setImages((prev) => [...prev, ...previews].slice(0, 4))
    e.target.value = ''
  }

  function startEdit(update) {
    setEditingId(update.id)
    setForm({ title: update.title, content: update.content })
    setImages(update.images || [])
    setImagesToRemove([])
    setShowForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ title: '', content: '' })
    setImages([])
    setImagesToRemove([])
  }

  function removeImage(img) {
    if (img.id) {
      setImagesToRemove((prev) => [...prev, img.id])
    }
    setImages((prev) => prev.filter((i) => i.id !== img.id && i !== img))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSubmitError('')

    const formData = new FormData()
    formData.append('title', form.title.trim())
    formData.append('content', form.content.trim())

    images.forEach((img) => {
      if (img.isNew && img.file) {
        formData.append('images', img.file)
      }
    })

    imagesToRemove.forEach((id) => {
      formData.append('images_to_remove', id)
    })

    if (editingId) {
      editUpdate.mutate(
        { slug: campaign.slug, updateId: editingId, data: formData },
        {
          onSuccess: () => {
            cancelEdit()
          },
          onError: (err) => setSubmitError(err?.response?.data?.message || 'Failed to update.'),
        },
      )
    } else {
      addUpdate.mutate(
        { slug: campaign.slug, data: formData },
        {
          onSuccess: () => {
            setForm({ title: '', content: '' })
            setImages([])
            setShowForm(false)
          },
          onError: (err) => setSubmitError(err?.response?.data?.message || 'Failed to post update.'),
        },
      )
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{updates.length} update{updates.length !== 1 ? 's' : ''} posted</p>
        {!editingId && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className={cn(
              'inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors',
              showForm ? 'border hover:bg-muted' : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {showForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Post Update'}
          </button>
        )}
      </div>

      {submitError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4" /> {submitError}
        </div>
      )}

      {(showForm || editingId) && (
        <div className="border rounded-2xl bg-card p-5 space-y-4">
          <h3 className="font-semibold">{editingId ? 'Edit Update' : 'Post a Campaign Update'}</h3>
          <p className="text-xs text-muted-foreground -mt-2">
            {editingId ? 'Update the information below.' : 'Keep your donors informed. Updates build trust and encourage more donations.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Update Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Surgery completed successfully!"
                maxLength={120}
                className="w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Share the latest news with your donors…"
                rows={5}
                className="w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Photos (optional)</label>
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted group">
                    <img src={img.url || img.image_url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="absolute inset-0 bg-black/50 text-white hidden group-hover:flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[10px]">Add</span>
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => (editingId ? cancelEdit() : setShowForm(false))}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={(addUpdate.isPending || editUpdate.isPending) || !form.title.trim() || !form.content.trim()}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {addUpdate.isPending || editUpdate.isPending ? (
                  <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> {editingId ? 'Saving…' : 'Posting…'}</>
                ) : editingId ? 'Save Changes' : 'Post Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      {updates.length === 0 && !showForm && !editingId ? (
        <div className="border-2 border-dashed rounded-2xl p-12 text-center space-y-3">
          <Megaphone className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="font-semibold">No updates yet</p>
          <p className="text-sm text-muted-foreground">Post your first update to keep donors engaged.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2 rounded-xl text-sm hover:bg-primary/90 transition-colors mt-2"
          >
            <PlusCircle className="w-4 h-4" /> Post first update
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((u) => (
            <div key={u.id} className="border rounded-2xl bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold leading-snug">{u.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(u.created_at || u.date)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(u)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Edit update"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this update?')) {
                        deleteUpdate.mutate({ slug: campaign.slug, updateId: u.id })
                      }
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Delete update"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{u.content}</p>
              {u.images?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {u.images.map((img, i) => (
                    <img key={i} src={img.image_url || img} alt="" className="w-24 h-24 rounded-lg object-cover border" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
