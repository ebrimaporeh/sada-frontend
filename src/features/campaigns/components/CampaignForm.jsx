import { useState, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Info, ImagePlus, X, Loader2 } from 'lucide-react'
import { useCategories, useCreateCampaign, useUpdateCampaignMedia } from '@/hooks/useCampaigns'
import { usePlatformSettings } from '@/hooks/usePayments'
import { GAMBIA_REGIONS, ROUTES } from '@/constants'
import { PageHeader } from '@/components/custom/PageHeader'
import { MarkdownEditor } from '@/components/custom/MarkdownEditor'
import { DatePicker } from '@/components/custom/DatePicker'
import { cn } from '@/utils/cn'

const STORAGE_KEY = 'campaign_draft'
const IMAGES_STORAGE_KEY = 'campaign_draft_images'
const MAX_IMAGE_SIZE = 500 * 1024 // 500KB per image

const STEPS = ['Campaign Info', 'Your Story', 'Goal & Deadline', 'Review & Submit']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                  done ? 'bg-primary border-primary text-primary-foreground' : active ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground',
                )}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn('text-xs font-medium hidden sm:block', active ? 'text-primary' : 'text-muted-foreground')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-2 mt-[-12px]', done ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FieldGroup({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, className, ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn('w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring', className)}
      {...props}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 5, ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      {...props}
    />
  )
}

const INITIAL = {
  title: '',
  category: '',
  region: '',
  beneficiary: '',
  beneficiary_relationship: '',
  short_description: '',
  story: '',
  goal: '',
  deadline: '',
  is_anonymous: false,
}

function ImageUploader({ images, onChange }) {
  const fileRef = useRef()
  const MAX = 5

  function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name }))
    onChange([...images, ...previews].slice(0, MAX))
    e.target.value = ''
  }

  function remove(idx) {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border bg-muted group">
            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-medium">Cover</span>
            )}
          </div>
        ))}

        {images.length < MAX && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <p className="text-xs text-muted-foreground">
        Upload up to {MAX} photos. The first image will be the campaign cover. Accepted: JPG, PNG, WebP.
      </p>
    </div>
  )
}

const RELATIONSHIPS = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Community', 'Organization', 'Other']

