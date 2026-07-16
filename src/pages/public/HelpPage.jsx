import { Link } from '@tanstack/react-router'
import { useLegalContent } from '@/hooks/useLegalContent'
import { MarkdownContent } from '@/components/custom/MarkdownEditor'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES } from '@/constants'

export function HelpPage() {
  const { content, isLoading } = useLegalContent()

  return (
    <div>
      <div className="page-header">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="section-label justify-center">
            <div className="section-label-line" />
            <span className="section-label-text">Help Center</span>
            <div className="section-label-line" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">How can we help?</h1>
          <p className="text-muted-foreground">Answers to the most common questions about GambiaFund.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card border rounded-2xl p-6 sm:p-8">
            <MarkdownContent content={content?.help_content || ''} />
          </div>
        )}

        <div className="mt-12 bg-card border rounded-2xl p-6 text-center">
          <p className="font-semibold mb-1">Still have questions?</p>
          <p className="text-sm text-muted-foreground mb-4">
            Reach out through your account, or start with the guides below.
          </p>
          <Link
            to={ROUTES.CAMPAIGNS}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Browse Campaigns
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
          <Link to={ROUTES.TRUST_SAFETY} className="hover:text-foreground transition-colors">Trust &amp; Safety</Link>
          <Link to={ROUTES.PRIVACY} className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to={ROUTES.TERMS} className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
