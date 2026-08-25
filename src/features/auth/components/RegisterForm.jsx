import { useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff } from 'lucide-react'
import { useRegister, useGoogleOAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { ROUTES } from '@/constants'
import { cn } from '@/utils/cn'

// Registration only ever creates an individual account now -- an
// organization is something you create/join afterward from your profile
// (see src/features/organizations), not a signup-time choice, so there's
// no account-type toggle here any more.
const INITIAL_FORM = {
  email: '',
  password: '',
  password_confirm: '',
  terms_accepted: false,
}

export function RegisterForm() {
  // Prefilled when arriving from an organization invitation link
  // (InvitationPage sends the invited email along).
  const search = useSearch({ strict: false })
  const [form, setForm] = useState({ ...INITIAL_FORM, email: search?.email || '' })
  const [visiblePasswords, setVisiblePasswords] = useState({ password: false, password_confirm: false })
  const register = useRegister()
  const googleOAuth = useGoogleOAuth()

  const togglePasswordVisibility = (field) =>
    setVisiblePasswords((v) => ({ ...v, [field]: !v[field] }))

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    register.mutate(form)
  }

  return (
    <div className="w-full space-y-6">
      {/* Bridges the gap between the Google consent popup closing and the
          redirect landing -- without this the page just sits there, then
          jumps straight to the dashboard with no visual transition. */}
      {googleOAuth.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-2xl p-6 flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium">Setting up your account…</p>
          </div>
        </div>
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-muted-foreground">Start your journey today</p>
      </div>

      {googleOAuth.isError && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {googleOAuth.error?.response?.data?.message || 'Google sign-up failed.'}
        </div>
      )}

      {/* Google OAuth */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            googleOAuth.mutate(credentialResponse.credential)
          }}
          onError={() => {
            console.log('Google signup failed')
          }}
        />
      </div>
      <p className="text-xs text-center text-muted-foreground -mt-2">
        By continuing with Google, you agree to our{' '}
        <Link to={ROUTES.TERMS} target="_blank" className="text-primary hover:underline font-medium">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to={ROUTES.PRIVACY} target="_blank" className="text-primary hover:underline font-medium">
          Privacy Policy
        </Link>.
      </p>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {register.isError && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {register.error?.response?.data?.message || 'Registration failed.'}
          </div>
        )}

        {[
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'password', type: 'password', label: 'Password', required: true, autoComplete: 'new-password' },
          { name: 'password_confirm', type: 'password', label: 'Confirm password', required: true, autoComplete: 'new-password' },
        ].map(({ name, type, label, required, autoComplete }) => {
          const isPasswordField = type === 'password'
          const isVisible = visiblePasswords[name]
          return (
            <div key={name} className="space-y-1">
              <label className="text-sm font-medium">{label}</label>
              <div className="relative">
                <input
                  name={name}
                  type={isPasswordField && isVisible ? 'text' : type}
                  value={form[name]}
                  onChange={handleChange}
                  required={required}
                  autoComplete={autoComplete}
                  className={cn(
                    'w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring',
                    isPasswordField && 'pr-10',
                  )}
                />
                {isPasswordField && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(name)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Terms acceptance -- gates the submit button right below it */}
        <label className="flex items-start gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.terms_accepted}
            onChange={(e) => setForm((f) => ({ ...f, terms_accepted: e.target.checked }))}
            className="mt-0.5 w-4 h-4 rounded border-input accent-primary flex-shrink-0"
          />
          <span className="text-muted-foreground">
            I agree to the{' '}
            <Link to={ROUTES.TERMS} target="_blank" className="text-primary hover:underline font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to={ROUTES.PRIVACY} target="_blank" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={register.isPending || !form.terms_accepted}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
        >
          {register.isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
