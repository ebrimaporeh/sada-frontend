import { useState, useRef } from 'react'
import { Info, CheckCircle2, AlertCircle, PauseCircle, PlayCircle, ImagePlus, X, Loader2, Trash2 } from 'lucide-react'
import { useCategories, useUpdateMyCampaign, useTogglePauseCampaign, useUpdateCampaignMedia, useDeleteGalleryImage } from '@/hooks/useCampaigns'
import { GAMBIA_REGIONS, CAMPAIGN_STATUS } from '@/constants'

const inputClass = 'w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring'
const labelClass = 'text-sm font-medium block mb-1.5'

function CampaignPhotosCard({ campaign }) {
  const updateMedia = useUpdateCampaignMedia()
  const deleteImage = useDeleteGalleryImage()
  const coverRef = useRef()
  const galleryRef = useRef()
  const [mediaError, setMediaError] = useState('')

  function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaError('')
    updateMedia.mutate(
      { slug: campaign.slug, cover: file, gallery: [] },
      { onError: (err) => setMediaError(err?.response?.data?.message || 'Failed to upload cover.') },
    )
    e.target.value = ''
  }

  function handleGalleryChange(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setMediaError('')
    updateMedia.mutate(
      { slug: campaign.slug, cover: null, gallery: files },
      { onError: (err) => setMediaError(err?.response?.data?.message || 'Failed to upload gallery images.') },
    )
    e.target.value = ''
  }

  function handleDelete(imageId) {
    setMediaError('')
    deleteImage.mutate(
      { slug: campaign.slug, imageId },
      { onError: (err) => setMediaError(err?.response?.data?.message || 'Failed to delete image.') },
    )
  }

  const images = campaign.images ?? []
  const coverImage = images.find((img) => img.is_cover)
  const galleryImages = images.filter((img) => !img.is_cover)

  return (
    <div className="border rounded-2xl bg-card p-5 space-y-4">
      <h3 className="font-semibold border-b pb-3">Campaign Photos</h3>

      {mediaError && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" /> {mediaError}
        </p>
      )}

      {/* Cover image */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Cover Image</p>
        {coverImage ? (
          <div className="relative w-full sm:w-64 aspect-video rounded-xl overflow-hidden border bg-muted group">
            <img src={coverImage.image_url} alt="Cover" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(coverImage.id)}
              disabled={deleteImage.isPending}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              {deleteImage.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
            <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-medium">Cover</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No cover image set.</p>
        )}
        <button
          type="button"
          onClick={() => coverRef.current?.click()}
          disabled={updateMedia.isPending}
          className="inline-flex items-center gap-2 text-sm border rounded-lg px-4 py-2 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {updateMedia.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {updateMedia.isPending ? 'Uploading…' : 'Upload cover'}
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* Gallery images */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Gallery Images</p>
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galleryImages.map((img) => (
              <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden border bg-muted group">
                <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={deleteImage.isPending}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  {deleteImage.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No gallery images yet.</p>
        )}
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          disabled={updateMedia.isPending}
          className="inline-flex items-center gap-2 text-sm border rounded-lg px-4 py-2 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {updateMedia.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {updateMedia.isPending ? 'Uploading…' : 'Add to gallery'}
        </button>
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
      </div>
    </div>
  )
}

