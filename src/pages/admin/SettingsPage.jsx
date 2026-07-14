import { useEffect, useState } from 'react'
import { Percent, Save, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { usePlatformSettings, useUpdatePlatformSettings } from '@/hooks/usePayments'
import { cn } from '@/utils/cn'

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-60',
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
  )
}

export function SettingsPage() {
  const { data: platformSettings, isLoading } = usePlatformSettings()
  const updateSettings = useUpdatePlatformSettings()

  const [feePercent, setFeePercent] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (platformSettings?.platform_fee_percent != null) {
      setFeePercent(String(platformSettings.platform_fee_percent))
    }
  }, [platformSettings])

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleSave = () => {
    const value = Number(feePercent)
    if (!feePercent || Number.isNaN(value) || value < 0 || value > 100) {
      showNotification('error', 'Enter a fee between 0 and 100.')
      return
    }
    updateSettings.mutate(
      { platform_fee_percent: value },
      {
        onSuccess: () => showNotification('success', 'Platform fee updated.'),
        onError: (err) => showNotification('error', err?.response?.data?.message || 'Could not update platform fee.'),
      },
    )
  }

  const handleToggleCardPayments = (enabled) => {
    updateSettings.mutate(
      { card_payments_enabled: enabled },
      {
        onSuccess: () => showNotification('success', `Card payments ${enabled ? 'enabled' : 'disabled'}.`),
        onError: (err) => showNotification('error', err?.response?.data?.message || 'Could not update card payments setting.'),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" description="Fees and platform-wide configuration" />

      {notification && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      <div className="border rounded-xl bg-card p-5 max-w-md space-y-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Percent className="w-4 h-4" /> Payout Platform Fee
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Percentage the platform takes from each campaign payout when an owner withdraws funds.
            Donations themselves carry no platform fee — donors only pay whatever their payment
            provider charges directly.
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fee percentage</label>
              <div className="relative max-w-[160px]">
                <input
                  type="number"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full pr-8 pl-3 py-2.5 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-lg font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">%</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {updateSettings.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        )}
      </div>

      <div className="border rounded-xl bg-card p-5 max-w-md space-y-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Card Payments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Let donors pay by Visa/Mastercard via ModemPay, alongside mobile money. Keep this off
            until card processing is confirmed live on your ModemPay account — ModemPay's API
            currently accepts the request but its checkout doesn't render a card option yet.
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span className="text-sm font-medium">Enable card payments</span>
            <Toggle
              checked={!!platformSettings?.card_payments_enabled}
              onChange={handleToggleCardPayments}
              disabled={updateSettings.isPending}
            />
          </label>
        )}
      </div>
    </div>
  )
}
