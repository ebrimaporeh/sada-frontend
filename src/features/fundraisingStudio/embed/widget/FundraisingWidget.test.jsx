import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FundraisingWidget } from './FundraisingWidget'

function makeEmbed({ destination, configuration, ...rest } = {}) {
  return {
    id: 'e1',
    layout: 'card',
    is_active: true,
    ...rest,
    configuration: { ...configuration },
    destination: {
      type: 'campaign',
      title: 'Flood Relief Fund',
      description: 'Help families in Basse.',
      cover_image_url: null,
      raised: 2500,
      goal: 10000,
      donation_url: 'https://dolelma.org/donate/flood-relief',
      ...destination,
    },
  }
}

describe('FundraisingWidget', () => {
  it('shows the destination title and description by default', () => {
    render(<FundraisingWidget embed={makeEmbed()} />)
    expect(screen.getByText('Flood Relief Fund')).toBeInTheDocument()
    expect(screen.getByText('Help families in Basse.')).toBeInTheDocument()
  })

  it('content overrides win over the destination fields', () => {
    render(<FundraisingWidget embed={makeEmbed({ configuration: { content: { title: 'Support our mission' } } })} />)
    expect(screen.getByText('Support our mission')).toBeInTheDocument()
    expect(screen.queryByText('Flood Relief Fund')).not.toBeInTheDocument()
  })

  it('shows progress for a campaign destination', () => {
    render(<FundraisingWidget embed={makeEmbed()} />)
    expect(screen.getByText(/raised of/)).toBeInTheDocument()
  })

  it('omits progress for an organization destination', () => {
    render(<FundraisingWidget embed={makeEmbed({ destination: { type: 'organization', raised: null, goal: null } })} />)
    expect(screen.queryByText(/raised of/)).not.toBeInTheDocument()
  })

  it('shows an inactive message and no Donate control when the embed is inactive', () => {
    render(<FundraisingWidget embed={makeEmbed({ is_active: false })} />)
    expect(screen.getByText(/no longer active/)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders a real link with target="_top" when interactive (the public page)', () => {
    render(<FundraisingWidget embed={makeEmbed()} interactive />)
    const link = screen.getByRole('link', { name: 'Donate' })
    expect(link).toHaveAttribute('href', 'https://dolelma.org/donate/flood-relief')
    expect(link).toHaveAttribute('target', '_top')
  })

  it('renders a non-navigating look-alike when not interactive (Studio preview)', () => {
    render(<FundraisingWidget embed={makeEmbed()} interactive={false} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Donate')).toBeInTheDocument()
  })

  it.each(['card', 'compact', 'wide', 'horizontal', 'progress_focused'])(
    'renders the %s layout without crashing',
    (layout) => {
      render(<FundraisingWidget embed={makeEmbed({ layout })} />)
      expect(screen.getByText('Flood Relief Fund')).toBeInTheDocument()
    },
  )

  it('uses the custom donate button label when configured', () => {
    render(<FundraisingWidget embed={makeEmbed({ configuration: { content: { donateButtonText: 'Give Now' } } })} />)
    expect(screen.getByRole('link', { name: 'Give Now' })).toBeInTheDocument()
  })
})
