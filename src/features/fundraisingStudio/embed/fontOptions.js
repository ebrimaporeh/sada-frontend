// Curated font-family choices for the embed's appearance config --
// deliberately a fixed list, not a free-text field. The embed renders
// inside an iframe on a third-party site, so a typed font name would mean
// loading arbitrary fonts from Google Fonts at a visitor's request; every
// entry here is a known-safe Google Fonts family (or the system default)
// with a real fallback stack, so `fontFamily` in configuration is always
// one of these `value`s and nothing else ever reaches a stylesheet or a
// network request. See EmbedGallery.jsx for where `googleFontFamily` is
// turned into the actual <link> tag.
export const FONT_OPTIONS = [
  { value: '', label: 'System Default (match visitor\'s device)', stack: 'system-ui, -apple-system, sans-serif', googleFontFamily: null },
  { value: 'inter', label: 'Inter', stack: '"Inter", system-ui, sans-serif', googleFontFamily: 'Inter:wght@400;500;600;700' },
  { value: 'roboto', label: 'Roboto', stack: '"Roboto", system-ui, sans-serif', googleFontFamily: 'Roboto:wght@400;500;700' },
  { value: 'poppins', label: 'Poppins', stack: '"Poppins", system-ui, sans-serif', googleFontFamily: 'Poppins:wght@400;500;600;700' },
  { value: 'montserrat', label: 'Montserrat', stack: '"Montserrat", system-ui, sans-serif', googleFontFamily: 'Montserrat:wght@400;500;600;700' },
  { value: 'open_sans', label: 'Open Sans', stack: '"Open Sans", system-ui, sans-serif', googleFontFamily: 'Open+Sans:wght@400;500;600;700' },
  { value: 'lora', label: 'Lora (serif)', stack: '"Lora", Georgia, serif', googleFontFamily: 'Lora:wght@400;500;600;700' },
  { value: 'playfair_display', label: 'Playfair Display (serif)', stack: '"Playfair Display", Georgia, serif', googleFontFamily: 'Playfair+Display:wght@400;500;600;700' },
]

export function getFontOption(value) {
  return FONT_OPTIONS.find((f) => f.value === value) || FONT_OPTIONS[0]
}
