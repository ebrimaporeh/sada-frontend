import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { organizationsApi } from '@/api/organizationsApi'
import { useMe } from '@/hooks/useAuth'

// My own role/permissions for a specific organization -- sourced from
// me.organizations (UserSerializer.get_organizations), not from
// useOrganizationMembers(id) (the full member list, no reason to fetch and
// scan that just to answer "what can *I* do here"). Independent of
// useActiveProfile -- this answers "what can I do in organization X"
// regardless of which profile is currently active in the switcher, same
// reasoning as useCampaignPermission.
export function useMyOrganizationMembership(organizationId) {
  const { data: me } = useMe()
  return (me?.organizations ?? []).find((o) => o.id === organizationId) || null
}

// ── Types ────────────────────────────────────────────────────────────────────

export function useOrganizationTypes() {
  return useQuery({
    queryKey: queryKeys.organizations.types(),
    queryFn: () => organizationsApi.getTypes(),
    select: (res) => res?.data?.types ?? [],
    staleTime: 10 * 60 * 1000,
  })
}

// ── Organizations ────────────────────────────────────────────────────────────

export function useMyOrganizations() {
  return useQuery({
    queryKey: queryKeys.organizations.mine(),
    queryFn: () => organizationsApi.getMine(),
    select: (res) => res?.data?.organizations ?? [],
  })
}

export function useOrganization(id) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(id),
    queryFn: () => organizationsApi.getDetail(id),
    select: (res) => res?.data?.organization,
    enabled: Boolean(id),
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.mine() })
      // A brand-new organization also changes me.organizations, which the
      // profile switcher and every permission check read from.
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

export function useSetContactPerson(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, isContactPerson }) => organizationsApi.setContactPerson(id, userId, isContactPerson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(id) })
    },
  })
}

export function useTransferOwnership(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId) => organizationsApi.transferOwnership(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

// ── Roles ────────────────────────────────────────────────────────────────────

export function useOrganizationRoles(id) {
  return useQuery({
    queryKey: queryKeys.organizations.roles(id),
    queryFn: () => organizationsApi.getRoles(id),
    select: (res) => res?.data?.roles ?? [],
    enabled: Boolean(id),
  })
}

export function useCreateOrganizationRole(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => organizationsApi.createRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.roles(id) })
    },
  })
}

export function useUpdateOrganizationRole(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, ...data }) => organizationsApi.updateRole(id, roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.roles(id) })
    },
  })
}

export function useDeleteOrganizationRole(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId) => organizationsApi.deleteRole(id, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.roles(id) })
    },
  })
}

// ── Members ──────────────────────────────────────────────────────────────────

export function useOrganizationMembers(id) {
  return useQuery({
    queryKey: queryKeys.organizations.members(id),
    queryFn: () => organizationsApi.getMembers(id),
    select: (res) => res?.data?.members ?? [],
    enabled: Boolean(id),
  })
}

export function useChangeMemberRole(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleId }) => organizationsApi.changeMemberRole(id, userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(id) })
    },
  })
}

export function useRemoveMember(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId) => organizationsApi.removeMember(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(id) })
      // Removing/leaving changes me.organizations for whichever account this
      // browser is signed in as (self-removal is the common case).
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

// ── Invitations ──────────────────────────────────────────────────────────────

export function useOrganizationInvitations(id) {
  return useQuery({
    queryKey: queryKeys.organizations.invitations(id),
    queryFn: () => organizationsApi.getInvitations(id),
    select: (res) => res?.data?.invitations ?? [],
    enabled: Boolean(id),
  })
}

export function useInviteMember(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, roleId }) => organizationsApi.inviteMember(id, email, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.invitations(id) })
    },
  })
}

export function useCancelInvitation(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invitationId) => organizationsApi.cancelInvitation(id, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.invitations(id) })
    },
  })
}

export function useResendInvitation(id) {
  return useMutation({
    mutationFn: (invitationId) => organizationsApi.resendInvitation(id, invitationId),
  })
}

// My own pending invitations (matched by email) -- surfaced on the
// dashboard/profile switcher so an invited user notices without having to
// go looking for them.
export function useMyInvitations() {
  return useQuery({
    queryKey: queryKeys.organizations.myInvitations(),
    queryFn: () => organizationsApi.getMyInvitations(),
    select: (res) => res?.data?.invitations ?? [],
  })
}

// Public -- the invited person may not have an account yet (InvitationPage).
export function useInvitationPreview(token) {
  return useQuery({
    queryKey: queryKeys.organizations.invitationPreview(token),
    queryFn: () => organizationsApi.previewInvitation(token),
    select: (res) => res?.data?.invitation,
    enabled: Boolean(token),
    retry: false,
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token) => organizationsApi.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.mine() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

export function useRejectInvitation() {
  return useMutation({
    mutationFn: (token) => organizationsApi.rejectInvitation(token),
  })
}

// ── Admin -- not membership-gated, see organizationsApi.getAdminList ───────

export function useAdminOrganizations(params = {}) {
  return useQuery({
    queryKey: queryKeys.organizations.adminList(params),
    queryFn: () => organizationsApi.getAdminList(params),
    select: (res) => ({ organizations: res?.results ?? [], count: res?.count ?? 0, totalPages: res?.total_pages ?? 1 }),
  })
}

export function useAdminOrganization(id) {
  return useQuery({
    queryKey: queryKeys.organizations.adminDetail(id),
    queryFn: () => organizationsApi.getAdminDetail(id),
    select: (res) => res?.data?.organization,
    enabled: Boolean(id),
  })
}

export function useAdminOrganizationMembers(id) {
  return useQuery({
    queryKey: queryKeys.organizations.adminMembers(id),
    queryFn: () => organizationsApi.getAdminMembers(id),
    select: (res) => res?.data?.members ?? [],
    enabled: Boolean(id),
  })
}
