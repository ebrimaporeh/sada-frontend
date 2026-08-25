import { createRouter, createRootRoute, createRoute, redirect, Outlet } from '@tanstack/react-router'
import { queryClient } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import { userApi } from '@/api/userApi'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Resource, hasResourceAccess, isAdminAreaRole, landingRouteForResources } from '@/utils/permissions'
import { SiteFavicon } from '@/components/custom/SiteFavicon'

// Pages — public
import { HomePage } from '@/pages/public/HomePage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/public/VerifyEmailPage'
import { ConfirmRecoveryEmailPage } from '@/pages/public/ConfirmRecoveryEmailPage'
import { CampaignsPage } from '@/pages/public/CampaignsPage'
import { CategoriesPage as PublicCategoriesPage } from '@/pages/public/CategoriesPage'
import { CampaignDetailPage } from '@/pages/public/CampaignDetailPage'
import { CampaignersPage } from '@/pages/public/CampaignersPage'
import { CampaignerDetailPage } from '@/pages/public/CampaignerDetailPage'
import { DonatePage } from '@/pages/public/DonatePage'
import { DonateSuccessPage } from '@/pages/public/DonateSuccessPage'
import { ZakatPage } from '@/pages/public/ZakatPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { HelpPage } from '@/pages/public/HelpPage'
import { TrustSafetyPage } from '@/pages/public/TrustSafetyPage'
import { PrivacyPage } from '@/pages/public/PrivacyPage'
import { TermsPage } from '@/pages/public/TermsPage'
import { VisionIndexPage } from '@/pages/public/VisionIndexPage'
import { VisionTopicPage } from '@/pages/public/VisionTopicPage'

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
import { AdminCampaignerDetailPage } from '@/pages/admin/AdminCampaignerDetailPage'
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
import { AdminVisionPage } from '@/pages/admin/AdminVisionPage'
import { AuditPage } from '@/pages/admin/AuditPage'

import { ROUTES } from '@/constants'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <SiteFavicon />
      <Outlet />
    </>
  ),
})

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
  if (!isAdminAreaRole(user)) throw redirect({ to: ROUTES.DASHBOARD })
}

// Per-route fine-grained check, layered under requireAdmin (which already
// guarantees auth + an admin-area role by the time a child route's
// beforeLoad runs). `user.resources` is live, admin-editable state (see
// src/utils/permissions.js), not a static per-role map. Pass an array to
// require any one of several resources -- e.g. the Staff page has two
// tabs gated on different resources, so its route shouldn't 404 someone
// who only has one of them.
function requireResource(resource) {
  const resourceList = Array.isArray(resource) ? resource : [resource]
  return () => {
    const user = queryClient.getQueryData(queryKeys.auth.me())
    if (!resourceList.some((r) => hasResourceAccess(user?.resources, r))) {
      throw redirect({ to: landingRouteForResources(user?.resources) })
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

const confirmRecoveryEmailRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.CONFIRM_RECOVERY_EMAIL,
  component: ConfirmRecoveryEmailPage,
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

const campaignersRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.CAMPAIGNERS,
  component: CampaignersPage,
})

const campaignerDetailRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.CAMPAIGNER_DETAIL,
  component: CampaignerDetailPage,
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

const zakatRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.ZAKAT,
  component: ZakatPage,
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

const visionIndexRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.VISION,
  component: VisionIndexPage,
})

const visionTopicRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: '/vision/$slug',
  component: VisionTopicPage,
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
  beforeLoad: requireResource(Resource.USERS_VIEW),
})

const adminUserDetailRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_USER_DETAIL,
  component: AdminCampaignerDetailPage,
  beforeLoad: requireResource(Resource.USERS_VIEW),
})

const adminStaffRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_STAFF,
  component: StaffPage,
  beforeLoad: requireResource([Resource.STAFF_VIEW, Resource.ROLES_MANAGE]),
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
  beforeLoad: requireResource(Resource.DONATIONS_VIEW),
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin',
  component: AdminDashboardPage,
  beforeLoad: requireResource(Resource.DASHBOARD_VIEW),
})

const adminReportsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/reports',
  component: ReportsPage,
  beforeLoad: requireResource(Resource.REPORTS_VIEW),
})

const adminVerificationsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_VERIFICATIONS,
  component: VerificationsPage,
  beforeLoad: requireResource(Resource.VERIFICATIONS_VIEW),
})

const adminFinancesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/finances',
  component: FinancesPage,
  beforeLoad: requireResource(Resource.FINANCES_VIEW),
})

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/categories',
  component: CategoriesPage,
  beforeLoad: requireResource(Resource.CATEGORIES_VIEW),
})

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: '/admin/settings',
  component: AdminSettingsPage,
  beforeLoad: requireResource(Resource.SETTINGS_EDIT),
})

const adminVisionRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_VISION,
  component: AdminVisionPage,
  beforeLoad: requireResource(Resource.SETTINGS_EDIT),
})

const adminAuditRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: ROUTES.ADMIN_AUDIT,
  component: AuditPage,
  beforeLoad: requireResource(Resource.AUDIT_VIEW),
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
    confirmRecoveryEmailRoute,
    campaignsRoute,
    categoriesRoute,
    campaignDetailRoute,
    campaignersRoute,
    campaignerDetailRoute,
    donateRoute,
    donateSuccessRoute,
    zakatRoute,
    aboutRoute,
    helpRoute,
    trustSafetyRoute,
    privacyRoute,
    termsRoute,
    visionIndexRoute,
    visionTopicRoute,
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
    adminUserDetailRoute,
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
    adminVisionRoute,
    adminAuditRoute,
    adminProfileRoute,
  ]),
])

export const router = createRouter({ routeTree })
