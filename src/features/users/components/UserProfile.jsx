import { useState } from 'react'
import { useMe } from '@/hooks/useAuth'
import { useUpdateMe } from '@/hooks/useUsers'
import { PageHeader } from '@/components/custom/PageHeader'
import { initials } from '@/utils/formatters'

export function UserProfile() {
  const { data: user } = useMe()
  const updateMe = useUpdateMe()
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMe.mutate(form)
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="Your Profile" description="Update your personal information." />

      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
          {initials(user?.full_name || user?.email)}
        </div>
        <div>
          <p className="font-semibold">{user?.full_name || user?.email}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6 bg-card">
        {['first_name', 'last_name'].map((field) => (
          <div key={field} className="space-y-1">
            <label className="text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
            <input
              name={field}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={updateMe.isPending}
          className="py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
        >
          {updateMe.isPending ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
