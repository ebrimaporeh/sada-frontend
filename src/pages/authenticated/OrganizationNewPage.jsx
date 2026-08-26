import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { AlertCircle, ChevronLeft, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { Select } from '@/components/custom/Select'
import { useOrganizationTypes, useCreateOrganization } from '@/hooks/useOrganizations'
import { useActiveProfile } from '@/hooks/useActiveProfile'
import { ROUTES } from '@/constants'

const inputClass = 'w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring'
const labelClass = 'text-sm font-medium block mb-1.5'

const INITIAL_FORM = {
  organization_name: '',
  organization_type_slug: '',
  phone: '',
  phone_2: '',
}

export function OrganizationNewPage() {
  const navigate = useNavigate()
  const { data: types = [], isLoading: typesLoading } = useOrganizationTypes()
  const createOrganization = useCreateOrganization()
  const { setProfile } = useActiveProfile()
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    createOrganization.mutate(form, {
      onSuccess: (res) => {
        const org = res?.data?.organization
        // Immediately act as the org you just created, matching the
        // creation flow's own framing ("create and manage an organization
        // from your profile") -- landing back on Individual would be
        // confusing right after choosing to create one.
        if (org?.id) setProfile(org.id)
        navigate({ to: ROUTES.ORGANIZATION_OVERVIEW, params: { id: org?.id } })
      },
      onError: (err) => setError(err?.response?.data?.message || 'Failed to create organization.'),
    })
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link
          to={ROUTES.ORGANIZATIONS}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Organizations
        </Link>
        <PageHeader
          title="Create Organization"
          description="You'll be its Owner and first point of contact. Invite teammates and add more contact people once it's created."
        />
      </div>

      <form onSubmit={handleSubmit} className="border rounded-2xl bg-card p-6 space-y-5">
        <div>
          <label className={labelClass}>Organization Name *</label>
          <input
            required
            value={form.organization_name}
            onChange={set('organization_name')}
            placeholder="e.g. Gambia Youth Trust"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Organization Type *</label>
          {typesLoading ? (
            <p className="text-sm text-muted-foreground">Loading types…</p>
          ) : (
            <Select
              value={form.organization_type_slug}
              onChange={set('organization_type_slug')}
              placeholder="Select a type"
              options={types.map((t) => ({ value: t.slug, label: t.name }))}
            />
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            Only crowdfunding-eligible types are available for now.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+220 7XXXXXXX" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Second Phone Number</label>
            <input type="tel" value={form.phone_2} onChange={set('phone_2')} placeholder="Optional" className={inputClass} />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive flex items-center gap-1.5 bg-destructive/10 rounded-lg p-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={createOrganization.isPending || !form.organization_name.trim() || !form.organization_type_slug}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
        >
          {createOrganization.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {createOrganization.isPending ? 'Creating…' : 'Create Organization'}
        </button>
      </form>
    </div>
  )
}
