import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { settingsApi } from '@/api/settingsApi'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { usePlatformSettings } from '@/hooks/usePayments'
import { LEGAL_VARIABLE_DEFS, formatFeePercent } from '@/utils/legalVariables'

export function useLegalContent() {
  const query = useQuery({
    queryKey: queryKeys.legalContent.all(),
    queryFn: () => settingsApi.getLegalContent().then((r) => r.data),
  })
  return { content: query.data ?? null, isLoading: query.isLoading }
}

export function useUpdateLegalContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => settingsApi.updateLegalContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legalContent.all() })
    },
  })
}

// Current values for the {{variable}} placeholders Legal/Help content can
// use — one shared source so the admin editor's "insert variable" picker
// and the public pages' rendering never disagree about what a tag resolves
// to. Sourced from settings that already exist elsewhere (site branding,
// platform fee) rather than a separate admin-managed store, since these
// need to already be the single source of truth for the values themselves.
export function useLegalVariables() {
  const { siteName, siteDescription, contactEmail, isLoading: siteLoading } = useSiteSettings()
  const { data: platformSettings, isLoading: platformLoading } = usePlatformSettings()

  const values = {
    site_name: siteName,
    site_description: siteDescription,
    contact_email: contactEmail,
    platform_fee_percent: formatFeePercent(platformSettings?.platform_fee_percent),
    current_year: String(new Date().getFullYear()),
  }

  const variables = LEGAL_VARIABLE_DEFS.map((def) => ({ ...def, value: values[def.key] }))

  return { values, variables, isLoading: siteLoading || platformLoading }
}
