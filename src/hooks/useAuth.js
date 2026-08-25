import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { queryKeys } from '@/api/queryKeys'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import { ROLES, ROUTES, PENDING_INVITATION_STORAGE_KEY } from '@/constants'
import { landingRouteForResources } from '@/utils/permissions'

// If the person landed here from an invitation email/link while logged out
// (InvitationPage stashes the token before sending them to Login/Register,
// since there's no generic post-login-redirect mechanism elsewhere in this
// app to piggyback on), send them back to finish responding to it instead
// of their normal post-login destination -- this fires the moment any auth
// flow actually produces tokens (password login, Google OAuth; register
// itself doesn't, see useRegister), whichever the user completed.
function postAuthDestination(fallback) {
  const pendingToken = localStorage.getItem(PENDING_INVITATION_STORAGE_KEY)
  if (!pendingToken) return fallback
  localStorage.removeItem(PENDING_INVITATION_STORAGE_KEY)
  return { to: ROUTES.INVITATIONS, search: { token: pendingToken } }
}

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
      const destination = data.data.user.role === ROLES.ADMIN
        ? '/admin'
        : landingRouteForResources(data.data.user.resources)
      navigate(postAuthDestination({ to: destination }))
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.register,
    // No tokens come back — the backend doesn't log a new account in until
    // its email is verified (see login_user's email_verified check), so
    // there's nothing to store here. Send them to check their inbox instead.
    onSuccess: (data) => {
      navigate({ to: ROUTES.VERIFY_EMAIL, search: { email: data.data.user.email } })
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

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (password) => userApi.deleteMe(password),
    // Only clear the session on success -- a wrong-password rejection
    // should leave the user logged in to see the error and try again.
    onSuccess: () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      queryClient.clear()
      navigate({ to: '/' })
    },
  })
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
    mutationFn: (idToken) => authApi.googleOAuth(idToken),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.data.tokens.access)
      localStorage.setItem('refresh_token', data.data.tokens.refresh)
      queryClient.setQueryData(queryKeys.auth.me(), data.data.user)
      const destination = data.data.user.role === ROLES.ADMIN
        ? '/admin'
        : landingRouteForResources(data.data.user.resources)
      navigate(postAuthDestination({ to: destination }))
    },
  })
}
