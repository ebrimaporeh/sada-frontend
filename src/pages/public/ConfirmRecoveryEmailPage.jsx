import { useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { Link, useSearch } from '@tanstack/react-router'
import { useConfirmRecoveryEmailChange } from '@/hooks/useUsers'
import { AuthShell } from '@/components/custom/AuthShell'
import { ROUTES } from '@/constants'

export function ConfirmRecoveryEmailPage() {
  const search = useSearch({ strict: false })
  const token = search?.token
  const attempted = useRef(false)

  const confirmChange = useConfirmRecoveryEmailChange()

  useEffect(() => {
    if (!token || attempted.current) return
    attempted.current = true
    confirmChange.mutate(token)
  }, [token, confirmChange])

  const fieldLabel = confirmChange.data?.data?.change_request?.field_label || 'recovery email'
  const proposedValue = confirmChange.data?.data?.change_request?.proposed_value

  return (
    <AuthShell title="Confirm Recovery Email">
      {!token ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Missing confirmation link</h1>
            <p className="text-sm text-muted-foreground">
              Open this page from the confirmation link in your email instead of visiting it directly.
            </p>
          </div>
        </div>
      ) : confirmChange.isPending ? (
        <div className="space-y-4 text-center py-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Confirming…</p>
        </div>
      ) : confirmChange.isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MailCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">{fieldLabel} confirmed</h1>
            <p className="text-sm text-muted-foreground">
              {proposedValue ? (
                <>This address is now set as the organization's {fieldLabel.toLowerCase()}.</>
              ) : (
                <>The change has been applied.</>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Confirmation failed</h1>
            <p className="text-sm text-muted-foreground">
              {confirmChange.error?.response?.data?.message || 'This link is invalid or has expired.'}
            </p>
          </div>
        </div>
      )}

      {confirmChange.isSuccess && (
        <div className="flex items-center justify-center gap-1.5 text-sm text-green-700 mt-4">
          <CheckCircle2 className="w-4 h-4" /> No further action needed.
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
      </p>
    </AuthShell>
  )
}
