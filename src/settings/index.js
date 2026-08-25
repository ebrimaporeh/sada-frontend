// Same build-time-only caveat as src/api/client.js's BASE_URL -- this repo
// reads VITE_API_URL independently in two places, so a value change needs
// both a fresh build AND (if you ever change the fallback) an edit here too.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const settings = {
  siteName: import.meta.env.VITE_SITE_NAME || 'Dolelma',
  siteDescription: import.meta.env.VITE_SITE_DESCRIPTION || 'Crowdfunding for The Gambia',
  apiUrl,
  // The bare backend origin (no /api/v1 suffix) -- used for the
  // server-rendered social-share preview pages (see apps/seo on the
  // backend), which need a real page load, not an API call.
  apiOrigin: apiUrl.replace(/\/api\/v1\/?$/, ''),
  currency: 'GMD',
  currencySymbol: 'D',
  country: 'The Gambia',
  defaultTheme: 'system',

  features: {
    enableNotifications: true,
    enableMarketingEmails: false,
    enableSocialLogin: false,
    demoMode: true,
  },

  pagination: {
    defaultPageSize: 12,
    pageSizeOptions: [12, 24, 48],
  },

  donate: {
    presets: [100, 250, 500, 1000, 2500, 5000],
    // Fallback only -- the real min/max is admin-configurable per gateway
    // (Admin Settings > Payments) and loaded live via useDonationMethods()
    // (see DonateCheckout.jsx). These just cover the brief window before
    // that loads, or if it fails to.
    minAmount: 50,
    maxAmount: 10000,
  },
}
