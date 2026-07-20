import { Link } from '@tanstack/react-router'
import { useLegalContent, useLegalVariables } from '@/hooks/useLegalContent'
import { MarkdownContent } from '@/components/custom/MarkdownEditor'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { renderLegalVariables } from '@/utils/legalVariables'
import { ROUTES } from '@/constants'

export function TermsPage() {
  const { content, isLoading } = useLegalContent()
  const { values } = useLegalVariables()

  return (
    <div>
      <div className="page-header">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="section-label justify-center">
            <div className="section-label-line" />
            <span className="section-label-text">Legal</span>
            <div className="section-label-line" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Please read these terms carefully before using GambiaFund.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card border rounded-2xl p-6 sm:p-8">
            <MarkdownContent content={renderLegalVariables(content?.terms_content || '', values)} />
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
          <Link to={ROUTES.HELP} className="hover:text-foreground transition-colors">Help Center</Link>
          <Link to={ROUTES.TRUST_SAFETY} className="hover:text-foreground transition-colors">Trust &amp; Safety</Link>
          <Link to={ROUTES.PRIVACY} className="hover:text-foreground transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
