import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { visionApi } from '@/api/visionApi'

export function useVisionTopics() {
  const query = useQuery({
    queryKey: queryKeys.vision.list(),
    queryFn: () => visionApi.getTopics(),
    select: (res) => res?.data?.topics ?? [],
  })
  return { topics: query.data ?? [], isLoading: query.isLoading }
}

export function useVisionTopic(slug) {
  const query = useQuery({
    queryKey: queryKeys.vision.detail(slug),
    queryFn: () => visionApi.getTopic(slug),
    select: (res) => res?.data?.topic ?? null,
    enabled: Boolean(slug),
    retry: false,
  })
  return { topic: query.data ?? null, isLoading: query.isLoading, isError: query.isError }
}

export function useAdminVisionTopics() {
  const query = useQuery({
    queryKey: queryKeys.vision.adminAll(),
    queryFn: () => visionApi.getAdminTopics(),
    select: (res) => res?.data?.topics ?? [],
  })
  return { topics: query.data ?? [], isLoading: query.isLoading }
}

export function useAdminVisionTopic(slug) {
  const query = useQuery({
    queryKey: queryKeys.vision.adminDetail(slug),
    queryFn: () => visionApi.getAdminTopic(slug),
    select: (res) => res?.data?.topic ?? null,
    enabled: Boolean(slug),
  })
  return { topic: query.data ?? null, isLoading: query.isLoading }
}

export function useCreateVisionTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => visionApi.createTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.adminAll() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.list() })
    },
  })
}

export function useUpdateVisionTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, ...data }) => visionApi.updateTopic(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.adminAll() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.adminDetail(slug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.detail(slug) })
    },
  })
}

export function useDeleteVisionTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug) => visionApi.deleteTopic(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.adminAll() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.list() })
    },
  })
}
