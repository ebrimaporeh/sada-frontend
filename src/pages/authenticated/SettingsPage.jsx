import { useState, useEffect, useRef } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { CheckCircle2, AlertCircle, Eye, EyeOff, Bell, Shield, Trash2, Loader2, Moon, Sun, Monitor, Smartphone, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { useChangePassword, useSetPassword, useLinkGoogleAccount, useLogout, useDeleteAccount, useMe, useUpdateMe } from '@/hooks/useAuth'
import { usePayoutMethods } from '@/hooks/usePayments'
import { useActiveProfile } from '@/hooks/useActiveProfile'
import { cn } from '@/utils/cn'

function Section({ title, description, children, className }) {
  return (
    <div className={cn('border rounded-2xl p-6 bg-card space-y-5', className)}>
      <div className="space-y-1 pb-1 border-b">
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

// Same badge as the public donation page's MethodBadge (DonateCheckout.jsx)
// -- the real provider logo, not a custom colored initial.
function MethodLogo({ method, size = 'w-8 h-8' }) {
  if (method?.logo) {
    return (
      <div className={cn(size, 'rounded-lg bg-white border flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5')}>
        <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
      </div>
    )
  }
  return (
    <div className={cn(size, 'rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', method?.color)}>
      {method?.short}
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
  const setPassword = useSetPassword()
  const linkGoogleAccount = useLinkGoogleAccount()
  const logout = useLogout()
  const deleteAccount = useDeleteAccount()
  const { data: me } = useMe()
  const updateMe = useUpdateMe()
  const { methods: PAYOUT_METHODS } = usePayoutMethods()
  // This whole page is about the logged-in individual's own account -- an
  // organization has no login/password of its own (see the org
  // verification/clarification notes), so password management specifically
  // makes no sense to show while acting as one.
  const { isOrg } = useActiveProfile()

  // Delete account
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

  function handleDeleteAccount() {
    setDeleteError('')
    deleteAccount.mutate(deletePassword, {
      onError: (err) => setDeleteError(err?.response?.data?.message || 'Failed to delete account. Please try again.'),
    })
  }

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
    // PURA's numbering reform (effective 4 Sept 2026) moves every Gambian
    // number from 7 to 9 digits, with both formats valid through a
    // transition period ending 30 Nov 2026 -- accept either length here
    // rather than only the old (or only the new) format.
    if (rawPhone) {
      const digitCount = rawPhone.replace(/\D/g, '').length
      if (digitCount !== 7 && digitCount !== 9) {
        setPaymentError('Enter a valid Gambian phone number -- 7 digits (old format) or 9 digits (new format), after +220.')
        return
      }
    }
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
  const [pwVisible, setPwVisible] = useState({ current_password: false, new_password: false, confirm_password: false })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [googleLinkError, setGoogleLinkError] = useState('')

  // Public profile privacy
  const [privacyError, setPrivacyError] = useState('')
  const showTotalRaised = me?.show_total_raised !== false

  function handleToggleShowTotalRaised(value) {
    setPrivacyError('')
    updateMe.mutate(
      { show_total_raised: value },
      { onError: (err) => setPrivacyError(err?.response?.data?.message || 'Failed to save this setting.') },
    )
  }

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

  const hasPassword = me?.has_usable_password !== false

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
    const mutation = hasPassword ? changePassword : setPassword
    const payload = hasPassword
      ? {
          old_password: pwForm.current_password,
          new_password: pwForm.new_password,
          new_password_confirm: pwForm.confirm_password,
        }
      : {
          new_password: pwForm.new_password,
          new_password_confirm: pwForm.confirm_password,
        }
    mutation.mutate(payload, {
      onSuccess: () => {
        setPwSaved(true)
        setTimeout(() => setPwSaved(false), 3000)
        setPwForm({ current_password: '', new_password: '', confirm_password: '' })
      },
      onError: (err) => {
        setPwError(err?.response?.data?.message || 'Failed to save password. Check your current password.')
      },
    })
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
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences and security." />

      <div className="flex flex-wrap items-start gap-6">
      {/* Payment settings */}
      <Section
        title="Payment Settings"
        description="Set your default mobile money account for campaign withdrawals."
        className="flex-1 min-w-[360px]"
      >
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
                  <MethodLogo method={p} />
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
            <p className="text-xs text-muted-foreground">
              This number will be pre-filled when you request a withdrawal. 7-digit (old) and 9-digit (new) formats
              are both accepted during the transition to Gambia's new numbering system.
            </p>
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

      {/* Change / set password -- your own login, not the active org's (it
          has none of its own), so this makes no sense while acting as one */}
      {!isOrg && (
        <Section
          title={hasPassword ? 'Change Password' : 'Set a Password'}
          description={
            hasPassword
              ? 'Use a strong password with at least 8 characters.'
              : 'You signed up with Google and have no password yet. Set one to also be able to log in with your email.'
          }
          className="flex-1 min-w-[360px]"
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {hasPassword && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Current Password</label>
                <PasswordInput field="current_password" placeholder="Enter current password" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">New Password</label>
              <PasswordInput field="new_password" placeholder="At least 8 characters" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Confirm New Password</label>
              <PasswordInput field="confirm_password" placeholder="Repeat new password" />
            </div>

            {pwError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {pwError}
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              {pwSaved ? (
                <span className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Password {hasPassword ? 'updated' : 'set'}
                </span>
              ) : <span />}
              <button
                type="submit"
                disabled={
                  (hasPassword ? changePassword.isPending : setPassword.isPending) ||
                  (hasPassword && !pwForm.current_password) ||
                  !pwForm.new_password ||
                  !pwForm.confirm_password
                }
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
              >
                <Shield className="w-4 h-4" />
                {(hasPassword ? changePassword.isPending : setPassword.isPending)
                  ? 'Saving…'
                  : hasPassword ? 'Update Password' : 'Set Password'}
              </button>
            </div>
          </form>
        </Section>
      )}

      {/* Connected accounts */}
      <Section
        title="Connected Accounts"
        description="Link your Google account so you can also sign in with it."
        className="flex-1 min-w-[360px]"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.5-5.5C29.6 35.4 26.9 36.3 24 36.3c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.6 39.6 16.3 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.5 5.5C41.4 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Google</p>
              <p className="text-xs text-muted-foreground">{me?.is_google_linked ? me.email : 'Not connected'}</p>
            </div>
          </div>
          {me?.is_google_linked ? (
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                setGoogleLinkError('')
                linkGoogleAccount.mutate(credentialResponse.credential, {
                  onError: (err) => setGoogleLinkError(err?.response?.data?.message || 'Failed to connect Google account.'),
                })
              }}
              onError={() => setGoogleLinkError('Google sign-in failed. Please try again.')}
            />
          )}
        </div>
        {googleLinkError && (
          <p className="text-sm text-destructive flex items-center gap-1.5 mt-3">
            <AlertCircle className="w-4 h-4" /> {googleLinkError}
          </p>
        )}
      </Section>

      {/* Public profile privacy */}
      <Section
        title="Public Profile"
        description="Control what's shown on your public fundraiser profile."
        className="flex-1 min-w-[360px]"
      >
        <Toggle
          checked={showTotalRaised}
          onChange={handleToggleShowTotalRaised}
          label="Show total raised"
          description="Display the total amount raised across your campaigns on your public profile"
        />
        {privacyError && (
          <p className="text-sm text-destructive flex items-center gap-1.5 mt-3">
            <AlertCircle className="w-4 h-4" /> {privacyError}
          </p>
        )}
      </Section>
      </div>

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
          <div className="p-4 border border-destructive/30 rounded-xl bg-destructive/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Removes your personal information and signs you out for good. Your campaigns and
                  donation history stay intact for other donors and for financial record-keeping, but
                  are no longer linked to your name. This cannot be undone.
                </p>
              </div>
              {!isDeleteMode && (
                <button
                  type="button"
                  onClick={() => { setIsDeleteMode(true); setDeletePassword(''); setDeleteError('') }}
                  className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-medium text-destructive border border-destructive/40 px-4 py-2 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              )}
            </div>

            {isDeleteMode && (
              <div className="border-t border-destructive/20 pt-4 space-y-3">
                {hasPassword && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Enter your password to confirm</label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-destructive"
                    />
                  </div>
                )}

                {deleteError && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> {deleteError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteMode(false)}
                    disabled={deleteAccount.isPending}
                    className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteAccount.isPending || (hasPassword && !deletePassword)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {deleteAccount.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {deleteAccount.isPending ? 'Deleting…' : 'Permanently Delete My Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  )
}
