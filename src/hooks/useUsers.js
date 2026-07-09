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

export function useAdminVerifications(params = {}) {
  return useQuery({
    queryKey: queryKeys.verification.adminList(params),
    queryFn: () => userApi.getVerifications(params),
  })
}

export function useReviewVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action, reason }) => userApi.reviewVerification(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] })
    },
  })
}
