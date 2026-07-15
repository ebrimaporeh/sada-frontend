import { useEffect, useRef, useState } from 'react'
import { Percent, Save, CheckCircle2, AlertCircle, Image as ImageIcon, Upload, HandHeart } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { usePlatformSettings, useUpdatePlatformSettings } from '@/hooks/usePayments'
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings'
import { useZakatSettings, useUpdateZakatSettings } from '@/hooks/useZakat'
import { formatGMD } from '@/utils/formatters'

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

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" description="Branding, fees, and platform-wide configuration" />

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

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <SiteBrandingCard onNotify={showNotification} />

        <div className="space-y-6">
          <ZakatSettingsCard onNotify={showNotification} />

          <div className="border rounded-xl bg-card p-5 space-y-4">
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
        </div>
      </div>
    </div>
  )
}

function LogoUpload({ label, hint, currentUrl, onFileSelected, preview, surfaceClassName }) {
  const fileRef = useRef()

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    onFileSelected(file)
  }

  const displaySrc = preview || currentUrl

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="flex items-center gap-4">
        <div className={`w-24 h-24 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${surfaceClassName}`}>
          {displaySrc ? (
            <img src={displaySrc} alt={label} className="max-w-full max-h-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
        >
          <Upload className="w-3.5 h-3.5" /> Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
    </div>
  )
}

