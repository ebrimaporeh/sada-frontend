import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FundraisingWidget } from './FundraisingWidget'

// Clicking Donate now renders the real DonateCheckout/OrganizationDonateCheckout
// (see DonateModal.jsx) instead of navigating away, so their dependencies
// need the same mocks DonateCheckout.test.jsx uses -- this suite only cares
// that the modal opens with the right content, not the donation form's own
// validation (already covered there).
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

// FundraisingWidget renders exactly one destination's card now -- embed
// carries the shared layout/configuration, destination is passed
// separately (see EmbedGallery.jsx, which is what actually resolves which
// destinations to render). is_active is no longer checked here at all --
// that moved up to EmbedGallery, gallery-wide -- see EmbedGallery.test.jsx.
function makeEmbed({ configuration, ...rest } = {}) {
  return {
    id: 'e1',
    layout: 'card',
    ...rest,
    configuration: { ...configuration },
  }
}

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

describe('FundraisingWidget', () => {
  it('shows the destination title and description by default', () => {
    render(<FundraisingWidget embed={makeEmbed()} destination={makeDestination()} />)
    expect(screen.getByText('Flood Relief Fund')).toBeInTheDocument()
    expect(screen.getByText('Help families in Basse.')).toBeInTheDocument()
  })

  it('content overrides win over the destination fields', () => {
    render(
      <FundraisingWidget
        embed={makeEmbed({ configuration: { content: { title: 'Support our mission' } } })}
        destination={makeDestination()}
      />,
    )
    expect(screen.getByText('Support our mission')).toBeInTheDocument()
    expect(screen.queryByText('Flood Relief Fund')).not.toBeInTheDocument()
  })

  it('shows progress for a campaign destination', () => {
    render(<FundraisingWidget embed={makeEmbed()} destination={makeDestination()} />)
    expect(screen.getByText(/raised of/)).toBeInTheDocument()
  })

  it('omits progress for an organization destination', () => {
    render(
      <FundraisingWidget embed={makeEmbed()} destination={makeDestination({ type: 'organization', raised: null, goal: null })} />,
    )
    expect(screen.queryByText(/raised of/)).not.toBeInTheDocument()
  })

  it('opens the in-place donate modal when interactive (the public page)', async () => {
    const user = userEvent.setup()
    render(<FundraisingWidget embed={makeEmbed()} destination={makeDestination()} interactive />)
    expect(screen.queryByText('Make a Donation')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Donate' }))
    expect(await screen.findByText('Make a Donation')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByText('Make a Donation')).not.toBeInTheDocument()
  })

  it('opens the organization donate modal for an organization destination', async () => {
    const user = userEvent.setup()
    render(
      <FundraisingWidget
        embed={makeEmbed()}
        destination={makeDestination({ type: 'organization', raised: null, goal: null })}
        interactive
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Donate' }))
    expect(await screen.findByText(/Support Flood Relief Fund/)).toBeInTheDocument()
  })

  it('renders a non-navigating look-alike when not interactive (Studio preview)', () => {
    render(<FundraisingWidget embed={makeEmbed()} destination={makeDestination()} interactive={false} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Donate')).toBeInTheDocument()
  })

  it.each(['card', 'compact', 'wide', 'horizontal', 'progress_focused'])(
    'renders the %s layout without crashing',
    (layout) => {
      render(<FundraisingWidget embed={makeEmbed({ layout })} destination={makeDestination()} />)
      expect(screen.getByText('Flood Relief Fund')).toBeInTheDocument()
    },
  )

  it('uses the custom donate button label when configured', () => {
    render(
      <FundraisingWidget
        embed={makeEmbed({ configuration: { content: { donateButtonText: 'Give Now' } } })}
        destination={makeDestination()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Give Now' })).toBeInTheDocument()
  })

  it('applies a custom button color and button radius', () => {
    render(
      <FundraisingWidget
        embed={makeEmbed({ configuration: { appearance: { buttonColor: '#ff0000', buttonRadius: 20 } } })}
        destination={makeDestination()}
      />,
    )
    const button = screen.getByRole('button', { name: 'Donate' })
    expect(button.style.backgroundColor).toBe('rgb(255, 0, 0)')
    expect(button.style.borderRadius).toBe('20px')
  })
})
