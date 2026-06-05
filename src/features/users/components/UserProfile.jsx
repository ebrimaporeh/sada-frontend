import { useState, useRef } from 'react'
import { Camera, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react'
import { useMe } from '@/hooks/useAuth'
import { useUpdateMe } from '@/hooks/useUsers'
import { PageHeader } from '@/components/custom/PageHeader'
import { initials } from '@/utils/formatters'
import { GAMBIA_REGIONS } from '@/constants'
import { cn } from '@/utils/cn'

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
          className="w-full pl-12 pr-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
      className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      {...props}
    />
  )
}

export function UserProfile() {
  const { data: user } = useMe()
  const updateMe = useUpdateMe()
  const fileRef = useRef()
  const avatarFile = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    region: user?.region || '',
    bio: user?.bio || '',
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    avatarFile.current = file
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form }
    if (avatarFile.current) {
      payload.avatar = avatarFile.current
    }
    updateMe.mutate(payload, {
      onSuccess: () => {
        avatarFile.current = null
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  const displayName = form.first_name
    ? `${form.first_name} ${form.last_name}`.trim()
    : user?.email || ''

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageHeader title="Your Profile" description="Manage your personal information and public identity." />

      {/* Avatar section */}
      <div className="border rounded-2xl p-6 bg-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold overflow-hidden">
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              : initials(displayName || user?.email)
            }
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
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
            {user?.is_verified ? (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                Not verified
              </span>
            )}
            <span className="text-xs text-muted-foreground capitalize bg-muted px-2.5 py-1 rounded-full">{user?.role}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Click the camera icon to upload a profile photo</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="border rounded-2xl p-6 bg-card space-y-5">
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
          <select
            value={form.region}
            onChange={set('region')}
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select your region</option>
            {GAMBIA_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Bio" hint="Tell donors a bit about yourself (shown on your campaigns)">
          <textarea
            value={form.bio}
            onChange={set('bio')}
            placeholder="Community organizer and fundraising advocate from Banjul…"
            rows={4}
            maxLength={400}
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
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

      {/* ID Verification */}
      <div className="border rounded-2xl p-6 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Identity Verification</h2>
          {user?.is_verified
            ? <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Verified</span>
            : <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">Not verified</span>
          }
        </div>
        <p className="text-sm text-muted-foreground">
          Verified campaign owners build more trust with donors. Upload a government-issued ID to get a verification badge on your campaigns.
        </p>
        {!user?.is_verified && (
          <button
            type="button"
            className="inline-flex items-center gap-2 border font-medium px-4 py-2 rounded-xl hover:bg-muted transition-colors text-sm"
          >
            <ShieldCheck className="w-4 h-4" /> Submit ID for Verification
          </button>
        )}
      </div>
    </div>
  )
}
