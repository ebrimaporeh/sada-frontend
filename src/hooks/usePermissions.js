import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { permissionsApi } from '@/api/permissionsApi'

// The Staff page's role-permissions editor: current resource grants for
// every runtime-editable role, plus the full list of resources that can be
// granted. Live, admin-editable state — not the frontend's static Resource
// list (see src/utils/permissions.js), which only has the resource *keys*
// and labels, never who has them.
export function useRolePermissions() {
  return useQuery({
    queryKey: queryKeys.permissions.roles(),
    queryFn: () => permissionsApi.getRolePermissions(),
    select: (res) => res?.data ?? { resources: [], roles: [] },
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ role, resources }) => permissionsApi.updateRolePermissions(role, resources),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles() })
      // Every staff member's own `me.resources` may have just changed too
      // (anyone holding the edited role) — refresh so their sidebar/route
      // access reflects it without needing a manual page reload.
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}
