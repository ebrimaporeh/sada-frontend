import { useState } from 'react'
import { AlertCircle, ChevronRight, ChevronLeft, Info, Loader2, Rocket } from 'lucide-react'
import { useUpdateMyCampaign, useLaunchCampaign } from '@/hooks/useCampaigns'
import { StepIndicator } from '@/components/custom/StepIndicator'
import { MarkdownEditor } from '@/components/custom/MarkdownEditor'
import { DatePicker } from '@/components/custom/DatePicker'
import { CampaignPhotosCard } from '@/pages/authenticated/MyCampaignDetail/EditTab'
import { GAMBIA_REGIONS } from '@/constants'
import { cn } from '@/utils/cn'

const STEPS = ['Your Story', 'Images', 'Goal & Deadline', 'Review & Launch']

// Which step a field-keyed launch error should point back at - keeps a
// rejected launch attempt actionable instead of just "something's wrong".
const FIELD_STEP = {
  short_description: 0,
  story: 0,
  cover_image: 1,
  goal: 2,
}

function hasCover(campaign) {
  return (campaign.images ?? []).some((img) => img.is_cover)
}

// No dedicated "current step" field on the backend -- derived from what's
// actually filled in so it can never drift from reality (e.g. editing story
// directly from a later step and reloading still resumes in the right place).
function deriveInitialStep(campaign) {
  if (!campaign.story || campaign.story.trim().length < 100 || !campaign.short_description) return 0
  if (!hasCover(campaign)) return 1
  if (!campaign.goal || Number(campaign.goal) <= 0) return 2
  return 3
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

export function CampaignSetupStepper({ campaign, onLaunched }) {
  const [step, setStep] = useState(() => deriveInitialStep(campaign))
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const updateCampaign = useUpdateMyCampaign()
  const launchCampaign = useLaunchCampaign()

  const [story, setStory] = useState({
    short_description: campaign.short_description || '',
    story: campaign.story || '',
  })
  const [goalForm, setGoalForm] = useState({
    goal: String(campaign.goal || ''),
    deadline: campaign.deadline || '',
    hasDeadline: Boolean(campaign.deadline),
  })

  const minDeadline = new Date()
  minDeadline.setDate(minDeadline.getDate() + 1)

  function saveStory(onDone) {
    setSaveError('')
    const errs = {}
    if (!story.short_description.trim()) errs.short_description = 'Short description is required'
    else if (story.short_description.trim().length < 30) errs.short_description = 'At least 30 characters required'
    if (!story.story.trim()) errs.story = 'Story is required'
    else if (story.story.trim().length < 100) errs.story = 'Story must be at least 100 characters'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    updateCampaign.mutate(
      { slug: campaign.slug, short_description: story.short_description.trim(), story: story.story.trim() },
      {
        onSuccess: onDone,
        onError: (err) => setSaveError(err?.response?.data?.message || 'Failed to save your story.'),
      },
    )
  }

  function saveGoal(onDone) {
    setSaveError('')
    const errs = {}
    if (!goalForm.goal || Number(goalForm.goal) < 100) errs.goal = 'Minimum goal is D 100'
    if (goalForm.hasDeadline) {
      if (!goalForm.deadline) errs.deadline = 'Deadline is required'
      else {
        const days = Math.ceil((new Date(goalForm.deadline) - new Date()) / 86400000)
        if (days < 1) errs.deadline = 'Deadline must be in the future'
        if (days > 365) errs.deadline = 'Deadline cannot be more than 1 year away'
      }
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    updateCampaign.mutate(
      {
        slug: campaign.slug,
        goal: Number(goalForm.goal),
        deadline: goalForm.hasDeadline ? goalForm.deadline : null,
      },
      {
        onSuccess: onDone,
        onError: (err) => setSaveError(err?.response?.data?.message || 'Failed to save your goal.'),
      },
    )
  }

  function next() {
    if (step === 0) { saveStory(() => setStep(1)); return }
    if (step === 2) { saveGoal(() => setStep(3)); return }
    setStep((s) => s + 1)
  }

  function back() {
    setSaveError('')
    setStep((s) => s - 1)
  }

  function handleLaunch() {
    setSaveError('')
    launchCampaign.mutate(campaign.slug, {
      onSuccess: (res) => onLaunched(res?.data?.campaign),
      onError: (err) => {
        const data = err?.response?.data
        const firstField = Object.keys(data?.errors || {})[0]
        if (firstField && FIELD_STEP[firstField] !== undefined) setStep(FIELD_STEP[firstField])
        setSaveError(data?.message || 'Failed to launch campaign. Please try again.')
      },
    })
  }

  const cover = (campaign.images ?? []).find((img) => img.is_cover)
  const isSaving = updateCampaign.isPending

  return (
    <div className="max-w-3xl mx-auto">
      <StepIndicator steps={STEPS} current={step} />

      {step === 0 && (
        <div className="space-y-5">
          <FieldGroup label="Short Description *" hint="One or two sentences summarizing your campaign (shown on cards)" error={errors.short_description}>
            <textarea
              value={story.short_description}
              onChange={(e) => setStory((f) => ({ ...f, short_description: e.target.value }))}
              placeholder="Brief summary of why you're raising funds..."
              rows={2}
              maxLength={280}
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{story.short_description.length}/280</p>
          </FieldGroup>

          <FieldGroup label="Your Full Story *" hint="Tell donors why this matters. Be specific and personal." error={errors.story}>
            <MarkdownEditor
              value={story.story}
              onChange={(e) => setStory((f) => ({ ...f, story: e.target.value }))}
              placeholder={`Write your full story here...\n\nTips:\n- Explain the situation clearly\n- Describe who the beneficiary is\n- Explain exactly how the money will be used\n\nSupports markdown: **bold**, *italic*, # headings, - lists, and [links](url)`}
            />
            <p className="text-xs text-muted-foreground text-right">{story.story.length} characters (min 100)</p>
          </FieldGroup>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">Campaigns with detailed, personal stories raise 3× more than vague ones.</p>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <CampaignPhotosCard campaign={campaign} />
          {!cover && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> A cover image is required before you can launch.
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <FieldGroup label="Fundraising Goal (GMD) *" hint="How much do you need to raise?" error={errors.goal}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">D</span>
                <input
                  value={goalForm.goal}
                  onChange={(e) => setGoalForm((f) => ({ ...f, goal: e.target.value }))}
                  type="number"
                  min="100"
                  placeholder="0"
                  className="w-full pl-8 px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
            </FieldGroup>

            <FieldGroup
              label={goalForm.hasDeadline ? 'Campaign Deadline *' : 'Campaign Deadline'}
              hint={goalForm.hasDeadline ? 'When do you need the funds by? (max 1 year)' : 'No end date - see the toggle below.'}
              error={errors.deadline}
            >
              <DatePicker
                value={goalForm.deadline}
                onChange={(e) => setGoalForm((f) => ({ ...f, deadline: e.target.value }))}
                min={minDeadline}
                placeholder="Select a deadline"
                disabled={!goalForm.hasDeadline}
              />
            </FieldGroup>
          </div>

          <label className="flex items-start justify-between gap-4 cursor-pointer border rounded-xl p-4 bg-card">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">This campaign has no end date</p>
              <p className="text-xs text-muted-foreground mt-0.5">It stays open-ended until you manually complete it, or it reaches its goal.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!goalForm.hasDeadline}
              onClick={() => setGoalForm((f) => ({ ...f, hasDeadline: !f.hasDeadline, deadline: f.hasDeadline ? '' : f.deadline }))}
              className={cn(
                'relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
                !goalForm.hasDeadline ? 'bg-red-500' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                  !goalForm.hasDeadline ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="border rounded-xl divide-y bg-card">
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Campaign Title</p>
              <p className="font-semibold">{campaign.title}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Short Description</p>
              <p className="text-sm">{story.short_description || '-'}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Story Preview</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{story.story || '-'}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Cover Photo</p>
              {cover ? (
                <img src={cover.image_url} alt="Cover" className="w-32 aspect-video object-cover rounded-lg border" />
              ) : (
                <p className="text-sm text-destructive">Not added yet</p>
              )}
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Goal</p>
                <p className="text-sm font-bold text-primary">D {Number(goalForm.goal || 0).toLocaleString()} GMD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                <p className="text-sm font-medium">
                  {goalForm.hasDeadline && goalForm.deadline
                    ? new Date(goalForm.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'No end date - ongoing campaign'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Region</p>
                <p className="text-sm font-medium">{GAMBIA_REGIONS.find((r) => r.value === campaign.region)?.label || campaign.region || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">Once you launch, your campaign goes live immediately and can accept donations. Review everything above before continuing.</p>
          </div>
        </div>
      )}

      {saveError && (
        <p className="text-sm text-destructive flex items-center gap-1.5 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
        </p>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        {step > 0 ? (
          <button onClick={back} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Continue <ChevronRight className="w-4 h-4" /></>}
          </button>
        ) : (
          <button
            onClick={handleLaunch}
            disabled={launchCampaign.isPending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {launchCampaign.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Launching…</>
              : <><Rocket className="w-4 h-4" /> Launch Campaign</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
