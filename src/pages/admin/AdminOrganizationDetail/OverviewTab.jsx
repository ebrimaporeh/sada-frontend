import { SectionCard } from '../AdminCampaignDetail/shared'
import { formatDate, initials } from '@/utils/formatters'

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

export function OverviewTab({ organization }) {
  const contactPersons = organization.contact_persons || []
  return (
    <div className="space-y-6">
      <SectionCard title="Organization Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoField label="Organization Name" value={organization.organization_name} />
          <InfoField label="Type" value={organization.organization_type_name} />
          <InfoField label="Created By" value={organization.created_by_name} />
          <InfoField label="Created" value={formatDate(organization.created_at)} />
        </div>
      </SectionCard>

      <SectionCard title="Contact People">
        {contactPersons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contact people set.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {contactPersons.map((c) => (
              <div key={c.user_id} className="flex items-center gap-3 border rounded-xl p-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials(c.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Contact Details">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoField label="Phone" value={organization.phone} />
          <InfoField label="Second Phone" value={organization.phone_2} />
          <InfoField label="Recovery Email 1" value={organization.recovery_email_1} />
          <InfoField label="Recovery Email 2" value={organization.recovery_email_2} />
        </div>
      </SectionCard>
    </div>
  )
}
