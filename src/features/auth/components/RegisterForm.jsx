import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { GoogleLogin } from '@react-oauth/google'
import { User, Building2 } from 'lucide-react'
import { useRegister, useGoogleOAuth } from '@/hooks/useAuth'
import { ROUTES, ACCOUNT_TYPES } from '@/constants'
import { cn } from '@/utils/cn'

const INITIAL_FORM = {
  email: '',
  password: '',
  password_confirm: '',
  account_type: ACCOUNT_TYPES.INDIVIDUAL,
  terms_accepted: false,
}

export function RegisterForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const register = useRegister()
  const googleOAuth = useGoogleOAuth()
  const isOrg = form.account_type === ACCOUNT_TYPES.ORGANIZATION

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const setAccountType = (accountType) => setForm((f) => ({ ...f, account_type: accountType }))

  const handleSubmit = (e) => {
    e.preventDefault()
    register.mutate(form)
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-muted-foreground">Start your journey today</p>
      </div>

      {googleOAuth.isError && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {googleOAuth.error?.response?.data?.message || 'Google sign-up failed.'}
        </div>
      )}

      {/* Account type toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setAccountType(ACCOUNT_TYPES.INDIVIDUAL)}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors',
            !isOrg ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent',
          )}
        >
          <User className="w-4 h-4" /> Individual
        </button>
        <button
          type="button"
          onClick={() => setAccountType(ACCOUNT_TYPES.ORGANIZATION)}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors',
            isOrg ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent',
          )}
        >
          <Building2 className="w-4 h-4" /> Organization
        </button>
      </div>

      {isOrg && (
        <p className="text-xs text-muted-foreground -mt-2">
          You'll add your organization's details right after you sign up.
        </p>
      )}

      {/* Google OAuth */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            googleOAuth.mutate({ idToken: credentialResponse.credential, accountType: form.account_type })
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
          { name: 'password', type: 'password', label: 'Password', required: true },
          { name: 'password_confirm', type: 'password', label: 'Confirm password', required: true },
        ].map(({ name, type, label, required }) => (
          <div key={name} className="space-y-1">
            <label className="text-sm font-medium">{label}</label>
            <input
              name={name}
              type={type}
              value={form[name]}
              onChange={handleChange}
              required={required}
              className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}

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