function ZakatSettingsCard({ onNotify }) {
  const { settings: zakatSettings, isLoading } = useZakatSettings()
  const updateZakatSettings = useUpdateZakatSettings()

  const [form, setForm] = useState(null)

  useEffect(() => {
    if (zakatSettings && !form) {
      setForm({
        nisab_basis: zakatSettings.nisab_basis,
        nisab_gold_grams: String(zakatSettings.nisab_gold_grams),
        nisab_silver_grams: String(zakatSettings.nisab_silver_grams),
        gold_price_per_gram: String(zakatSettings.gold_price_per_gram),
        silver_price_per_gram: String(zakatSettings.silver_price_per_gram),
        zakat_percentage: String(zakatSettings.zakat_percentage),
        minimum_amount_override: zakatSettings.minimum_amount_override != null ? String(zakatSettings.minimum_amount_override) : '',
      })
    }
  }, [zakatSettings, form])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    const percentage = Number(form.zakat_percentage)
    if (!form.zakat_percentage || Number.isNaN(percentage) || percentage <= 0 || percentage > 100) {
      onNotify('error', 'Enter a Zakat percentage between 0 and 100.')
      return
    }
    updateZakatSettings.mutate(
      {
        nisab_basis: form.nisab_basis,
        nisab_gold_grams: form.nisab_gold_grams || '0',
        nisab_silver_grams: form.nisab_silver_grams || '0',
        gold_price_per_gram: form.gold_price_per_gram || '0',
        silver_price_per_gram: form.silver_price_per_gram || '0',
        zakat_percentage: form.zakat_percentage,
        minimum_amount_override: form.minimum_amount_override === '' ? null : form.minimum_amount_override,
      },
      {
        onSuccess: () => onNotify('success', 'Zakat settings updated.'),
        onError: (err) => onNotify('error', err?.response?.data?.message || 'Could not update Zakat settings.'),
      },
    )
  }

  if (isLoading || !form) {
    return (
      <div className="border rounded-xl bg-card p-5 w-full">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="border rounded-xl bg-card p-5 w-full space-y-5">
      <div>
        <h2 className="font-semibold flex items-center gap-2">
          <HandHeart className="w-4 h-4" /> Zakat Calculator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Nisab is computed from a gold or silver weight and its current price — keep the price per gram
          up to date, or set a flat override below to skip that calculation entirely.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nisab basis</label>
        <div className="flex gap-2">
          {['silver', 'gold'].map((basis) => (
            <button
              key={basis}
              type="button"
              onClick={() => setForm((f) => ({ ...f, nisab_basis: basis }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                form.nisab_basis === basis ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
              }`}
            >
              {basis}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Gold weight (g)</label>
          <input
            type="number" min="0" step="0.01"
            value={form.nisab_gold_grams}
            onChange={set('nisab_gold_grams')}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Gold price / g (D)</label>
          <input
            type="number" min="0" step="0.01"
            value={form.gold_price_per_gram}
            onChange={set('gold_price_per_gram')}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Silver weight (g)</label>
          <input
            type="number" min="0" step="0.01"
            value={form.nisab_silver_grams}
            onChange={set('nisab_silver_grams')}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Silver price / g (D)</label>
          <input
            type="number" min="0" step="0.01"
            value={form.silver_price_per_gram}
            onChange={set('silver_price_per_gram')}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Zakat percentage</label>
          <div className="relative">
            <input
              type="number" min="0" max="100" step="0.01"
              value={form.zakat_percentage}
              onChange={set('zakat_percentage')}
              className="w-full pr-8 pl-3 py-2 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Flat nisab override (D)</label>
          <input
            type="number" min="0" step="0.01"
            value={form.minimum_amount_override}
            onChange={set('minimum_amount_override')}
            placeholder="Optional"
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground border-t pt-3">
        Current nisab threshold: <span className="font-semibold text-foreground">{formatGMD(zakatSettings.nisab_amount)}</span>
      </p>

      <button
        onClick={handleSave}
        disabled={updateZakatSettings.isPending}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {updateZakatSettings.isPending ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}

function SiteBrandingCard({ onNotify }) {
  const { siteName, siteDescription, logo, logoWithBackground, isLoading } = useSiteSettings()
  const updateSiteSettings = useUpdateSiteSettings()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const logoFile = useRef(null)
  const logoWithBgFile = useRef(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoWithBgPreview, setLogoWithBgPreview] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!isLoading && !hydrated) {
      setName(siteName)
      setDescription(siteDescription)
      setHydrated(true)
    }
  }, [isLoading, hydrated, siteName, siteDescription])

  const handleSave = () => {
    if (!name.trim()) {
      onNotify('error', 'Site name cannot be blank.')
      return
    }
    const payload = { site_name: name.trim(), site_description: description }
    if (logoFile.current) payload.logo = logoFile.current
    if (logoWithBgFile.current) payload.logo_with_background = logoWithBgFile.current

    updateSiteSettings.mutate(payload, {
      onSuccess: () => {
        logoFile.current = null
        logoWithBgFile.current = null
        setLogoPreview(null)
        setLogoWithBgPreview(null)
        onNotify('success', 'Site branding updated.')
      },
      onError: (err) => onNotify('error', err?.response?.data?.message || 'Could not update site branding.'),
    })
  }

  return (
    <div className="border rounded-xl bg-card p-5 w-full space-y-5">
      <div>
        <h2 className="font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Site Branding
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          The name, description, and logo shown across the site — nav, footer, login, and emails.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Site name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Site description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <LogoUpload
            label="Logo (transparent)"
            hint="Used on light surfaces — nav bar, login, footer."
            currentUrl={logo}
            preview={logoPreview}
            surfaceClassName="bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:12px_12px]"
            onFileSelected={(file) => {
              logoFile.current = file
              setLogoPreview(URL.createObjectURL(file))
            }}
          />

          <LogoUpload
            label="Logo (with background)"
            hint="Used on dark surfaces where the transparent logo would lose contrast."
            currentUrl={logoWithBackground}
            preview={logoWithBgPreview}
            surfaceClassName="bg-muted"
            onFileSelected={(file) => {
              logoWithBgFile.current = file
              setLogoWithBgPreview(URL.createObjectURL(file))
            }}
          />

          <button
            onClick={handleSave}
            disabled={updateSiteSettings.isPending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {updateSiteSettings.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      )}
    </div>
  )
}
