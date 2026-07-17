import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { queryKeys } from '@/api/queryKeys'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import { ROLES } from '@/constants'

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: userApi.getMe,
    enabled: Boolean(localStorage.getItem('access_token')),
    retry: false,
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApi.updateMe,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), (prev) => ({ ...prev, ...data }))
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.data.tokens.access)
      localStorage.setItem('refresh_token', data.data.tokens.refresh)
      queryClient.setQueryData(queryKeys.auth.me(), data.data.user)
      const destination = data.data.user.role === ROLES.ADMIN ? '/admin' : '/dashboard'
      navigate({ to: destination })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.data.tokens.access)
      localStorage.setItem('refresh_token', data.data.tokens.refresh)
      queryClient.setQueryData(queryKeys.auth.me(), data.data.user)
      const destination = data.data.user.role === ROLES.ADMIN ? '/admin' : '/dashboard'
      navigate({ to: destination })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => {
      const refresh = localStorage.getItem('refresh_token')
      return authApi.logout(refresh)
    },
    onSettled: () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      queryClient.clear()
      navigate({ to: '/' })
    },
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword })
}

export function useSetPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.setPassword,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me(), (prev) => prev && { ...prev, has_usable_password: true })
    },
  })
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: (email) => authApi.requestPasswordReset(email) })
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: (token) => authApi.verifyEmail(token) })
}

export function useResendVerification() {
  return useMutation({ mutationFn: (email) => authApi.resendVerification(email) })
}

export function useConfirmPasswordReset() {
  return useMutation({ mutationFn: (data) => authApi.confirmPasswordReset(data) })
}

export function useLinkGoogleAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idToken) => authApi.linkGoogleAccount(idToken),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), data.data.user)
    },
  })
}

export function useGoogleOAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    // Accepts either a bare idToken string (login page) or
    // { idToken, accountType } (signup page, to signal individual vs
    // organization intent for a brand-new account).
    mutationFn: (arg) => {
      const { idToken, accountType } = typeof arg === 'string' ? { idToken: arg } : arg
      return authApi.googleOAuth(idToken, accountType)
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.data.tokens.access)
      localStorage.setItem('refresh_token', data.data.tokens.refresh)
      queryClient.setQueryData(queryKeys.auth.me(), data.data.user)
      const destination = data.data.user.role === ROLES.ADMIN ? '/admin' : '/dashboard'
      navigate({ to: destination })
    },
  })
}
