import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Calculator, Info, CheckCircle2, XCircle, HandHeart, ArrowRight } from 'lucide-react'
import { useZakatSettings, useCalculateZakat, useRecommendedCampaigns } from '@/hooks/useZakat'
import { CampaignCard } from '@/components/custom/CampaignCard'
import { CampaignCardSkeleton } from '@/components/custom/CampaignCardSkeleton'
import { formatGMD } from '@/utils/formatters'

const FIELDS = [
  { key: 'cash_and_savings', label: 'Cash & savings', hint: 'Cash on hand, bank balances, mobile money.' },
  { key: 'gold_and_silver_value', label: 'Gold & silver', hint: 'Current market value of gold/silver you own.' },
  { key: 'business_assets', label: 'Business assets', hint: 'Trade inventory and stock held for resale.' },
  { key: 'investments', label: 'Investments', hint: 'Shares, sukuk, or other holdings.' },
  { key: 'money_owed_to_you', label: 'Money owed to you', hint: 'Loans or debts you expect to be repaid.' },
  { key: 'debts_you_owe', label: 'Debts you owe', hint: 'Deducted before comparing to nisab.' },
]

const emptyForm = Object.fromEntries(FIELDS.map((f) => [f.key, '']))

export function ZakatCalculator() {
  const { settings: zakatSettings, isLoading: settingsLoading } = useZakatSettings()
  const calculate = useCalculateZakat()
  const [form, setForm] = useState(emptyForm)
  const [result, setResult] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const { campaigns, isLoading: campaignsLoading } = useRecommendedCampaigns(10, {
    enabled: Boolean(result?.is_eligible),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = Object.fromEntries(FIELDS.map((f) => [f.key, form[f.key] || '0']))
    calculate.mutate(payload, { onSuccess: (data) => setResult(data) })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
          <Calculator className="w-7 h-7 text-primary" /> Zakat Calculator
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Work out how much Zakat you owe on your wealth, and find campaigns eligible to receive it.
          {!settingsLoading && zakatSettings && (
            <>
              {' '}Zakat is due at <strong>{zakatSettings.zakat_percentage}%</strong> of your wealth once it
              reaches the nisab threshold — currently <strong>{formatGMD(zakatSettings.nisab_amount)}</strong>.
            </>
          )}
        </p>
      </div>

      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 flex items-start gap-3 text-sm">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800">
          This calculator gives an estimate and a starting shortlist of eligible campaigns — it isn't a
          religious ruling. If you're unsure about your specific situation, please consult a knowledgeable
          scholar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border rounded-xl bg-card p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium">{f.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">D</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[f.key]}
                  onChange={set(f.key)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 border rounded-lg bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-xs text-muted-foreground">{f.hint}</p>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={calculate.isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-60"
        >
          <Calculator className="w-4 h-4" />
          {calculate.isPending ? 'Calculating…' : 'Calculate Zakat'}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className={`border rounded-xl p-5 sm:p-6 space-y-4 ${result.is_eligible ? 'bg-primary/5 border-primary/20' : 'bg-muted/40'}`}>
            <div className="flex items-center gap-2">
              {result.is_eligible ? (
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <h2 className="font-bold text-lg">
                {result.is_eligible ? 'Zakat is due on your wealth' : 'Zakat is not due yet'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Zakatable wealth</p>
                <p className="font-semibold">{formatGMD(result.zakatable_wealth)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Nisab threshold</p>
                <p className="font-semibold">{formatGMD(result.nisab_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Zakat due ({result.zakat_percentage}%)</p>
                <p className="font-bold text-primary text-base">{formatGMD(result.zakat_due)}</p>
              </div>
            </div>

            {!result.is_eligible && (
              <p className="text-sm text-muted-foreground">
                Your zakatable wealth is below the nisab threshold, so Zakat isn't obligatory right now —
                but you're always welcome to give voluntary sadaqah to any campaign.
              </p>
            )}
          </div>

          {result.is_eligible && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Campaigns eligible for your Zakat</h2>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">
                Screened to exclude campaigns outside Zakat's eight eligible categories — review each one
                yourself before giving.
              </p>

              {campaignsLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => <CampaignCardSkeleton key={i} />)}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="border rounded-xl p-8 text-center text-muted-foreground text-sm">
                  No eligible campaigns right now — check back soon.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {campaigns.map((c) => (
                    <div key={c.id} className="space-y-2">
                      <CampaignCard campaign={c} />
                      <Link
                        to="/donate/$slug"
                        params={{ slug: c.slug }}
                        search={{ amount: result.zakat_due }}
                        className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        Pay Zakat here <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
