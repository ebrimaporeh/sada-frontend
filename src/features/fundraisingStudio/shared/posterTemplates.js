// Starter poster templates -- Phase 3 only needs the picker metadata
// (label/description/swatch); each template's actual initial canvas
// composition (background/elements) is added in Phase 4 alongside the
// Konva editor itself. Kept as a plain array, not a DB-editable catalog --
// same "small, static, launch-phase" tradeoff as OrganizationPermission/
// Resource elsewhere in this codebase.
export const POSTER_TEMPLATES = [
  { value: 'classic', label: 'Classic', description: 'Timeless layout, centered title and QR code.', swatchClass: 'bg-neutral-100' },
  { value: 'modern', label: 'Modern', description: 'Bold type, full-bleed cover image.', swatchClass: 'bg-slate-900' },
  { value: 'minimal', label: 'Minimal', description: 'Clean whitespace, understated typography.', swatchClass: 'bg-white border' },
  { value: 'bold', label: 'Bold', description: 'High-contrast color block, large numbers.', swatchClass: 'bg-primary' },
  { value: 'community', label: 'Community', description: 'Warm, photo-forward, built for sharing.', swatchClass: 'bg-amber-100' },
]
