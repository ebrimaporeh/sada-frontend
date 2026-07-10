import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { AuthShell } from '@/components/custom/AuthShell'

export function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  )
}
