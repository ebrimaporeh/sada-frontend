import { useState, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { Building2, ShieldCheck, ShieldQuestion, Users, Megaphone, Calendar, Wallet, Image, Code2, Camera, Loader2, AlertCircle } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import { ROUTES, OrganizationPermission } from '@/constants'
import { useMyOrganizationMembership, useUploadOrganizationLogo } from '@/hooks/useOrganizations'
import { compressImage } from '@/utils/imageCompression'

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value || '-'}</p>
    </div>
  )
}

function LogoAvatar({ organization, canManage }) {
  const fileRef = useRef()
  const [error, setError] = useState('')
  const uploadLogo = useUploadOrganizationLogo(organization.id)

  async function handleChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    const compressed = await compressImage(file, 'logo')
    uploadLogo.mutate(compressed, {
      onError: (err) => setError(err?.response?.data?.message || 'Failed to upload logo.'),
    })
  }

  return (
    <div className="flex-shrink-0">
      <button
        type="button"
        onClick={() => canManage && fileRef.current?.click()}
        disabled={!canManage || uploadLogo.isPending}
        title={canManage ? 'Change logo' : undefined}
        className="relative w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center overflow-hidden group disabled:cursor-default"
      >
        {organization.logo ? (
          <img src={organization.logo} alt={organization.organization_name} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-7 h-7" />
        )}
        {canManage && (
          <span className={`absolute inset-0 flex items-center justify-center bg-black/50 text-white transition-opacity ${uploadLogo.isPending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {uploadLogo.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          </span>
        )}
      </button>
      {canManage && (
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={uploadLogo.isPending} />
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1.5 max-w-32">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}

export function OrganizationOverview({ organization }) {
  const membership = useMyOrganizationMembership(organization.id)
  const canManageOrg = Boolean(membership?.permissions?.includes(OrganizationPermission.MANAGE_ORGANIZATION))

  return (
    <div className="space-y-6">
      <div className="border rounded-2xl bg-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <LogoAvatar organization={organization} canManage={canManageOrg} />
        <div className="flex-1 text-center sm:text-left space-y-1">
          <p className="font-bold text-lg">{organization.organization_name}</p>
          <p className="text-sm text-muted-foreground capitalize">{organization.organization_type_name}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
            {organization.is_verified ? (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                <ShieldQuestion className="w-3.5 h-3.5" /> Not verified
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-full font-medium">
              <Users className="w-3.5 h-3.5" /> {organization.member_count} member{organization.member_count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">Details</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoField label="Phone" value={organization.phone} />
          <InfoField label="Second Phone" value={organization.phone_2} />
          <InfoField label="Recovery Email 1" value={organization.recovery_email_1} />
          <InfoField label="Recovery Email 2" value={organization.recovery_email_2} />
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="font-medium text-sm flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {formatDate(organization.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to={ROUTES.MY_CAMPAIGNS}
          className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Megaphone className="w-4 h-4" /> View campaigns
        </Link>
        <Link
          to={ROUTES.ORGANIZATION_DONATIONS}
          params={{ id: organization.id }}
          className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Wallet className="w-4 h-4" /> View donations
        </Link>
        {canManageOrg && (
          <>
            <Link
              to={ROUTES.FUNDRAISING_POSTER_NEW}
              search={{ destinationType: 'organization', destinationId: organization.id }}
              className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Image className="w-4 h-4" /> Design Poster
            </Link>
            <Link
              to={ROUTES.FUNDRAISING_EMBED_DETAIL}
              params={{ organizationId: organization.id }}
              className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Code2 className="w-4 h-4" /> Manage Embed
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
