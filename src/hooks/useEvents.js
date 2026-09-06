import { useMutation } from '@tanstack/react-query'
import { eventsApi } from '@/api/eventsApi'

// Fire-and-forget product-engagement tracking -- no cached query reads this
// data, so there's nothing to invalidate. Callers shouldn't await or
// surface errors from this; a dropped tracking beacon should never block
// or break the page that fired it.
export function useTrackEvent() {
  return useMutation({ mutationFn: eventsApi.track })
}
