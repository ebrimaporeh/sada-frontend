import { Heart } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { settings } from '@/settings'
import { ROUTES } from '@/constants'

export function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10">
      {/* Brand mark */}
      <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
          <Heart className="w-4.5 h-4.5 text-primary-foreground fill-primary-foreground" />
        </div>
        <span className="font-extrabold text-xl">{settings.siteName}</span>
      </Link>

      <div className="w-full max-w-sm bg-card border rounded-2xl shadow-sm p-8">
        <LoginForm />
      </div>
    </div>
  )
}
