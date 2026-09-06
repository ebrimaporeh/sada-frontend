import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { posterApi } from '@/api/fundraisingApi'

export function usePosters(params = {}) {
  const query = useQuery({
    queryKey: queryKeys.posters.mine(),
    queryFn: () => posterApi.getMyPosters(params),
    select: (res) => ({ posters: res?.results ?? [], count: res?.count ?? 0 }),
  })
  return {
    posters: query.data?.posters ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function usePoster(id) {
  const query = useQuery({
    queryKey: queryKeys.posters.detail(id),
    queryFn: () => posterApi.getPoster(id),
    select: (res) => res?.data?.poster ?? null,
    enabled: Boolean(id),
  })
  return { poster: query.data, isLoading: query.isLoading, error: query.error }
}

export function useCreatePoster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => posterApi.createPoster(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posters.mine() })
    },
  })
}

export function useUpdatePoster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => posterApi.updatePoster(id, data),
    onSuccess: (res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posters.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.posters.mine() })
    },
  })
}

export function useDeletePoster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => posterApi.deletePoster(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posters.mine() })
    },
  })
}

export function useUploadPosterImage() {
  return useMutation({
    mutationFn: ({ id, file }) => posterApi.uploadPosterImage(id, file),
  })
}

export function useDuplicatePoster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => posterApi.duplicatePoster(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posters.mine() })
    },
  })
}
