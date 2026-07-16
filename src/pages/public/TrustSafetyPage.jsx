import { Link } from '@tanstack/react-router'
import { useLegalContent } from '@/hooks/useLegalContent'
import { MarkdownContent } from '@/components/custom/MarkdownEditor'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES } from '@/constants'

export function TrustSafetyPage() {
  const { content, isLoading } = useLegalContent()

  return (
    <div>
      <div className="page-header">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="section-label justify-center">
            <div className="section-label-line" />
            <span className="section-label-text">Trust &amp; Safety</span>
            <div className="section-label-line" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">How we protect donors</h1>
          <p className="text-muted-foreground">Every campaign is reviewed, every transaction is traceable, and every report is investigated.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card border rounded-2xl p-6 sm:p-8">
            <MarkdownContent content={content?.trust_safety_content || ''} />
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
          <Link to={ROUTES.HELP} className="hover:text-foreground transition-colors">Help Center</Link>
          <Link to={ROUTES.PRIVACY} className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to={ROUTES.TERMS} className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
