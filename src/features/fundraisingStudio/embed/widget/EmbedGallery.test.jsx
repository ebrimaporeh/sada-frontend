import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmbedGallery } from './EmbedGallery'

// Same dependency mocks FundraisingWidget.test.jsx needs -- each gallery
// card is a real FundraisingWidget, which (via DonateModal) pulls in the
// full donate-checkout dependency tree.
vi.mock('@tanstack/react-router', () => ({
  useSearch: () => ({}),
  Link: ({ children }) => <a>{children}</a>,
}))

vi.mock('@/hooks/useAuth', () => ({
  useMe: () => ({ data: undefined }),
}))

vi.mock('@/hooks/usePageMeta', () => ({
  usePageMeta: () => {},
}))

vi.mock('@/hooks/useDonations', () => ({
  useDonateToCampaign: () => ({ mutate: vi.fn(), isPending: false }),
  useDonateToOrganization: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/usePayments', () => ({
  useDonationMethods: () => ({ methods: [], isLoading: false }),
}))

function makeDestination(overrides = {}) {
  return {
    type: 'campaign',
    id: 'c1',
    title: 'Flood Relief Fund',
    description: 'Help families in Basse.',
    cover_image_url: null,
    raised: 2500,
    goal: 10000,
    donation_url: 'https://dolelma.org/donate/flood-relief',
    ...overrides,
  }
}

function makeEmbed(overrides = {}) {
  return {
    id: 'e1',
    layout: 'card',
    is_active: true,
    configuration: {},
    organization: { id: 'org1', organization_name: 'Test Org', logo_url: null },
    destinations: [],
    ...overrides,
  }
}

describe('EmbedGallery', () => {
  it('renders one card per destination', () => {
    render(
      <EmbedGallery
        embed={makeEmbed({
          destinations: [
            makeDestination({ id: 'c1', title: 'Flood Relief Fund' }),
            makeDestination({ id: 'c2', title: 'School Rebuild', type: 'organization', raised: null, goal: null }),
          ],
        })}
      />,
    )
    expect(screen.getByText('Flood Relief Fund')).toBeInTheDocument()
    expect(screen.getByText('School Rebuild')).toBeInTheDocument()
  })

  it('shows the organization name as a header', () => {
    render(<EmbedGallery embed={makeEmbed({ destinations: [makeDestination()] })} />)
    expect(screen.getByText('Test Org')).toBeInTheDocument()
  })

  it('shows an explicit empty state when there are no destinations', () => {
    render(<EmbedGallery embed={makeEmbed({ destinations: [] })} />)
    expect(screen.getByText(/nothing to show here yet/i)).toBeInTheDocument()
  })

  it('shows an inactive message and no cards when the embed is inactive', () => {
    render(<EmbedGallery embed={makeEmbed({ is_active: false, destinations: [makeDestination()] })} />)
    expect(screen.getByText(/no longer active/i)).toBeInTheDocument()
    expect(screen.queryByText('Flood Relief Fund')).not.toBeInTheDocument()
  })
})
