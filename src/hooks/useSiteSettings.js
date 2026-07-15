import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { settingsApi } from '@/api/settingsApi'
import { settings } from '@/settings'

export function useSiteSettings() {
  const query = useQuery({
    queryKey: queryKeys.siteSettings.all(),
    queryFn: () => settingsApi.getSiteSettings().then((r) => r.data),
  })
  const siteName = query.data?.site_name || settings.siteName

  useEffect(() => {
    if (query.data?.site_name) document.title = query.data.site_name
  }, [query.data?.site_name])

  return {
    siteName,
    siteDescription: query.data?.site_description || settings.siteDescription,
    logo: query.data?.logo || null,
    logoWithBackground: query.data?.logo_with_background || null,
    isLoading: query.isLoading,
  }
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => settingsApi.updateSiteSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.siteSettings.all() })
    },
  })
}
