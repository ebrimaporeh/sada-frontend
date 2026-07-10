import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, Eye, EyeOff, Bell, Shield, Trash2, Moon, Sun, Monitor, Smartphone, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { useChangePassword, useLogout, useMe, useUpdateMe } from '@/hooks/useAuth'
import { PAYOUT_METHODS } from '@/constants'
import { cn } from '@/utils/cn'

function Section({ title, description, children }) {
  return (
    <div className="border rounded-2xl p-6 bg-card space-y-5">
      <div className="space-y-1 pb-1 border-b">
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer group">
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
          checked ? 'bg-primary' : 'bg-muted-foreground/30',
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

export function SettingsPage() {
  const changePassword = useChangePassword()
  const logout = useLogout()
  const { data: me } = useMe()
  const updateMe = useUpdateMe()

  // Payment settings — seed once when me first loads; never reset on background refetches
  const paymentSeeded = useRef(false)
  const [paymentForm, setPaymentForm] = useState({ default_payment_provider: '', default_payment_phone: '' })
  const [paymentSaved, setPaymentSaved] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    if (me && !paymentSeeded.current) {
      paymentSeeded.current = true
      setPaymentForm({
        default_payment_provider: me.default_payment_provider || '',
        default_payment_phone: (me.default_payment_phone || '').replace(/^\+220/, ''),
      })
    }
  }, [me])

  function handlePaymentSubmit(e) {
    e.preventDefault()
    setPaymentError('')
    const rawPhone = paymentForm.default_payment_phone.trim()
    const phone = rawPhone ? `+220${rawPhone}` : ''
    updateMe.mutate(
      { default_payment_provider: paymentForm.default_payment_provider, default_payment_phone: phone },
      {
        onSuccess: () => { setPaymentSaved(true); setTimeout(() => setPaymentSaved(false), 3000) },
        onError: (err) => setPaymentError(err?.response?.data?.message || 'Failed to save payment settings.'),
      },
    )
  }

  // Password
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwVisible, setPwVisible] = useState({ current: false, new: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  // Notifications — seed once when me first loads
  const notifSeeded = useRef(false)
  const [notif, setNotif] = useState({
    donations_received: true,
    campaign_approved: true,
    campaign_rejected: true,
    goal_reached: true,
    new_comment: false,
    new_update: false,
    marketing: false,
  })
  const [notifSaved, setNotifSaved] = useState(false)
  const [notifError, setNotifError] = useState('')

  useEffect(() => {
    if (me && !notifSeeded.current) {
      notifSeeded.current = true
      setNotif({
        donations_received: me.notify_donations_received ?? true,
        campaign_approved: me.notify_campaign_approved ?? true,
        campaign_rejected: me.notify_campaign_rejected ?? true,
        goal_reached: me.notify_goal_reached ?? true,
        new_comment: me.notify_new_comment ?? false,
        new_update: me.notify_new_update ?? false,
        marketing: me.notify_marketing ?? false,
      })
    }
  }, [me])

  // Theme
  const [theme, setTheme] = useState('system')

  function handlePasswordSubmit(e) {
    e.preventDefault()
    setPwError('')
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.new_password.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    changePassword.mutate(
      { current_password: pwForm.current_password, new_password: pwForm.new_password },
      {
        onSuccess: () => {
          setPwSaved(true)
          setTimeout(() => setPwSaved(false), 3000)
          setPwForm({ current_password: '', new_password: '', confirm_password: '' })
        },
        onError: (err) => {
          setPwError(err?.response?.data?.message || 'Failed to change password. Check your current password.')
        },
      },
    )
  }

  const setPw = (field) => (e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))

  function PasswordInput({ field, placeholder }) {
    const visible = pwVisible[field]
    return (
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={pwForm[field]}
          onChange={setPw(field)}
          placeholder={placeholder}
          className="w-full pl-3 pr-10 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          autoComplete={field === 'current_password' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          onClick={() => setPwVisible((v) => ({ ...v, [field]: !v[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    )
  }

  function handleNotificationSave(e) {
    e.preventDefault()
    setNotifError('')
    updateMe.mutate(
      {
        notify_donations_received: notif.donations_received,
        notify_campaign_approved: notif.campaign_approved,
        notify_campaign_rejected: notif.campaign_rejected,
        notify_goal_reached: notif.goal_reached,
        notify_new_comment: notif.new_comment,
        notify_new_update: notif.new_update,
        notify_marketing: notif.marketing,
      },
      {
        onSuccess: () => { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 3000) },
        onError: (err) => setNotifError(err?.response?.data?.message || 'Failed to save notification preferences.'),
      },
    )
  }



  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences and security." />

     

      {/* Payment settings */}
      <Section title="Payment Settings" description="Set your default mobile money account for campaign withdrawals.">
        <form onSubmit={handlePaymentSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Payment Network</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYOUT_METHODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentForm((f) => ({ ...f, default_payment_provider: p.id }))}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors',
                    paymentForm.default_payment_provider === p.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', p.color)}>
                    {p.short}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.description}</p>
                  </div>
                  {paymentForm.default_payment_provider === p.id && (
                    <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> Default Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+220</span>
              <input
                type="tel"
                value={paymentForm.default_payment_phone.replace(/^\+220/, '')}
                onChange={(e) => setPaymentForm((f) => ({ ...f, default_payment_phone: e.target.value }))}
                placeholder="7XXXXXXX"
                className="w-full pl-14 pr-4 py-2.5 border rounded-xl text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground">This number will be pre-filled when you request a withdrawal.</p>
          </div>

          {paymentError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {paymentError}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            {paymentSaved ? (
              <span className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Payment settings saved
              </span>
            ) : <span />}
            <button
              type="submit"
              disabled={updateMe.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              <CreditCard className="w-4 h-4" />
              {updateMe.isPending ? 'Saving…' : 'Save Payment Settings'}
            </button>
          </div>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change Password" description="Use a strong password with at least 8 characters.">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Current Password</label>
            <PasswordInput field="current" placeholder="Enter current password" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">New Password</label>
            <PasswordInput field="new" placeholder="At least 8 characters" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirm New Password</label>
            <PasswordInput field="confirm" placeholder="Repeat new password" />
          </div>

          {pwError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {pwError}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            {pwSaved ? (
              <span className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Password updated
              </span>
            ) : <span />}
            <button
              type="submit"
              disabled={changePassword.isPending || !pwForm.current_password || !pwForm.new_password || !pwForm.confirm_password}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              <Shield className="w-4 h-4" />
              {changePassword.isPending ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" description="Choose what you'd like to be notified about.">
        <form onSubmit={handleNotificationSave} className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign Activity</p>
          <div className="space-y-4 pl-1">
            <Toggle
              checked={notif.donations_received}
              onChange={(v) => setNotif((n) => ({ ...n, donations_received: v }))}
              label="Donations received"
              description="Get notified when someone donates to your campaign"
            />
            <Toggle
              checked={notif.campaign_approved}
              onChange={(v) => setNotif((n) => ({ ...n, campaign_approved: v }))}
              label="Campaign approved"
              description="When a moderator approves your submitted campaign"
            />
            <Toggle
              checked={notif.campaign_rejected}
              onChange={(v) => setNotif((n) => ({ ...n, campaign_rejected: v }))}
              label="Campaign rejected"
              description="When a moderator rejects your submitted campaign"
            />
            <Toggle
              checked={notif.goal_reached}
              onChange={(v) => setNotif((n) => ({ ...n, goal_reached: v }))}
              label="Goal reached"
              description="When your campaign reaches its fundraising goal"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Engagement</p>
            <div className="space-y-4 pl-1">
              <Toggle
                checked={notif.new_comment}
                onChange={(v) => setNotif((n) => ({ ...n, new_comment: v }))}
                label="New comment"
                description="When someone leaves a comment on your campaign"
              />
              <Toggle
                checked={notif.new_update}
                onChange={(v) => setNotif((n) => ({ ...n, new_update: v }))}
                label="Campaign updates"
                description="When a campaign you donated to posts an update"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Marketing</p>
            <div className="pl-1">
              <Toggle
                checked={notif.marketing}
                onChange={(v) => setNotif((n) => ({ ...n, marketing: v }))}
                label="Platform news & updates"
                description="Occasional emails about new features and Gambian campaigns"
              />
            </div>
          </div>

          {notifError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {notifError}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            {notifSaved ? (
              <span className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Notification preferences saved
              </span>
            ) : <span />}
            <button
              type="submit"
              disabled={updateMe.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              <Bell className="w-4 h-4" />
              {updateMe.isPending ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-destructive/30 rounded-xl bg-destructive/5">
            <div>
              <p className="text-sm font-semibold text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently deletes your account and all campaigns. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-medium text-destructive border border-destructive/40 px-4 py-2 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
