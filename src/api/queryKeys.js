export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'],
  },
  users: {
    all: () => ['users'],
    list: (params) => ['users', 'list', params],
    detail: (id) => ['users', 'detail', id],
  },
  staff: {
    all: () => ['staff'],
    list: (params) => ['staff', 'list', params],
  },
  verification: {
    mine: () => ['verification', 'mine'],
    adminList: (params) => ['verification', 'admin', params],
  },
  organizationVerification: {
    mine: () => ['organization-verification', 'mine'],
    adminList: (params) => ['organization-verification', 'admin', params],
  },
  organizationChangeRequest: {
    mine: () => ['organization-change-request', 'mine'],
    adminList: (params) => ['organization-change-request', 'admin', params],
  },
  campaigners: {
    list: (params) => ['campaigners', 'list', params],
    detail: (id) => ['campaigners', 'detail', id],
  },
  campaigns: {
    all: () => ['campaigns'],
    list: (filters) => ['campaigns', 'list', filters],
    detail: (slug) => ['campaigns', 'detail', slug],
    mine: () => ['campaigns', 'mine'],
    myDetail: (slug) => ['campaigns', 'mine', slug],
    categories: () => ['campaigns', 'categories'],
    featured: () => ['campaigns', 'featured'],
    publicStats: () => ['campaigns', 'public-stats'],
    adminList: (params) => ['campaigns', 'admin', params],
    adminDetail: (id) => ['campaigns', 'admin', 'detail', id],
  },
  donations: {
    mine: () => ['donations', 'mine'],
    campaign: (slug) => ['donations', 'campaign', slug],
    publicCampaign: (slug) => ['donations', 'campaign', slug, 'public'],
    adminList: (params) => ['donations', 'admin', params],
    // Prefix of adminList()'s key -- invalidate this (not adminList() itself,
    // which is params-specific) to refresh every admin donations list query
    // regardless of its current page/filter params.
    adminAll: () => ['donations', 'admin'],
  },
  payments: {
    gateways: () => ['payments', 'gateways'],
    payouts: (slug) => ['payments', 'payouts', slug],
    adminCampaignPayouts: (campaignId) => ['payments', 'admin', 'campaign-payouts', campaignId],
    settings: () => ['payments', 'settings'],
    feePreview: (amount, provider) => ['payments', 'fee-preview', amount, provider],
  },
  notifications: {
    all: () => ['notifications'],
    list: (params) => ['notifications', 'list', params],
    unreadCount: () => ['notifications', 'unread-count'],
  },
  admin: {
    reports: (params) => ['admin', 'reports', params],
    financeSummary: (params) => ['admin', 'finance-summary', params],
  },
  siteSettings: {
    all: () => ['site-settings'],
  },
  legalContent: {
    all: () => ['legal-content'],
  },
  zakat: {
    settings: () => ['zakat', 'settings'],
    recommendedCampaigns: (limit) => ['zakat', 'recommended-campaigns', limit],
  },
  vision: {
    all: () => ['vision'],
    list: () => ['vision', 'list'],
    detail: (slug) => ['vision', 'detail', slug],
    adminAll: () => ['vision', 'admin'],
    adminDetail: (slug) => ['vision', 'admin', slug],
  },
}
