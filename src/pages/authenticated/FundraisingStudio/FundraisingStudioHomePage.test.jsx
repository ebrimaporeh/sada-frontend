import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FundraisingStudioHomePage } from './FundraisingStudioHomePage'
import { usePosters } from '@/hooks/usePosters'
import { useOrganizationEmbed } from '@/hooks/useEmbeds'
import { useFundraisingDestinations } from '@/features/fundraisingStudio/shared/useFundraisingDestinations'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className, title }) => <a className={className} title={title}>{children}</a>,
}))

// No canvas 2D context polyfill in this project's jsdom setup (see
// .claude/frontend/fundraising.md's "Known gaps") -- same reason no test
// renders the real Konva <Stage> tree. A shallow stand-in is enough to
// prove the hub page actually reaches for a poster's real design/thumbnail
// instead of a generic icon.
vi.mock('@/features/fundraisingStudio/poster/PosterThumbnail', () => ({
  PosterThumbnail: ({ design }) => <div data-testid="poster-thumbnail">{design?.elements?.length} elements</div>,
}))

vi.mock('@/hooks/usePosters')
vi.mock('@/hooks/useEmbeds')
vi.mock('@/features/fundraisingStudio/shared/useFundraisingDestinations')

function mockPosters(posters) {
  usePosters.mockReturnValue({ posters, count: posters.length, isLoading: false })
}

function mockDestinations(organizationDestinations) {
  useFundraisingDestinations.mockReturnValue({ organizationDestinations, isLoading: false })
}

const poster = (overrides) => ({
  id: 'p1', name: 'Ramadan Poster', destination: { title: 'Build New Mosque' },
  design: { elements: [{ id: 'a', type: 'text' }] },
  ...overrides,
})

const org = (overrides) => ({ type: 'organization', id: 'org1', title: 'Al-Madina Mosque', ...overrides })

describe('FundraisingStudioHomePage', () => {
  it('renders the Design Studio heading', () => {
    mockPosters([])
    mockDestinations([])
    render(<FundraisingStudioHomePage />)
    expect(screen.getByText('Design Studio')).toBeInTheDocument()
  })

  it('prompts to create a poster when there are none yet', () => {
    mockPosters([])
    mockDestinations([])
    render(<FundraisingStudioHomePage />)
    expect(screen.getByText('No posters yet')).toBeInTheDocument()
  })

  it('shows a real thumbnail per poster instead of a generic placeholder', () => {
    mockPosters([poster(), poster({ id: 'p2' })])
    mockDestinations([])
    render(<FundraisingStudioHomePage />)
    expect(screen.getAllByTestId('poster-thumbnail')).toHaveLength(2)
  })

  it('links to the full list only once there are more posters than the strip shows', () => {
    mockPosters([poster({ id: 'p1' }), poster({ id: 'p2' })])
    mockDestinations([])
    render(<FundraisingStudioHomePage />)
    expect(screen.queryByText('View all')).not.toBeInTheDocument()

    mockPosters(Array.from({ length: 5 }, (_, i) => poster({ id: `p${i}` })))
    mockDestinations([])
    render(<FundraisingStudioHomePage />)
    expect(screen.getByText('View all')).toBeInTheDocument()
  })

  it('prompts for an organization when the user manages none', () => {
    mockPosters([])
    mockDestinations([])
    render(<FundraisingStudioHomePage />)
    expect(screen.getByText('No organization to manage fundraising materials for yet')).toBeInTheDocument()
  })

  it('shows the real embed status for the single organization case', () => {
    mockPosters([])
    mockDestinations([org()])
    useOrganizationEmbed.mockReturnValue({
      embed: {
        name: 'Al-Madina Mosque Embed', layout: 'card', is_active: true, destinations: [{ id: 'd1' }, { id: 'd2' }],
      },
      isLoading: false,
    })
    render(<FundraisingStudioHomePage />)
    expect(screen.getByText('Al-Madina Mosque Embed')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText(/Card layout/)).toBeInTheDocument()
    expect(screen.getByText(/2 destinations shown/)).toBeInTheDocument()
  })

  it('shows Inactive when the single organization\'s embed is turned off', () => {
    mockPosters([])
    mockDestinations([org()])
    useOrganizationEmbed.mockReturnValue({
      embed: { name: 'Al-Madina Mosque Embed', layout: 'compact', is_active: false, destinations: [] },
      isLoading: false,
    })
    render(<FundraisingStudioHomePage />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('falls back to a plain summary when managing more than one organization', () => {
    mockPosters([])
    mockDestinations([org({ id: 'org1' }), org({ id: 'org2', title: 'Second Org' })])
    render(<FundraisingStudioHomePage />)
    expect(screen.getByText(/2 organizations/)).toBeInTheDocument()
  })
})
