import { useState, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { Camera, CheckCircle2, ShieldCheck, ShieldQuestion, Loader2, AlertCircle } from 'lucide-react'
import { useMe } from '@/hooks/useAuth'
import { useUpdateMe, useUploadAvatar } from '@/hooks/useUsers'
import { compressImage } from '@/utils/imageCompression'
import { PageHeader } from '@/components/custom/PageHeader'
import { Select } from '@/components/custom/Select'
import { initials } from '@/utils/formatters'
import { GAMBIA_REGIONS, ROUTES } from '@/constants'
import { hasResourceAccess, Resource } from '@/utils/permissions'

// Stored phone numbers aren't consistently formatted (some carry a leading
// "+220", some don't -- see seed data vs. the donate flow) -- strip it so
// the field's own "+220" prefix badge never doubles up with a value that
// already has it.
function stripCountryCode(phone) {
  return (phone || '').replace(/^\+220\s*/, '')
}

function Field({ label, hint, error, children }) {
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

function Input({ value, onChange, type = 'text', placeholder, prefix, ...props }) {
  if (prefix) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">{prefix}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          {...props}
        />
      </div>
    )
  }
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
      {...props}
    />
  )
}

export function UserProfile() {
  const { data: user } = useMe()
  const updateMe = useUpdateMe()
  const uploadAvatar = useUploadAvatar()
  const fileRef = useRef()
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarError, setAvatarError] = useState('')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: stripCountryCode(user?.phone),
    region: user?.region || '',
    bio: user?.bio || '',
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarError('')
    const compressed = await compressImage(file, 'avatar')
    uploadAvatar.mutate(compressed, {
      onError: (err) => setAvatarError(err?.response?.data?.message || 'Could not upload avatar.'),
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form }
    if (payload.phone) payload.phone = `+220${payload.phone.trim()}`
    updateMe.mutate(payload, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  const displayName = form.first_name ? `${form.first_name} ${form.last_name}`.trim() : user?.email || ''

  const verificationRoute = hasResourceAccess(user?.resources, Resource.VERIFICATIONS_VIEW)
    ? ROUTES.ADMIN_VERIFICATION
    : ROUTES.VERIFICATION

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Your Profile" description="Manage your personal information and public identity." />

      {/* Avatar section */}
      <div className="border rounded-2xl p-6 bg-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative flex-shrink-0">
          <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold overflow-hidden">
            {avatarPreview || user?.avatar
              ? <img src={avatarPreview || user?.avatar} alt="avatar" className="w-full h-full object-cover" />
              : initials(displayName || user?.email)
            }
            {uploadAvatar.isPending && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary border-2 border-card flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <p className="font-bold text-lg">{displayName || user?.email}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
            {user?.is_verified ? (
              <Link
                to={verificationRoute}
                className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </Link>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                  Not verified
                </span>
                <Link
                  to={verificationRoute}
                  className="inline-flex items-center gap-1 text-xs border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-full font-medium transition-colors"
                >
                  <ShieldQuestion className="w-3.5 h-3.5" /> Verify Now
                </Link>
              </>
            )}
            <span className="text-xs text-muted-foreground capitalize bg-muted px-2.5 py-1 rounded-full">{user?.role}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Click the camera icon to upload a profile photo</p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-[2] min-w-[360px] border rounded-2xl p-6 bg-card space-y-5">
        <h2 className="font-semibold text-base">Personal Information</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First Name">
            <Input value={form.first_name} onChange={set('first_name')} placeholder="Ousman" />
          </Field>
          <Field label="Last Name">
            <Input value={form.last_name} onChange={set('last_name')} placeholder="Camara" />
          </Field>
        </div>

        <Field label="Phone Number" hint="Used for mobile money contact and account security">
          <Input
            value={form.phone}
            onChange={set('phone')}
            type="tel"
            placeholder="7XXXXXXX"
            prefix="+220"
          />
        </Field>

        <Field label="Region" hint="Your region in The Gambia">
          <Select
            value={form.region}
            onChange={set('region')}
            placeholder="Select your region"
            options={GAMBIA_REGIONS.map((r) => ({ value: r.value, label: r.label }))}
          />
        </Field>

        <Field label="Bio" hint="Tell donors a bit about yourself (shown on your campaigns)">
          <textarea
            value={form.bio}
            onChange={set('bio')}
            placeholder="Community organizer and fundraising advocate from Banjul…"
            rows={4}
            maxLength={400}
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{form.bio.length}/400</p>
        </Field>

        <div className="pt-2 flex items-center justify-between gap-4 border-t">
          {saved ? (
            <span className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Saved successfully
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={updateMe.isPending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {updateMe.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Sidebar: account */}
      <div className="flex-1 min-w-[300px] space-y-6">
        {/* Email (read-only) */}
        <div className="border rounded-2xl p-6 bg-card space-y-4">
          <h2 className="font-semibold text-base">Account</h2>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email Address</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="flex-1 px-3 py-2.5 border rounded-lg text-sm bg-muted text-muted-foreground cursor-not-allowed"
              />
              {user?.email_verified && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here. Contact support if needed.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
