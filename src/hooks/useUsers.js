import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { userApi } from '@/api/userApi'

export function useUsers(params = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userApi.getUsers(params),
  })
}

export function useUser(id) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getUser(id),
    enabled: Boolean(id),
  })
}

// ── Public campaigner profiles ────────────────────────────────────────────────

export function usePublicCampaigners(filters = {}) {
  const params = {}
  if (filters.region) params.region = filters.region
  if (filters.search) params.search = filters.search
  if (filters.page) params.page = filters.page

  const query = useQuery({
    queryKey: queryKeys.campaigners.list(params),
    queryFn: () => userApi.getCampaigners(params),
    select: (res) => ({
      campaigners: res?.results ?? [],
      count: res?.count ?? 0,
      totalPages: res?.total_pages ?? 1,
      page: res?.page ?? 1,
    }),
  })
  return {
    campaigners: query.data?.campaigners ?? [],
    count: query.data?.count ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    page: query.data?.page ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

export function usePublicCampaigner(id) {
  const query = useQuery({
    queryKey: queryKeys.campaigners.detail(id),
    queryFn: () => userApi.getCampaigner(id),
    enabled: Boolean(id),
    retry: false,
  })
  return { campaigner: query.data ?? null, isLoading: query.isLoading, isError: query.isError }
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => {
      const hasFile = Object.values(data).some((v) => v instanceof File)
      if (hasFile) {
        const form = new FormData()
        Object.entries(data).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, v)
        })
        return import('@/api/client').then(({ apiClient }) =>
          apiClient.patch('/users/me/', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }).then((r) => r.data),
        )
      }
      return userApi.updateMe(data)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), (prev) => ({ ...prev, ...data }))
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => userApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => userApi.adminCreateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}

export function useStaff(params = {}) {
  return useQuery({
    queryKey: queryKeys.staff.list(params),
    queryFn: () => userApi.getStaff(params),
  })
}

export function useChangeStaffRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => userApi.changeStaffRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}

export function useMyVerification() {
  return useQuery({
    queryKey: queryKeys.verification.mine(),
    queryFn: () => userApi.getMyVerification().then((r) => r.data.verification),
  })
}

export function useSubmitVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => userApi.submitVerification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.mine() })
    },
  })
}

export function useAdminVerifications(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.verification.adminList(params),
    queryFn: () => userApi.getVerifications(params),
    enabled,
  })
}

export function useUserVerification(userId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.verification.adminList({ user_id: userId }),
    queryFn: () => userApi.getVerifications({ user_id: userId, page_size: 1 }),
    select: (res) => res?.results?.[0] ?? null,
    enabled: enabled && Boolean(userId),
  })
}

export function useReviewVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action, reason }) => userApi.reviewVerification(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}

// ── Organization verification ─────────────────────────────────────────────────

export function useMyOrganizationVerification() {
  return useQuery({
    queryKey: queryKeys.organizationVerification.mine(),
    queryFn: () => userApi.getMyOrganizationVerification().then((r) => r.data.verification),
  })
}

export function useSubmitOrganizationVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => userApi.submitOrganizationVerification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationVerification.mine() })
    },
  })
}

export function useAdminOrganizationVerifications(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.organizationVerification.adminList(params),
    queryFn: () => userApi.getOrganizationVerifications(params),
    enabled,
  })
}

export function useReviewOrganizationVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action, reason }) => userApi.reviewOrganizationVerification(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-verification'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}

// ── Organization change requests ──────────────────────────────────────────────

export function useMyOrganizationChangeRequests({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.organizationChangeRequest.mine(),
    queryFn: () => userApi.getMyOrganizationChangeRequests().then((r) => r.data.change_requests),
    enabled,
  })
}

export function useSubmitOrganizationChangeRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => userApi.submitOrganizationChangeRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationChangeRequest.mine() })
    },
  })
}

export function useAdminOrganizationChangeRequests(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.organizationChangeRequest.adminList(params),
    queryFn: () => userApi.getOrganizationChangeRequests(params),
    enabled,
  })
}

export function useReviewOrganizationChangeRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action, reason }) => userApi.reviewOrganizationChangeRequest(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-change-request'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}
