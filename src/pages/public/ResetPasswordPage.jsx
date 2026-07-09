import { useState } from 'react'
import { Heart, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useConfirmPasswordReset } from '@/hooks/useAuth'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'

export function ResetPasswordPage() {
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const token = search?.token

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const confirmReset = useConfirmPasswordReset()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    confirmReset.mutate(
      { token, password },
      {
        onSuccess: () => setDone(true),
        onError: (err) => setError(err?.response?.data?.message || 'This link is invalid or has expired. Please request a new one.'),
      },
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10">
      <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
          <Heart className="w-4.5 h-4.5 text-primary-foreground fill-primary-foreground" />
        </div>
        <span className="font-extrabold text-xl">{settings.siteName}</span>
      </Link>

      <div className="w-full max-w-sm bg-card border rounded-2xl shadow-sm p-8">
        {!token ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold">Invalid link</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is missing its token. Request a new one below.
              </p>
            </div>
            <Link to={ROUTES.FORGOT_PASSWORD} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Request a new link
            </Link>
          </div>
        ) : done ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold">Password reset</h1>
              <p className="text-sm text-muted-foreground">Your password has been changed. You can now sign in with your new password.</p>
            </div>
            <button
              onClick={() => navigate({ to: ROUTES.LOGIN })}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold">Reset your password</h1>
              <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    required
                    minLength={8}
                    className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Confirm new password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                    required
                    minLength={8}
                    className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={confirmReset.isPending}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {confirmReset.isPending ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
