import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useVerifyEmail, useResendVerification } from '@/hooks/useAuth'
import { AuthShell } from '@/components/custom/AuthShell'
import { ROUTES } from '@/constants'

export function VerifyEmailPage() {
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const token = search?.token
  const attempted = useRef(false)

  const [resendEmail, setResendEmail] = useState('')
  const [resendDone, setResendDone] = useState(false)
  const verifyEmail = useVerifyEmail()
  const resendVerification = useResendVerification()

  useEffect(() => {
    if (!token || attempted.current) return
    attempted.current = true
    verifyEmail.mutate(token)
  }, [token, verifyEmail])

  const handleResend = (e) => {
    e.preventDefault()
    resendVerification.mutate(resendEmail, {
      onSuccess: () => setResendDone(true),
      onError: () => setResendDone(true),
    })
  }

  return (
    <AuthShell>
      {!token ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Missing verification token</h1>
            <p className="text-sm text-muted-foreground">This link is missing its token. Use the button below to get a new one.</p>
          </div>
        </div>
      ) : verifyEmail.isPending ? (
        <div className="space-y-4 text-center py-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        </div>
      ) : verifyEmail.isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Email verified</h1>
            <p className="text-sm text-muted-foreground">Your email has been confirmed. You can now sign in.</p>
          </div>
          <button
            onClick={() => navigate({ to: ROUTES.LOGIN })}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div className="space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Verification failed</h1>
            <p className="text-sm text-muted-foreground">
              {verifyEmail.error?.response?.data?.message || 'This link is invalid or has expired.'}
            </p>
          </div>

          {resendDone ? (
            <p className="text-sm text-muted-foreground">
              If that email is registered and unverified, a new link is on its way.
            </p>
          ) : (
            <form onSubmit={handleResend} className="space-y-3 text-left">
              <label className="text-sm font-medium">Resend verification email</label>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={resendVerification.isPending}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {resendVerification.isPending ? 'Sending…' : 'Send New Link'}
              </button>
            </form>
          )}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>
      </p>
    </AuthShell>
  )
}
