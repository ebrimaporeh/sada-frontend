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
    mine: (organizationId) => ['organization-verification', 'mine', organizationId],
    adminList: (params) => ['organization-verification', 'admin', params],
  },
  organizations: {
    types: () => ['organizations', 'types'],
    mine: () => ['organizations', 'mine'],
    detail: (id) => ['organizations', 'detail', id],
    roles: (id) => ['organizations', 'detail', id, 'roles'],
    members: (id) => ['organizations', 'detail', id, 'members'],
    invitations: (id) => ['organizations', 'detail', id, 'invitations'],
    myInvitations: () => ['organizations', 'invitations', 'mine'],
    invitationPreview: (token) => ['organizations', 'invitations', 'preview', token],
    adminList: (params) => ['organizations', 'admin', params],
    adminDetail: (id) => ['organizations', 'admin', 'detail', id],
    adminMembers: (id) => ['organizations', 'admin', 'detail', id, 'members'],
  },
  organizationChangeRequest: {
    mine: () => ['organization-change-request', 'mine'],
    adminList: (params) => ['organization-change-request', 'admin', params],
  },
  fundraisers: {
    list: (params) => ['fundraisers', 'list', params],
    detail: (id) => ['fundraisers', 'detail', id],
  },
  campaigns: {
    all: () => ['campaigns'],
    list: (filters) => ['campaigns', 'list', filters],
    detail: (slug) => ['campaigns', 'detail', slug],
    mine: () => ['campaigns', 'mine'],
    myDetail: (slug) => ['campaigns', 'mine', slug],
    categories: () => ['campaigns', 'categories'],
    featured: () => ['campaigns', 'featured'],
    hero: () => ['campaigns', 'hero'],
    publicStats: () => ['campaigns', 'public-stats'],
    adminList: (params) => ['campaigns', 'admin', params],
    adminDetail: (id) => ['campaigns', 'admin', 'detail', id],
  },
  donations: {
    mine: () => ['donations', 'mine'],
    campaign: (slug) => ['donations', 'campaign', slug],
    campaignPaginated: (slug, params) => ['donations', 'campaign', slug, 'paginated', params],
    publicCampaign: (slug, params) => ['donations', 'campaign', slug, 'public', params],
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
    adminOwnerPayouts: (ownerId) => ['payments', 'admin', 'owner-payouts', ownerId],
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
  audit: {
    list: (params) => ['audit', 'list', params],
    actions: () => ['audit', 'actions'],
    actors: () => ['audit', 'actors'],
  },
  permissions: {
    roles: () => ['permissions', 'roles'],
  },
}
