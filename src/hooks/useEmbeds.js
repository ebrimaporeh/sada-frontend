import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { embedApi } from '@/api/fundraisingApi'

export function useEmbeds(params = {}) {
  const query = useQuery({
    queryKey: queryKeys.embeds.mine(),
    queryFn: () => embedApi.getMyEmbeds(params),
    select: (res) => ({ embeds: res?.results ?? [], count: res?.count ?? 0 }),
  })
  return {
    embeds: query.data?.embeds ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useEmbed(id) {
  const query = useQuery({
    queryKey: queryKeys.embeds.detail(id),
    queryFn: () => embedApi.getEmbed(id),
    select: (res) => res?.data?.embed ?? null,
    enabled: Boolean(id),
  })
  return { embed: query.data, isLoading: query.isLoading, error: query.error }
}

// Public, unauthenticated -- backs the /embed/$id widget page (see
// PublicLayout-less route in rootRoute.jsx). Renders even when the embed is
// inactive (embed.is_active === false) so the widget can show an explicit
// "no longer active" state instead of failing to load.
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

export function useCreateEmbed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => embedApi.createEmbed(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.mine() })
    },
  })
}

export function useUpdateEmbed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => embedApi.updateEmbed(id, data),
    onSuccess: (res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.mine() })
    },
  })
}

export function useDeleteEmbed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => embedApi.deleteEmbed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.mine() })
    },
  })
}

export function useDuplicateEmbed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => embedApi.duplicateEmbed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.mine() })
    },
  })
}

export function useSetEmbedActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }) => (isActive ? embedApi.activateEmbed(id) : embedApi.deactivateEmbed(id)),
    onSuccess: (res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.embeds.mine() })
    },
  })
}
