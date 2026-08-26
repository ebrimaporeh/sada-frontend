import { useState } from 'react'
import { UserPlus, Crown, LogOut, Trash2, Mail, X, RefreshCw, Loader2, UserCheck } from 'lucide-react'
import { useMe } from '@/hooks/useAuth'
import {
  useOrganizationMembers, useOrganizationRoles, useOrganizationInvitations,
  useChangeMemberRole, useRemoveMember, useCancelInvitation, useResendInvitation,
  useMyOrganizationMembership, useSetContactPerson,
} from '@/hooks/useOrganizations'
import { InviteMemberSheet } from '@/features/organizations/components/InviteMemberSheet'
import { TransferOwnershipModal } from '@/features/organizations/components/TransferOwnershipModal'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { Select } from '@/components/custom/Select'
import { OrganizationPermission } from '@/constants'
import { formatDate, initials } from '@/utils/formatters'

const OWNER_ROLE_NAME = 'Owner'

function MemberRow({ member, myMembership, roles, organizationId, isSelf }) {
  const changeRole = useChangeMemberRole(organizationId)
  const removeMember = useRemoveMember(organizationId)
  const setContactPerson = useSetContactPerson(organizationId)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const canManage = myMembership?.permissions?.includes(OrganizationPermission.MANAGE_MEMBERS)

  // Owner's role can't be reassigned through this control (must go through
  // Transfer Ownership), and a plain member can't reassign their own role.
  const canChangeThisRole = canManage && member.role_name !== OWNER_ROLE_NAME
  const assignableRoles = roles.filter((r) => r.name !== OWNER_ROLE_NAME)
  const canRemove = (canManage || isSelf) && member.role_name !== OWNER_ROLE_NAME

  return (
    <>
      <div className="flex items-center gap-3 py-3 border-b last:border-0">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials(member.user_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate flex items-center gap-1.5">
            {member.user_name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
            {member.role_name === OWNER_ROLE_NAME && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
            {member.is_contact_person && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                <UserCheck className="w-3 h-3" /> Contact
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground truncate">{member.user_email}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canManage && (
            <button
              type="button"
              onClick={() => setContactPerson.mutate({ userId: member.user_id, isContactPerson: !member.is_contact_person })}
              disabled={setContactPerson.isPending}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              title={member.is_contact_person ? 'Remove as contact person' : 'Mark as contact person'}
            >
              <UserCheck className={member.is_contact_person ? 'w-4 h-4 text-blue-600' : 'w-4 h-4 text-muted-foreground'} />
            </button>
          )}
          {canChangeThisRole ? (
            <Select
              value={member.role_id}
              onChange={(e) => changeRole.mutate({ userId: member.user_id, roleId: e.target.value })}
              options={assignableRoles.map((r) => ({ value: r.id, label: r.name }))}
              buttonClassName="text-xs py-1.5"
              className="w-32"
            />
          ) : (
            <span className="text-xs bg-muted px-2.5 py-1 rounded-full font-medium">{member.role_name}</span>
          )}

          {canRemove && (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              title={isSelf ? 'Leave organization' : 'Remove member'}
            >
              {isSelf ? <LogOut className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => removeMember.mutate(member.user_id, { onSuccess: () => setConfirmRemove(false) })}
        title={isSelf ? 'Leave this organization?' : `Remove ${member.user_name}?`}
        description={isSelf
          ? "You'll lose access to this organization's campaigns and settings until someone invites you back."
          : `${member.user_name} will immediately lose access to this organization.`}
        confirmLabel={isSelf ? 'Leave' : 'Remove'}
        isLoading={removeMember.isPending}
        errorMessage={removeMember.isError ? removeMember.error?.response?.data?.message || 'Failed to remove member.' : null}
      />
    </>
  )
}

function InvitationRow({ invitation, organizationId, canManage }) {
  const cancelInvitation = useCancelInvitation(organizationId)
  const resendInvitation = useResendInvitation(organizationId)
  const [justResent, setJustResent] = useState(false)

  function handleResend() {
    resendInvitation.mutate(invitation.id, {
      onSuccess: () => { setJustResent(true); setTimeout(() => setJustResent(false), 4000) },
    })
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Mail className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{invitation.email}</p>
        <p className="text-xs text-muted-foreground">
          Invited as {invitation.role_name} · {formatDate(invitation.created_at)}
          {justResent && <span className="text-primary"> · resent</span>}
        </p>
      </div>
      {canManage && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendInvitation.isPending}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            title="Resend invitation"
          >
            {resendInvitation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => cancelInvitation.mutate(invitation.id)}
            disabled={cancelInvitation.isPending}
            className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
            title="Cancel invitation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export function OrganizationMembers({ organization }) {
  const { data: me } = useMe()
  const { data: members = [], isLoading: membersLoading } = useOrganizationMembers(organization.id)
  const { data: roles = [] } = useOrganizationRoles(organization.id)
  const { data: invitations = [] } = useOrganizationInvitations(organization.id)
  const myMembership = useMyOrganizationMembership(organization.id)
  const [showInvite, setShowInvite] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)

  const canManage = myMembership?.permissions?.includes(OrganizationPermission.MANAGE_MEMBERS)
  const isOwner = myMembership?.role === OWNER_ROLE_NAME
  const invitableRoles = roles.filter((r) => r.name !== OWNER_ROLE_NAME)
  const transferCandidates = members
    .filter((m) => m.user_id !== me?.id)
    .map((m) => ({ user_id: m.user_id, user_name: m.user_name, user_email: m.user_email, role_name: m.role_name }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-base">Members ({members.length})</h2>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowTransfer(true)}
              className="inline-flex items-center gap-1.5 text-xs border font-medium px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
            >
              <Crown className="w-3.5 h-3.5" /> Transfer Ownership
            </button>
          )}
          {canManage && (
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite
            </button>
          )}
        </div>
      </div>

      <div className="border rounded-2xl bg-card p-5">
        {membersLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading members…</p>
        ) : (
          members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              myMembership={myMembership}
              roles={roles}
              organizationId={organization.id}
              isSelf={member.user_id === me?.id}
            />
          ))
        )}
      </div>

      {invitations.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-base">Pending Invitations ({invitations.length})</h2>
          <div className="border rounded-2xl bg-card p-5">
            {invitations.map((inv) => (
              <InvitationRow key={inv.id} invitation={inv} organizationId={organization.id} canManage={canManage} />
            ))}
          </div>
        </div>
      )}

      <InviteMemberSheet
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        organizationId={organization.id}
        roles={invitableRoles}
      />
      <TransferOwnershipModal
        isOpen={showTransfer}
        onClose={() => setShowTransfer(false)}
        organizationId={organization.id}
        organizationName={organization.organization_name}
        candidates={transferCandidates}
      />
    </div>
  )
}
