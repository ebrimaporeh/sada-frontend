import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useLogin } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

const TEST_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@gambiafund.gm',
    password: 'Admin@1234',
    description: 'Full platform access',
    badge: 'bg-violet-100 text-violet-700',
    border: 'border-violet-200 hover:border-violet-400',
  },
  {
    role: 'Campaign Owner',
    email: 'ousman@gambiafund.gm',
    password: 'User@1234',
    description: 'Campaign management',
    badge: 'bg-sky-100 text-sky-700',
    border: 'border-sky-200 hover:border-sky-400',
  },
]

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeDemo, setActiveDemo] = useState(null)
  const login = useLogin()

  const handleSubmit = (e) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  const handleDemoLogin = (account) => {
    setActiveDemo(account.role)
    setEmail(account.email)
    setPassword(account.password)
    login.mutate({ email: account.email, password: account.password })
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
      </div>

      {/* Test account quick login */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Quick login — test accounts
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TEST_ACCOUNTS.map((account) => {
            const isLoading = login.isPending && activeDemo === account.role
            return (
              <button
                key={account.role}
                type="button"
                onClick={() => handleDemoLogin(account)}
                disabled={login.isPending}
                className={[
                  'relative flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3',
                  'text-center transition-all duration-150',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  account.border,
                ].join(' ')}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  </div>
                )}
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${account.badge}`}>
                  {account.role}
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {account.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or sign in manually</span>
        </div>
      </div>

      {/* Manual login form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {login.isError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {login.error?.response?.data?.message || 'Login failed. Please try again.'}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setActiveDemo(null) }}
            required
            placeholder="you@example.com"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setActiveDemo(null) }}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="text-right">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {login.isPending && !activeDemo ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
