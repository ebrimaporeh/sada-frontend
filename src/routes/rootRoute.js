import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import { queryClient } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import { userApi } from '@/api/userApi'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

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

// Pages — admin
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { CampaignsPage as AdminCampaignsPage } from '@/pages/admin/CampaignsPage'
import { AdminCampaignDetailPage } from '@/pages/admin/AdminCampaignDetailPage'
import { DonationsPage as AdminDonationsPage } from '@/pages/admin/DonationsPage'
import { ReportsPage } from '@/pages/admin/ReportsPage'
import { VerificationsPage } from '@/pages/admin/VerificationsPage'
import { FinancesPage } from '@/pages/admin/FinancesPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
import { SettingsPage as AdminSettingsPage } from '@/pages/admin/SettingsPage'
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage'

import { ROLES, ROUTES } from '@/constants'

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
  if (user?.role !== ROLES.ADMIN) throw redirect({ to: ROUTES.DASHBOARD })
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
})

const adminCampaignsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_CAMPAIGNS,
  component: AdminCampaignsPage,
})

const adminCampaignDetailRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/campaigns/$id',
  component: AdminCampaignDetailPage,
})

const adminDonationsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_DONATIONS,
  component: AdminDonationsPage,
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin',
  component: AdminDashboardPage,
})

const adminReportsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/reports',
  component: ReportsPage,
})

const adminVerificationsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_VERIFICATIONS,
  component: VerificationsPage,
})

const adminFinancesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/finances',
  component: FinancesPage,
})

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/categories',
  component: CategoriesPage,
})

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/settings',
  component: AdminSettingsPage,
})

const adminProfileRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_PROFILE,
  component: AdminProfilePage,
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
    campaignNewRoute,
  ]),
  adminLayout.addChildren([
    adminDashboardRoute,
    adminUsersRoute,
    adminCampaignsRoute,
    adminCampaignDetailRoute,
    adminDonationsRoute,
    adminReportsRoute,
    adminVerificationsRoute,
    adminCategoriesRoute,
    adminFinancesRoute,
    adminSettingsRoute,
    adminProfileRoute,
  ]),
])

export const router = createRouter({ routeTree })
