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
  },
  payments: {
    payouts: (slug) => ['payments', 'payouts', slug],
    settings: () => ['payments', 'settings'],
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
}
