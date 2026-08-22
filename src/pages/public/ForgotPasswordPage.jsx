import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useRequestPasswordReset } from '@/hooks/useAuth'
import { AuthShell } from '@/components/custom/AuthShell'
import { ROUTES } from '@/constants'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const requestReset = useRequestPasswordReset()

  const handleSubmit = (e) => {
    e.preventDefault()
    requestReset.mutate(email, {
      // Show the same confirmation regardless of whether the email exists,
      // so this can't be used to probe which addresses have accounts.
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitted(true),
    })
  }

  return (
    <AuthShell title="Forgot Password">
      {submitted ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>, we've sent a link to reset your password.
            </p>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold">Forgot password?</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={requestReset.isPending}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {requestReset.isPending ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  )
}
