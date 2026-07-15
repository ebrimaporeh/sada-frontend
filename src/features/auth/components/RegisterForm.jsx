import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { User, Building2 } from 'lucide-react'
import { useRegister } from '@/hooks/useAuth'
import { ROUTES, ACCOUNT_TYPES, ORGANIZATION_TYPES } from '@/constants'
import { cn } from '@/utils/cn'

const INITIAL_FORM = {
  email: '',
  password: '',
  password_confirm: '',
  first_name: '',
  last_name: '',
  phone: '',
  account_type: ACCOUNT_TYPES.INDIVIDUAL,
  organization_name: '',
  organization_type: '',
  contact_person_name: '',
  phone_2: '',
  recovery_email_1: '',
  recovery_email_2: '',
}

export function RegisterForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const register = useRegister()
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {register.isError && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {register.error?.response?.data?.message || 'Registration failed.'}
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

        {isOrg ? (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">Organization name</label>
              <input
                name="organization_name"
                value={form.organization_name}
                onChange={handleChange}
                required
                placeholder="e.g. Bakau Central Mosque Committee"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Organization type</label>
              <select
                name="organization_type"
                value={form.organization_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a type...</option>
                {ORGANIZATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Contact person's name</label>
              <input
                name="contact_person_name"
                value={form.contact_person_name}
                onChange={handleChange}
                required
                placeholder="Who we'll reach for verification"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">Phone number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+220 ..."
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">Second phone number</label>
                <input
                  name="phone_2"
                  value={form.phone_2}
                  onChange={handleChange}
                  required
                  placeholder="+220 ..."
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Recovery email <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                name="recovery_email_1"
                type="email"
                value={form.recovery_email_1}
                onChange={handleChange}
                placeholder="Used to recover this account and copy withdrawal emails"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Second recovery email <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                name="recovery_email_2"
                type="email"
                value={form.recovery_email_2}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            {['first_name', 'last_name'].map((field) => (
              <div key={field} className="flex-1 space-y-1">
                <label className="text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
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

        <button
          type="submit"
          disabled={register.isPending}
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
