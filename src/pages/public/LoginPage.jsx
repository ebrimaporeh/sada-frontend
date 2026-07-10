import { LoginForm } from '@/features/auth/components/LoginForm'
import { AuthShell } from '@/components/custom/AuthShell'

export function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  )
}
