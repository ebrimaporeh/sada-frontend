// Starter embed layouts -- picker metadata only in Phase 3; the actual
// widget rendering per layout is built in Phase 5 alongside the shared
// widget component.
export const EMBED_LAYOUTS = [
  { value: 'card', label: 'Card', description: 'Compact card with cover image, progress, and a Donate button.' },
  { value: 'compact', label: 'Compact', description: 'Minimal footprint -- title, progress bar, Donate button.' },
  { value: 'wide', label: 'Wide', description: 'Horizontal banner, suited to a page header.' },
  { value: 'horizontal', label: 'Horizontal', description: 'Image beside content, side by side.' },
  { value: 'progress_focused', label: 'Progress-focused', description: 'Large progress bar and amount raised as the centerpiece.' },
]
