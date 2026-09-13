import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { embedApi } from '@/api/fundraisingApi'

// Gets (or, on first call for an organization, creates) that organization's
// one embed -- there's no separate "create" step, see fundraisingApi.js's
// own comment. Backs Fundraising Studio's Embed pages.
export function useOrganizationEmbed(organizationId) {
  const query = useQuery({
    queryKey: queryKeys.embeds.forOrganization(organizationId),
    queryFn: () => embedApi.getOrganizationEmbed(organizationId),
    select: (res) => res?.data?.embed ?? null,
    enabled: Boolean(organizationId),
  })
  return { embed: query.data, isLoading: query.isLoading, error: query.error }
}

// Public, unauthenticated -- backs the /embed/$id widget page. Renders even
// when the embed is inactive (embed.is_active === false) so the widget can
// show an explicit "no longer active" state instead of failing to load.
export function usePublicEmbed(id) {
  const query = useQuery({
    queryKey: queryKeys.embeds.public(id),
    queryFn: () => embedApi.getPublicEmbed(id),
    select: (res) => res?.data?.embed ?? null,
    enabled: Boolean(id),
    retry: false,
  })
  return { embed: query.data, isLoading: query.isLoading, error: query.error }
}

// Every mutation below is keyed by the embed's own id (the PATCH/activate/
// deactivate endpoints still address it directly), but invalidates the
// organization-scoped query -- callers pass { id, organizationId, ...data }
// so the right cache entry gets refreshed.
export function useUpdateEmbed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, organizationId: _organizationId, ...data }) => embedApi.updateEmbed(id, data),
    onSuccess: (res, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.forOrganization(organizationId) })
    },
  })
}

export function useSetEmbedActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }) => (isActive ? embedApi.activateEmbed(id) : embedApi.deactivateEmbed(id)),
    onSuccess: (res, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.forOrganization(organizationId) })
    },
  })
}
