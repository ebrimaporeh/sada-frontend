export const settings = {
  siteName: import.meta.env.VITE_SITE_NAME || 'GambiaFund',
  siteDescription: import.meta.env.VITE_SITE_DESCRIPTION || 'Crowdfunding for The Gambia',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
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
    minAmount: 50,
  },
}
