import { apiClient } from './client'

// Thin wrapper around the existing, already-public POST /events/track/
// endpoint (apps.events.TrackEventView) -- see .claude/backend/fundraising.md
// for why Fundraising Studio reuses this instead of adding a new one.
export const eventsApi = {
  track: ({ type, campaignSlug, metadata }) =>
    apiClient.post('/events/track/', {
      type,
      ...(campaignSlug ? { campaign_slug: campaignSlug } : {}),
      ...(metadata ? { metadata } : {}),
    }).then((r) => r.data),
}
