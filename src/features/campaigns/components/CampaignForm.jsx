import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircle, CheckCircle2, Loader2, Building2, User as UserIcon, ShieldAlert,
} from 'lucide-react'
import { useCategories, useCreateCampaign } from '@/hooks/useCampaigns'
import { GAMBIA_REGIONS, OrganizationPermission } from '@/constants'
import { PageHeader } from '@/components/custom/PageHeader'
import { VerifyPromptModal } from '@/components/custom/VerifyPromptModal'
import { SearchSelect } from '@/components/custom/SearchSelect'
import { Select } from '@/components/custom/Select'
import { getCategoryIcon } from '@/utils/categoryIcons'
import { useMe } from '@/hooks/useAuth'
import { useActiveProfile } from '@/hooks/useActiveProfile'
import { cn } from '@/utils/cn'

const VERIFY_PROMPT_DISMISSED_KEY = 'campaign_verify_prompt_dismissed'

const STORAGE_KEY = 'campaign_draft'

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
      className={cn('w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring', className)}
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
  is_urgent: false,
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer border rounded-xl p-4 bg-card">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
          checked ? 'bg-red-500' : 'bg-muted-foreground/30',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
    </label>
  )
}

const RELATIONSHIPS = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Community', 'Organization', 'Other']

export function CampaignForm() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { isOrg, organization, hasPermission } = useActiveProfile()
  const { categories } = useCategories()
  const createCampaign = useCreateCampaign()
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false)

  useEffect(() => {
    if (!me || me.is_verified) return
    if (sessionStorage.getItem(VERIFY_PROMPT_DISMISSED_KEY)) return
    setShowVerifyPrompt(true)
  }, [me])

  function dismissVerifyPrompt() {
    sessionStorage.setItem(VERIFY_PROMPT_DISMISSED_KEY, '1')
    setShowVerifyPrompt(false)
  }

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : INITIAL
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    else if (form.title.trim().length < 10) errs.title = 'Title must be at least 10 characters'
    if (!form.category) errs.category = 'Please select a category'
    if (!form.region) errs.region = 'Please select a region'
    if (!form.beneficiary.trim()) errs.beneficiary = 'Beneficiary name is required'
    if (!form.beneficiary_relationship) errs.beneficiary_relationship = 'Relationship is required'
    return errs
  }

  function handleSubmit() {
    setSubmitError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      region: form.region,
      beneficiary: form.beneficiary.trim(),
      beneficiary_relationship: form.beneficiary_relationship,
      is_urgent: form.is_urgent,
      ...(isOrg ? { organization_id: organization.id } : {}),
    }
    createCampaign.mutate(payload, {
      onSuccess: (res) => {
        const slug = res?.data?.campaign?.slug
        localStorage.removeItem(STORAGE_KEY)
        if (slug) navigate({ to: '/my-campaigns/$slug', params: { slug } })
        else navigate({ to: '/my-campaigns' })
      },
      onError: (err) => {
        setSubmitError(err?.response?.data?.message || 'Failed to create campaign. Please try again.')
      },
    })
  }

  const canCreate = hasPermission(OrganizationPermission.CREATE_CAMPAIGN)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Start a Campaign"
        description="Tell us the basics - you'll add your story, photos, and goal next."
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 border rounded-lg px-3 py-2 mb-6">
        {isOrg ? <Building2 className="w-4 h-4 flex-shrink-0" /> : <UserIcon className="w-4 h-4 flex-shrink-0" />}
        Creating as{' '}
        <span className="font-semibold text-foreground">{isOrg ? organization.organization_name : 'yourself'}</span>
        <span className="text-xs">- switch profiles from the sidebar to create as someone else</span>
      </div>

      {!canCreate ? (
        <div className="border rounded-2xl p-8 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="font-semibold">You can't create campaigns for {organization.organization_name}</p>
          <p className="text-sm text-muted-foreground">
            Ask an organization manager to grant you the "Create Campaign" permission, or switch to your personal
            profile from the sidebar.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <FieldGroup label="Campaign Title *" hint="A clear, compelling title (e.g. 'Help Fatou Get Kidney Surgery')" error={errors.title}>
            <TextInput value={form.title} onChange={set('title')} placeholder="Enter your campaign title" maxLength={120} />
            <p className="text-xs text-muted-foreground text-right">{form.title.length}/120</p>
          </FieldGroup>

          <div className="grid sm:grid-cols-2 gap-4">
            <FieldGroup label="Category *" error={errors.category}>
              <SearchSelect
                value={form.category}
                onChange={set('category')}
                placeholder="Select a category"
                searchPlaceholder="Search categories…"
                options={categories.map((c) => ({ value: c.slug, label: c.name, icon: getCategoryIcon(c.icon) }))}
              />
            </FieldGroup>

            <FieldGroup label="Region *" error={errors.region}>
              <Select
                value={form.region}
                onChange={set('region')}
                placeholder="Select region in The Gambia"
                options={GAMBIA_REGIONS.map((r) => ({ value: r.value, label: r.label }))}
              />
            </FieldGroup>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FieldGroup label="Beneficiary Name *" hint="Who will receive the funds?" error={errors.beneficiary}>
              <TextInput value={form.beneficiary} onChange={set('beneficiary')} placeholder="Full name or organization" />
            </FieldGroup>
            <FieldGroup label="Your Relationship *" error={errors.beneficiary_relationship}>
              <Select
                value={form.beneficiary_relationship}
                onChange={set('beneficiary_relationship')}
                placeholder="Select relationship"
                options={RELATIONSHIPS.map((r) => ({ value: r, label: r }))}
              />
            </FieldGroup>
          </div>

          <Toggle
            checked={form.is_urgent}
            onChange={(v) => setForm((f) => ({ ...f, is_urgent: v }))}
            label="Mark as urgent"
            description="Urgent campaigns get a visible badge and appear in the 'Urgent' filter - use for time-sensitive needs only."
          />

          {submitError && (
            <p className="text-sm text-destructive flex items-center gap-1.5 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
            </p>
          )}

          <div className="flex items-center justify-end mt-8 pt-6 border-t">
            <button
              onClick={handleSubmit}
              disabled={createCampaign.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {createCampaign.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                : <><CheckCircle2 className="w-4 h-4" /> Create Campaign</>
              }
            </button>
          </div>
        </div>
      )}

      <VerifyPromptModal isOpen={showVerifyPrompt} onClose={dismissVerifyPrompt} />
    </div>
  )
}
