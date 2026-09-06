import { Link, useParams, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Heart, ArrowRight, Loader2, Clock, XCircle } from 'lucide-react'
import { usePublicOrganization } from '@/hooks/useOrganizations'
import { useVerifyOrganizationDonation } from '@/hooks/useDonations'
import { formatGMD } from '@/utils/formatters'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ROUTES } from '@/constants'

// Organization-donation counterpart to DonateSuccessPage -- no campaign
// progress/goal to reference, and shares back to the org's own /give page.
export function OrganizationDonateSuccessPage() {
  const { slug } = useParams({ strict: false })
  const search = useSearch({ strict: false })
  const { data: organization } = usePublicOrganization(slug)
  const reference = search?.ref
  const { data: verifyData, isLoading: isVerifying } = useVerifyOrganizationDonation(reference, organization?.id)

  usePageMeta({ title: 'Thank You', noindex: true })

  const donation = verifyData?.data?.donation
  const donationStatus = donation?.status
  const amount = Number(donation?.amount ?? search?.amount) || 0

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            {isVerifying ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : donationStatus === 'failed' ? (
              <XCircle className="w-10 h-10 text-destructive" />
            ) : donationStatus === 'paid' ? (
              <CheckCircle2 className="w-10 h-10 text-primary" />
            ) : (
              <Clock className="w-10 h-10 text-primary" />
            )}
          </div>
          {donationStatus !== 'failed' && (
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-donate flex items-center justify-center">
              <Heart className="w-4 h-4 text-donate-foreground fill-donate-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {isVerifying ? 'Confirming your donation…' : donationStatus === 'failed' ? 'Payment Not Completed' : 'Thank You!'}
        </h1>
        {amount > 0 && (
          <p className="text-muted-foreground">
            {donationStatus === 'failed' ? (
              <>Your attempted donation of <span className="font-bold">{formatGMD(amount)}</span> was not completed.</>
            ) : (
              <>Your donation of <span className="font-bold text-primary">{formatGMD(amount)}</span> has been received.</>
            )}
          </p>
        )}
        {organization && (
          <p className="text-muted-foreground text-sm">
            You're supporting: <span className="font-semibold text-foreground">{organization.organization_name}</span>
          </p>
        )}
      </div>

      {donationStatus === 'failed' ? (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 space-y-2 text-sm text-left">
          <p className="font-semibold">What happened?</p>
          <p className="text-muted-foreground">
            Our payment provider reported this payment didn't go through. No funds were charged. You can try donating
            again from this organization's page.
          </p>
        </div>
      ) : (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-2 text-sm">
          <p className="font-semibold">What happens next?</p>
          <ul className="space-y-1.5 text-muted-foreground text-left">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              {donationStatus === 'paid' ? 'Your payment has been confirmed' : 'Your payment is being processed'}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              The organization will be notified immediately
            </li>
            {donationStatus !== 'paid' && (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                You'll receive a confirmation once the payment is confirmed
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {organization && (
          <Link
            to="/give/$slug"
            params={{ slug: organization.slug }}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            Back to {organization.organization_name} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <Link to={ROUTES.CAMPAIGNS} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
        Browse campaigns <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
