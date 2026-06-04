import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useRegister } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

export function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  })
  const register = useRegister()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    register.mutate(form)
  }

  return (
    <div className="w-full max-w-sm space-y-6">
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

        <div className="flex gap-2">
          {['first_name', 'last_name'].map((field) => (
            <div key={field} className="flex-1 space-y-1">
              <label className="text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>

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
              className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
