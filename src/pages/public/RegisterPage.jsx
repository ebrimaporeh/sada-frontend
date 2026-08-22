import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { AuthShell } from '@/components/custom/AuthShell'

export function RegisterPage() {
  return (
    <AuthShell title="Create Account">
      <RegisterForm />
    </AuthShell>
  )
}
