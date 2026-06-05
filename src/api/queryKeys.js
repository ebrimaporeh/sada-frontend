export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'],
  },
  users: {
    all: () => ['users'],
    list: (params) => ['users', 'list', params],
    detail: (id) => ['users', 'detail', id],
  },
  campaigns: {
    all: () => ['campaigns'],
    list: (filters) => ['campaigns', 'list', filters],
    detail: (slug) => ['campaigns', 'detail', slug],
    mine: () => ['campaigns', 'mine'],
    myDetail: (slug) => ['campaigns', 'mine', slug],
    categories: () => ['campaigns', 'categories'],
    adminList: (params) => ['campaigns', 'admin', params],
  },
  donations: {
    mine: () => ['donations', 'mine'],
    campaign: (slug) => ['donations', 'campaign', slug],
    adminList: (params) => ['donations', 'admin', params],
  },
  payments: {
    payouts: (slug) => ['payments', 'payouts', slug],
  },
  notifications: {
    list: () => ['notifications'],
    unreadCount: () => ['notifications', 'unread-count'],
  },
}
