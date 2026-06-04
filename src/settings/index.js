export const settings = {
  siteName: import.meta.env.VITE_SITE_NAME || 'My App',
  siteDescription: import.meta.env.VITE_SITE_DESCRIPTION || 'A great application',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',

  defaultTheme: 'system',

  features: {
    enableNotifications: true,
    enableMarketingEmails: false,
    enableSocialLogin: false,
  },

  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
}
