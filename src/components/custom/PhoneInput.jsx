import { AlertCircle } from 'lucide-react'
import { isValidGambiaPhone } from '@/utils/validators'
import { cn } from '@/utils/cn'

// Gambia-only for now (the platform's only supported country) -- a static
// "+220" prefix badge rather than a country picker, since there's nothing
// to pick yet. `value`/`onChange` deal in the bare local digits (no
// +220), matching every existing phone form's own convention (see
// UserProfile.jsx's now-removed local Input, SettingsPage.jsx) -- callers
// prefix +220 themselves at submit time (or just send the bare digits and
// let the backend's validate_gambia_phone normalize it, which it always
// does regardless of what prefix the submitted value does or doesn't
// have already).
export function PhoneInput({ value, onChange, placeholder = '8XXXXXXXX', className, inputClassName, showError = true }) {
  const digitsOnly = (raw) => raw.replace(/\D/g, '').slice(0, 9)
  const invalid = showError && value && !isValidGambiaPhone(value)

  return (
    <div className={className}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">
          +220
        </span>
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(digitsOnly(e.target.value))}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring',
            invalid && 'border-destructive focus:ring-destructive',
            inputClassName,
          )}
        />
      </div>
      {invalid && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> 9 digits, starting with 8.
        </p>
      )}
    </div>
  )
}
