import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import { queryClient } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import { userApi } from '@/api/userApi'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { DashboardPage } from '@/pages/authenticated/DashboardPage'
import { ProfilePage } from '@/pages/authenticated/ProfilePage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { ROLES, ROUTES } from '@/constants'

const rootRoute = createRootRoute()

// ─── Auth Guard Helper ────────────────────────────────────────────────────────

async function requireAuth() {
  const token = localStorage.getItem('access_token')
  if (!token) throw redirect({ to: ROUTES.LOGIN })
  try {
    await queryClient.fetchQuery({ queryKey: queryKeys.auth.me(), queryFn: userApi.getMe })
  } catch {
    throw redirect({ to: ROUTES.LOGIN })
  }
}

async function requireAdmin() {
  await requireAuth()
  const user = queryClient.getQueryData(queryKeys.auth.me())
  if (user?.role !== ROLES.ADMIN) throw redirect({ to: ROUTES.DASHBOARD })
}

// ─── Public Routes ────────────────────────────────────────────────────────────

const publicLayout = createRoute({ getParentRoute: () => rootRoute, id: 'public', component: PublicLayout })

const loginRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.LOGIN,
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.REGISTER,
  component: RegisterPage,
})

// ─── Authenticated Routes ─────────────────────────────────────────────────────

const authLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  component: AuthenticatedLayout,
  beforeLoad: requireAuth,
})

const dashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.DASHBOARD,
  component: DashboardPage,
})

const profileRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.PROFILE,
  component: ProfilePage,
})

// ─── Admin Routes ─────────────────────────────────────────────────────────────

const adminLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin',
  component: AdminLayout,
  beforeLoad: requireAdmin,
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_USERS,
  component: UsersPage,
})

// ─── Index redirect ───────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: ROUTES.DASHBOARD }) },
})

// ─── Router ───────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicLayout.addChildren([loginRoute, registerRoute]),
  authLayout.addChildren([dashboardRoute, profileRoute]),
  adminLayout.addChildren([adminUsersRoute]),
])

export const router = createRouter({ routeTree })
