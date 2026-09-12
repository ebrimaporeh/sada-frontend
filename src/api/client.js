import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Vite replaces import.meta.env.VITE_* with a literal string at build time
// (npm run build), not at runtime -- editing this var in Vercel's dashboard
// has no effect on an already-built deployment until a fresh build actually
// runs (push a commit, or Redeploy with build cache off).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── Request interceptor ────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response interceptor ───────────────────────────────────────────────────

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token')

      // No refresh token means the user was never authenticated - let the
      // error propagate so React Query can handle it without redirecting.
      if (!refreshToken) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        })
        const newAccessToken = data.access
        localStorage.setItem('access_token', newAccessToken)
        // ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION are on server-side,
        // so the refresh token this request used is now blacklisted -- the
        // response's new one must replace it or the *next* refresh 401s.
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh)
        }
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        _clearAuthAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

function _clearAuthAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  window.location.href = '/login'
}

// ─── Cross-tab identity guard ───────────────────────────────────────────────
//
// access_token/refresh_token live in localStorage, which is shared by every
// tab of the app. If tab A is logged in as user 1 and someone logs out and
// back in as user 2 in tab B (a shared/kiosk device, or just a second tab),
// tab A never re-authenticates -- but its next background request (e.g. the
// notifications poll) picks up user 2's token from localStorage anyway
// (the request interceptor above reads it fresh every time) and writes the
// response into tab A's *existing* React Query cache, which isn't namespaced
// per user. Result: tab A silently starts rendering user 2's private data
// under a UI that still looks like user 1 is signed in.
//
// The `storage` event fires in every other tab (never the one that made the
// write) whenever localStorage changes, so it's the one hook available to
// detect this without polling. We only act when the *identity* actually
// changed -- decoded from the JWT's `user_id` claim, no network call needed
// -- so a same-user token refresh in another tab (normal, routine) doesn't
// force everyone else to reload.

function _decodeJwtUserId(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded)).user_id ?? null
  } catch {
    return null
  }
}

window.addEventListener('storage', (event) => {
  if (event.key !== 'access_token' && event.key !== 'refresh_token') return

  const newAccessToken = localStorage.getItem('access_token')
  if (!newAccessToken) {
    // Logged out in another tab -- follow suit here too.
    queryClient.clear()
    window.location.href = '/login'
    return
  }

  const cachedUser = queryClient.getQueryData(queryKeys.auth.me())
  const incomingUserId = _decodeJwtUserId(newAccessToken)
  if (cachedUser && incomingUserId != null && String(cachedUser.id) !== String(incomingUserId)) {
    // A different account signed in from another tab. This tab's cache may
    // hold the previous account's data under keys that aren't scoped by
    // user id -- drop it all rather than risk serving it to the new identity.
    queryClient.clear()
    window.location.reload()
  }
})