export function CampaignForm() {
  const navigate = useNavigate()
  const { categories } = useCategories()
  const createCampaign = useCreateCampaign()
  const { data: platformSettings } = usePlatformSettings()
  const platformFeePercent = Number(platformSettings?.platform_fee_percent ?? 1)
  const updateMedia = useUpdateCampaignMedia()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : INITIAL
  })
  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem(IMAGES_STORAGE_KEY)
    if (!saved) return []
    try {
      const parsed = JSON.parse(saved)
      return parsed.map((img) => ({
        ...img,
        url: img.base64,
      }))
    } catch (e) {
      return []
    }
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const saveImagesToStorage = (imgs) => {
    const toSave = imgs
      .filter((img) => img.base64 || img.file)
      .slice(0, 5)
      .map((img) => ({
        base64: img.base64,
        name: img.name,
      }))
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(toSave))
  }

  const convertImageToBase64 = (file) => {
    return new Promise((resolve) => {
      if (file.size > MAX_IMAGE_SIZE) {
        resolve(null)
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  useEffect(() => {
    const saveImages = async () => {
      const imagesWithBase64 = await Promise.all(
        images.map(async (img) => {
          if (img.base64) return img
          if (img.file) {
            const base64 = await convertImageToBase64(img.file)
            return { ...img, base64 }
          }
          return img
        })
      )
      saveImagesToStorage(imagesWithBase64)
    }
    saveImages()
  }, [images])

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }))
  }

  function validateStep(s) {
    const errs = {}
    if (s === 0) {
      if (!form.title.trim()) errs.title = 'Title is required'
      else if (form.title.trim().length < 10) errs.title = 'Title must be at least 10 characters'
      if (!form.category) errs.category = 'Please select a category'
      if (!form.region) errs.region = 'Please select a region'
      if (!form.beneficiary.trim()) errs.beneficiary = 'Beneficiary name is required'
      if (!form.beneficiary_relationship) errs.beneficiary_relationship = 'Relationship is required'
    }
    if (s === 1) {
      if (!form.short_description.trim()) errs.short_description = 'Short description is required'
      else if (form.short_description.trim().length < 30) errs.short_description = 'At least 30 characters required'
      if (!form.story.trim()) errs.story = 'Story is required'
      else if (form.story.trim().length < 100) errs.story = 'Story must be at least 100 characters'
    }
    if (s === 2) {
      if (!form.goal || Number(form.goal) < 100) errs.goal = 'Minimum goal is D 100'
      if (!form.deadline) errs.deadline = 'Deadline is required'
      else {
        const days = Math.ceil((new Date(form.deadline) - new Date()) / 86400000)
        if (days < 1) errs.deadline = 'Deadline must be in the future'
        if (days > 365) errs.deadline = 'Deadline cannot be more than 1 year away'
      }
    }
    return errs
  }

  function next() {
    const errs = validateStep(step)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setStep((s) => s + 1)
  }

  function back() {
    setStep((s) => s - 1)
  }

  async function handleSubmit() {
    setSubmitError('')
    const payload = {
      title: form.title.trim(),
      category: form.category,
      region: form.region,
      beneficiary: form.beneficiary.trim(),
      beneficiary_relationship: form.beneficiary_relationship,
      short_description: form.short_description.trim(),
      story: form.story.trim(),
      goal: Number(form.goal),
      deadline: form.deadline,
      is_anonymous: form.is_anonymous,
    }
    createCampaign.mutate(payload, {
      onSuccess: async (res) => {
        const slug = res?.data?.campaign?.slug
        if (slug && images.length > 0) {
          try {
            const cover = images[0]?.file || null
            const gallery = images.slice(1).map((i) => i.file).filter(Boolean)
            await updateMedia.mutateAsync({ slug, cover, gallery })
          } catch (_) {
            // media upload failure is non-fatal
          }
        }
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(IMAGES_STORAGE_KEY)
        setSubmitted(true)
        if (slug) setTimeout(() => navigate({ to: '/my-campaigns/$slug', params: { slug } }), 2500)
        else setTimeout(() => navigate({ to: ROUTES.MY_CAMPAIGNS }), 2500)
      },
      onError: (err) => {
        setSubmitError(err?.response?.data?.message || 'Failed to submit campaign. Please try again.')
      },
    })
  }

  const categoryObj = categories.find((c) => c.slug === form.category || c.id === Number(form.category))
  const minDeadline = new Date()
  minDeadline.setDate(minDeadline.getDate() + 1)

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Campaign Live!</h2>
        <p className="text-muted-foreground">Your campaign is live and ready to accept donations right away.</p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Start a Campaign"
        description="Tell your story and start raising funds in minutes."
      />

      <StepIndicator current={step} />

      {/* Step 0: Campaign Info */}
      {step === 0 && (
        <div className="space-y-5">
          <FieldGroup label="Campaign Title *" hint="A clear, compelling title (e.g. 'Help Fatou Get Kidney Surgery')" error={errors.title}>
            <TextInput value={form.title} onChange={set('title')} placeholder="Enter your campaign title" maxLength={120} />
            <p className="text-xs text-muted-foreground text-right">{form.title.length}/120</p>
          </FieldGroup>

          <FieldGroup label="Category *" error={errors.category}>
            <select value={form.category} onChange={set('category')} className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Region *" error={errors.region}>
            <select value={form.region} onChange={set('region')} className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select region in The Gambia</option>
              {GAMBIA_REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </FieldGroup>

          <div className="grid sm:grid-cols-2 gap-4">
            <FieldGroup label="Beneficiary Name *" hint="Who will receive the funds?" error={errors.beneficiary}>
              <TextInput value={form.beneficiary} onChange={set('beneficiary')} placeholder="Full name or organization" />
            </FieldGroup>
            <FieldGroup label="Your Relationship *" error={errors.beneficiary_relationship}>
              <select value={form.beneficiary_relationship} onChange={set('beneficiary_relationship')} className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select relationship</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FieldGroup>
          </div>
        </div>
      )}

      {/* Step 1: Story */}
      {step === 1 && (
        <div className="space-y-5">
          <FieldGroup label="Short Description *" hint="One or two sentences summarizing your campaign (shown on cards)" error={errors.short_description}>
            <Textarea value={form.short_description} onChange={set('short_description')} placeholder="Brief summary of why you're raising funds..." rows={3} maxLength={280} />
            <p className="text-xs text-muted-foreground text-right">{form.short_description.length}/280</p>
          </FieldGroup>

          <FieldGroup label="Your Full Story *" hint="Tell donors why this matters. Be specific and personal. Include background, the situation, how funds will be used, and your plan." error={errors.story}>
            <MarkdownEditor
              value={form.story}
              onChange={set('story')}
              placeholder={`Write your full story here...\n\nTips:\n- Explain the situation clearly\n- Describe who the beneficiary is\n- Explain exactly how the money will be used\n- Show the urgency if applicable\n\nSupports markdown: **bold**, *italic*, # headings, - lists, and [links](url)`}
            />
            <p className="text-xs text-muted-foreground text-right">{form.story.length} characters (min 100)</p>
          </FieldGroup>

          <FieldGroup label="Campaign Photos" hint="Add photos to make your campaign more compelling. The first photo becomes the cover image.">
            <ImageUploader images={images} onChange={setImages} />
          </FieldGroup>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">Campaigns with detailed, personal stories raise 3× more than vague ones. Share photos and updates regularly to build trust with donors.</p>
          </div>
        </div>
      )}

      {/* Step 2: Goal & Deadline */}
      {step === 2 && (
        <div className="space-y-5">
          <FieldGroup label="Fundraising Goal (GMD) *" hint="How much do you need to raise? Set a realistic, specific amount." error={errors.goal}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">D</span>
              <TextInput
                value={form.goal}
                onChange={set('goal')}
                type="number"
                min="100"
                placeholder="0"
                className="pl-8"
              />
            </div>
            {form.goal && Number(form.goal) >= 100 && (
              <p className="text-xs text-muted-foreground">Goal: D {Number(form.goal).toLocaleString()} GMD</p>
            )}
          </FieldGroup>

          <FieldGroup label="Campaign Deadline *" hint="When do you need the funds by? (max 1 year)" error={errors.deadline}>
            <DatePicker
              value={form.deadline}
              onChange={set('deadline')}
              min={minDeadline}
              placeholder="Select a deadline"
            />
          </FieldGroup>

          <div className="border rounded-xl p-4 bg-card space-y-3">
            <p className="text-sm font-semibold">Platform Terms</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Donations carry no platform fee — donors only pay what their payment provider charges directly</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> A {platformFeePercent}% platform fee applies when you withdraw raised funds</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Your campaign goes live immediately — no waiting for approval</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> You can withdraw raised funds at any time</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="border rounded-xl divide-y bg-card">
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Campaign Title</p>
              <p className="font-semibold">{form.title}</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <p className="text-sm font-medium">{categoryObj ? `${categoryObj.icon} ${categoryObj.name}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Region</p>
                <p className="text-sm font-medium">{GAMBIA_REGIONS.find((r) => r.value === form.region)?.label || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Beneficiary</p>
                <p className="text-sm font-medium">{form.beneficiary || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Relationship</p>
                <p className="text-sm font-medium">{form.beneficiary_relationship || '—'}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Short Description</p>
              <p className="text-sm">{form.short_description}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Story Preview</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{form.story}</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Goal</p>
                <p className="text-sm font-bold text-primary">D {Number(form.goal || 0).toLocaleString()} GMD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                <p className="text-sm font-medium">{form.deadline ? new Date(form.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">By submitting, you agree to GambiaFund's Terms of Service and confirm that all information provided is accurate and truthful. False campaigns will be suspended.</p>
          </div>
        </div>
      )}

      {submitError && (
        <p className="text-sm text-destructive flex items-center gap-1.5 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        {step > 0 ? (
          <button onClick={back} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={createCampaign.isPending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {createCampaign.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              : <><CheckCircle2 className="w-4 h-4" /> Submit Campaign</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