export function EditTab({ campaign }) {
  const { categories } = useCategories()
  const updateCampaign = useUpdateMyCampaign()
  const togglePause = useTogglePauseCampaign()
  const [pauseError, setPauseError] = useState('')
  const isPaused = campaign.status === CAMPAIGN_STATUS.SUSPENDED
  const canTogglePause = campaign.status === CAMPAIGN_STATUS.ACTIVE || campaign.status === CAMPAIGN_STATUS.SUSPENDED

  function handleTogglePause() {
    setPauseError('')
    togglePause.mutate(campaign.slug, {
      onError: (err) => setPauseError(err?.response?.data?.message || 'Failed to update campaign status.'),
    })
  }

  const [form, setForm] = useState({
    title: campaign.title || '',
    short_description: campaign.short_description || '',
    story: campaign.story || '',
    goal: String(campaign.goal || ''),
    deadline: campaign.deadline || '',
    category: campaign.category?.slug || campaign.category_slug || '',
    region: campaign.region || '',
    beneficiary: campaign.beneficiary || '',
    beneficiary_relationship: campaign.beneficiary_relationship || '',
    is_urgent: campaign.is_urgent || false,
  })
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
    setSaveError('')
  }

  function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    updateCampaign.mutate(
      {
        slug: campaign.slug,
        title: form.title,
        short_description: form.short_description,
        story: form.story,
        goal: Number(form.goal),
        deadline: form.deadline,
        category: form.category,
        region: form.region,
        beneficiary: form.beneficiary,
        beneficiary_relationship: form.beneficiary_relationship,
        is_urgent: form.is_urgent,
      },
      {
        onSuccess: () => setSaved(true),
        onError: (err) => setSaveError(err?.response?.data?.message || 'Failed to save changes.'),
      },
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
     

      <CampaignPhotosCard campaign={campaign} />

      <div className="border rounded-2xl bg-card p-5 space-y-5">
        <h3 className="font-semibold border-b pb-3">Campaign Details</h3>

        <div className="space-y-1.5">
          <label className={labelClass}>Campaign Title</label>
          <input value={form.title} onChange={set('title')} className={inputClass} maxLength={120} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Category</label>
            <select value={form.category} onChange={set('category')} className={inputClass}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Region</label>
            <select value={form.region} onChange={set('region')} className={inputClass}>
              <option value="">Select region</option>
              {GAMBIA_REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Beneficiary Name</label>
            <input value={form.beneficiary} onChange={set('beneficiary')} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Relationship</label>
            <select value={form.beneficiary_relationship} onChange={set('beneficiary_relationship')} className={inputClass}>
              {['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Community', 'Organization', 'Other'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="urgent" checked={form.is_urgent} onChange={set('is_urgent')} className="rounded" />
          <label htmlFor="urgent" className="text-sm font-medium cursor-pointer">Mark as Urgent</label>
        </div>
      </div>

      <div className="border rounded-2xl bg-card p-5 space-y-5">
        <h3 className="font-semibold border-b pb-3">Story &amp; Description</h3>

        <div className="space-y-1.5">
          <label className={labelClass}>Short Description</label>
          <textarea value={form.short_description} onChange={set('short_description')} rows={3} maxLength={280} className={inputClass + ' resize-none'} />
          <p className="text-xs text-muted-foreground text-right">{form.short_description.length}/280</p>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Full Story</label>
          <textarea value={form.story} onChange={set('story')} rows={10} className={inputClass + ' resize-none'} />
        </div>
      </div>

      <div className="border rounded-2xl bg-card p-5 space-y-5">
        <h3 className="font-semibold border-b pb-3">Goal &amp; Timeline</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Fundraising Goal (GMD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">D</span>
              <input type="number" value={form.goal} onChange={set('goal')} min="100" className={inputClass + ' pl-7'} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Deadline</label>
            <input type="date" value={form.deadline} onChange={set('deadline')} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pb-4">
        <div>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Changes saved
            </span>
          )}
          {saveError && (
            <span className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {saveError}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={updateCampaign.isPending}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
        >
          {updateCampaign.isPending ? (
            <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Saving…</>
          ) : 'Save Changes'}
        </button>
      </div>

      {canTogglePause && (
        <div className="border rounded-2xl bg-card p-5 space-y-3">
          <h3 className="font-semibold border-b pb-3">Campaign Status</h3>
          <p className="text-sm text-muted-foreground">
            {isPaused
              ? 'Your campaign is currently paused. Resume it to accept donations again.'
              : 'Pause your campaign to temporarily stop accepting donations. You can resume it at any time.'}
          </p>
          {pauseError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {pauseError}
            </p>
          )}
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={togglePause.isPending}
            className={`inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm border ${
              isPaused
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {togglePause.isPending ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : isPaused ? (
              <PlayCircle className="w-4 h-4" />
            ) : (
              <PauseCircle className="w-4 h-4" />
            )}
            {togglePause.isPending ? 'Updating…' : isPaused ? 'Resume Campaign' : 'Pause Campaign'}
          </button>
        </div>
      )}
    </form>
  )
}
