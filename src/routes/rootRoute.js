import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import { queryClient } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import { userApi } from '@/api/userApi'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Resource, hasResourceAccess, isAdminAreaRole, ROLE_LANDING_ROUTE } from '@/utils/permissions'

// Pages — public
import { HomePage } from '@/pages/public/HomePage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/public/VerifyEmailPage'
import { CampaignsPage } from '@/pages/public/CampaignsPage'
import { CategoriesPage as PublicCategoriesPage } from '@/pages/public/CategoriesPage'
import { CampaignDetailPage } from '@/pages/public/CampaignDetailPage'
import { DonatePage } from '@/pages/public/DonatePage'
import { DonateSuccessPage } from '@/pages/public/DonateSuccessPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { HelpPage } from '@/pages/public/HelpPage'
import { TrustSafetyPage } from '@/pages/public/TrustSafetyPage'
import { PrivacyPage } from '@/pages/public/PrivacyPage'
import { TermsPage } from '@/pages/public/TermsPage'

// Pages — authenticated
import { DashboardPage } from '@/pages/authenticated/DashboardPage'
import { MyCampaignsPage } from '@/pages/authenticated/MyCampaignsPage'
import { MyCampaignDetailPage } from '@/pages/authenticated/MyCampaignDetailPage'
import { ProfilePage } from '@/pages/authenticated/ProfilePage'
import { CampaignNewPage } from '@/pages/authenticated/CampaignNewPage'
import { SettingsPage } from '@/pages/authenticated/SettingsPage'
import { NotificationsPage } from '@/pages/authenticated/NotificationsPage'
import { VerificationPage } from '@/pages/authenticated/VerificationPage'

// Pages — admin
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { StaffPage } from '@/pages/admin/StaffPage'
import { CampaignsPage as AdminCampaignsPage } from '@/pages/admin/CampaignsPage'
import { AdminCampaignDetailPage } from '@/pages/admin/AdminCampaignDetailPage'
import { DonationsPage as AdminDonationsPage } from '@/pages/admin/DonationsPage'
import { ReportsPage } from '@/pages/admin/ReportsPage'
import { VerificationsPage } from '@/pages/admin/VerificationsPage'
import { FinancesPage } from '@/pages/admin/FinancesPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
import { SettingsPage as AdminSettingsPage } from '@/pages/admin/SettingsPage'
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage'

import { ROUTES } from '@/constants'

const rootRoute = createRootRoute()

// ─── Auth Guards ──────────────────────────────────────────────────────────────

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
  if (!isAdminAreaRole(user?.role)) throw redirect({ to: ROUTES.DASHBOARD })
}

// Per-route fine-grained check, layered under requireAdmin (which already
// guarantees auth + an admin-area role by the time a child route's
// beforeLoad runs) — see src/utils/permissions.js for the actual map.
function requireResource(resource) {
  return () => {
    const user = queryClient.getQueryData(queryKeys.auth.me())
    if (!hasResourceAccess(user?.role, resource)) {
      throw redirect({ to: ROLE_LANDING_ROUTE[user?.role] || ROUTES.DASHBOARD })
    }
  }
}

// ─── Public Layout ────────────────────────────────────────────────────────────

const publicLayout = createRoute({ getParentRoute: () => rootRoute, id: 'public', component: PublicLayout })

const homeRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.HOME,
  component: HomePage,
})

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

const forgotPasswordRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.FORGOT_PASSWORD,
  component: ForgotPasswordPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.RESET_PASSWORD,
  component: ResetPasswordPage,
})

const verifyEmailRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.VERIFY_EMAIL,
  component: VerifyEmailPage,
})

const campaignsRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.CAMPAIGNS,
  component: CampaignsPage,
})

const categoriesRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.CATEGORIES,
  component: PublicCategoriesPage,
})

const campaignDetailRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: '/campaigns/$slug',
  component: CampaignDetailPage,
})

const donateRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: '/donate/$slug',
  component: DonatePage,
})

const donateSuccessRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: '/donate/$slug/success',
  component: DonateSuccessPage,
})

const aboutRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.ABOUT,
  component: AboutPage,
})

const helpRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.HELP,
  component: HelpPage,
})

const trustSafetyRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.TRUST_SAFETY,
  component: TrustSafetyPage,
})

const privacyRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.PRIVACY,
  component: PrivacyPage,
})

const termsRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.TERMS,
  component: TermsPage,
})

// ─── Authenticated Layout ─────────────────────────────────────────────────────

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

const myCampaignsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.MY_CAMPAIGNS,
  component: MyCampaignsPage,
})

const myCampaignDetailRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.MY_CAMPAIGN_DETAIL,
  component: MyCampaignDetailPage,
})

const profileRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.PROFILE,
  component: ProfilePage,
})

const settingsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.SETTINGS,
  component: SettingsPage,
})

const notificationsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.NOTIFICATIONS,
  component: NotificationsPage,
})

const verificationRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.VERIFICATION,
  component: VerificationPage,
})

const campaignNewRoute = createRoute({
  getParentRoute: () => authLayout,
  path: ROUTES.CAMPAIGN_NEW,
  component: CampaignNewPage,
})

// ─── Admin Layout ─────────────────────────────────────────────────────────────

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
  beforeLoad: requireResource(Resource.USERS),
})

const adminStaffRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_STAFF,
  component: StaffPage,
  beforeLoad: requireResource(Resource.STAFF),
})

const adminCampaignsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_CAMPAIGNS,
  component: AdminCampaignsPage,
  beforeLoad: requireResource(Resource.CAMPAIGNS_VIEW),
})

const adminCampaignDetailRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/campaigns/$id',
  component: AdminCampaignDetailPage,
  beforeLoad: requireResource(Resource.CAMPAIGNS_VIEW),
})

const adminDonationsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_DONATIONS,
  component: AdminDonationsPage,
  beforeLoad: requireResource(Resource.DONATIONS),
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin',
  component: AdminDashboardPage,
  beforeLoad: requireResource(Resource.DASHBOARD),
})

const adminReportsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/reports',
  component: ReportsPage,
  beforeLoad: requireResource(Resource.REPORTS),
})

const adminVerificationsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_VERIFICATIONS,
  component: VerificationsPage,
  beforeLoad: requireResource(Resource.VERIFICATIONS),
})

const adminFinancesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/finances',
  component: FinancesPage,
  beforeLoad: requireResource(Resource.FINANCES),
})

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/categories',
  component: CategoriesPage,
  beforeLoad: requireResource(Resource.CATEGORIES),
})

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/settings',
  component: AdminSettingsPage,
  beforeLoad: requireResource(Resource.SETTINGS),
})

const adminProfileRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_PROFILE,
  component: AdminProfilePage,
})

const adminVerificationRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_VERIFICATION,
  component: VerificationPage,
})

// ─── Router ───────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  publicLayout.addChildren([
    homeRoute,
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    verifyEmailRoute,
    campaignsRoute,
    categoriesRoute,
    campaignDetailRoute,
    donateRoute,
    donateSuccessRoute,
    aboutRoute,
    helpRoute,
    trustSafetyRoute,
    privacyRoute,
    termsRoute,
  ]),
  authLayout.addChildren([
    dashboardRoute,
    myCampaignsRoute,
    myCampaignDetailRoute,
    profileRoute,
    settingsRoute,
    notificationsRoute,
    verificationRoute,
    campaignNewRoute,
  ]),
  adminLayout.addChildren([
    adminDashboardRoute,
    adminUsersRoute,
    adminStaffRoute,
    adminCampaignsRoute,
    adminCampaignDetailRoute,
    adminDonationsRoute,
    adminReportsRoute,
    adminVerificationsRoute,
    adminVerificationRoute,
    adminCategoriesRoute,
    adminFinancesRoute,
    adminSettingsRoute,
    adminProfileRoute,
  ]),
])

export const router = createRouter({ routeTree })
