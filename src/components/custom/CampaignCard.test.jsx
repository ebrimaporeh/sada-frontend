import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CampaignCard } from './CampaignCard'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }) => <a className={className}>{children}</a>,
}))

const baseCampaign = {
  slug: 'clean-water-for-basse',
  title: 'Clean Water for Basse',
  raised: 25000,
  goal: 50000,
  donors_count: 128,
  deadline: '2099-01-01',
}

describe('CampaignCard', () => {
  it('shows the funding percentage and donor count', () => {
    render(<CampaignCard campaign={baseCampaign} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('128 donors')).toBeInTheDocument()
    expect(screen.getByText('Clean Water for Basse')).toBeInTheDocument()
  })

  it('shows the FUNDED badge once the goal is met or exceeded', () => {
    render(<CampaignCard campaign={{ ...baseCampaign, raised: 60000 }} />)
    expect(screen.getByText('FUNDED')).toBeInTheDocument()
  })

  it('does not show the FUNDED badge before the goal is reached', () => {
    render(<CampaignCard campaign={baseCampaign} />)
    expect(screen.queryByText('FUNDED')).not.toBeInTheDocument()
  })

  it('shows an URGENT badge only when the campaign is flagged urgent', () => {
    const { rerender } = render(<CampaignCard campaign={baseCampaign} />)
    expect(screen.queryByText('URGENT')).not.toBeInTheDocument()

    rerender(<CampaignCard campaign={{ ...baseCampaign, is_urgent: true }} />)
    expect(screen.getByText('URGENT')).toBeInTheDocument()
  })

  it('shows "Ended" once the deadline has passed instead of a negative day count', () => {
    render(<CampaignCard campaign={{ ...baseCampaign, deadline: '2000-01-01' }} />)
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })

  it('shows "Ongoing" instead of "Ended" for a campaign with no deadline', () => {
    render(<CampaignCard campaign={{ ...baseCampaign, deadline: null }} />)
    expect(screen.getByText('Ongoing')).toBeInTheDocument()
    expect(screen.queryByText('Ended')).not.toBeInTheDocument()
  })
})
