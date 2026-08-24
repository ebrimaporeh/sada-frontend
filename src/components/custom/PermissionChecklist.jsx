import {
  Users, UserCog, KeyRound, Megaphone, Layers, AlertCircle,
  ShieldCheck, Heart, BarChart3, LayoutDashboard, ClipboardList, Settings,
} from 'lucide-react'
import { Toggle } from './Toggle'

// Same icon per entity as the admin sidebar (AdminLayout.jsx) uses for its
// matching nav link, so a role's permissions read consistently with the
// rest of the admin rather than introducing a second icon vocabulary.
const ENTITY_ICONS = {
  users: Users,
  staff: UserCog,
  roles: KeyRound,
  campaigns: Megaphone,
  categories: Layers,
  reports: AlertCircle,
  verifications: ShieldCheck,
  donations: Heart,
  finances: BarChart3,
  dashboard: LayoutDashboard,
  audit: ClipboardList,
  settings: Settings,
}

// `groups` is the backend's grouped resources payload:
// [{ entity, label, actions: [{ key, label }] }]. `selected` is a Set of
// currently-granted resource keys.
export function PermissionChecklist({ groups, selected, onToggle, disabled = false }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const Icon = ENTITY_ICONS[group.entity] || ShieldCheck
        return (
          <div key={group.entity} className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Icon className="w-3.5 h-3.5" /> {group.label}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pl-0.5">
              {group.actions.map((action) => (
                <Toggle
                  key={action.key}
                  compact
                  disabled={disabled}
                  checked={selected.has(action.key)}
                  onChange={() => onToggle(action.key)}
                  label={action.label}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
