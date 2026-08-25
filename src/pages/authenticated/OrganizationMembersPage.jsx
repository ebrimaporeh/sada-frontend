import { OrganizationDetailPage } from './OrganizationDetail/shared'
import { MembersTab } from './OrganizationDetail/MembersTab'

export function OrganizationMembersPage() {
  return <OrganizationDetailPage Tab={MembersTab} />
}
