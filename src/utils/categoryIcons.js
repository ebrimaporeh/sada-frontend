import {
  Heart, BookOpen, Briefcase, Moon, Users, AlertTriangle,
  Zap, Star, Gift, Leaf, Award, MoreHorizontal, FolderOpen,
} from 'lucide-react'

// Maps the icon-name strings stored on Category.icon (backend) to a Lucide
// component. Falls back to a generic folder icon for unknown/blank values.
export const CATEGORY_ICONS = {
  heart: Heart,
  book: BookOpen,
  briefcase: Briefcase,
  moon: Moon,
  users: Users,
  alert: AlertTriangle,
  zap: Zap,
  star: Star,
  gift: Gift,
  leaf: Leaf,
  award: Award,
  more: MoreHorizontal,
}

export function getCategoryIcon(iconName) {
  return CATEGORY_ICONS[iconName] || FolderOpen
}
