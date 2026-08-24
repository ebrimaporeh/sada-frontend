import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminLayout } from './AdminLayout'

// The admin shell (SidebarBrand -> Logo) reads site branding via
// useSiteSettings(), a react-query hook -- needs a real QueryClient in the
// tree even though this test never lets that query resolve.
function renderAdminLayout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminLayout />
    </QueryClientProvider>,
  )
}

// AdminLayout is the actual gate keeping non-admin-area users out of every
// /admin/* page -- worth locking down directly, not just the resource-check
// logic it's built on (already covered in utils/permissions.test.js).

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div>admin-outlet-content</div>,
  Link: ({ children }) => <a>{children}</a>,
  Navigate: ({ to }) => <div>navigate-to:{to}</div>,
}))

vi.mock('@/hooks/useAdmin', () => ({
  useAdminBadgeCounts: () => ({ pendingReports: 0, pendingVerifications: 0 }),
}))

let meState = { data: undefined, isLoading: true }
vi.mock('@/hooks/useAuth', () => ({
  useMe: () => meState,
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('AdminLayout', () => {
  it('shows a loading state while the current user is still resolving', () => {
    meState = { data: undefined, isLoading: true }
    renderAdminLayout()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirects a user with no admin-area resources to the regular dashboard', () => {
    meState = { data: { role: 'user', resources: [] }, isLoading: false }
    renderAdminLayout()
    expect(screen.getByText('navigate-to:/dashboard')).toBeInTheDocument()
    expect(screen.queryByText('admin-outlet-content')).not.toBeInTheDocument()
  })

  it('renders the admin shell for an actual admin', () => {
    meState = { data: { role: 'admin', resources: ['dashboard_view'] }, isLoading: false }
    renderAdminLayout()
    expect(screen.getByText('admin-outlet-content')).toBeInTheDocument()
  })

  it('renders the admin shell for a non-admin role that has real granted resources', () => {
    meState = { data: { role: 'moderator', resources: ['campaigns_view'] }, isLoading: false }
    renderAdminLayout()
    expect(screen.getByText('admin-outlet-content')).toBeInTheDocument()
  })
})
