// Embed.configuration's shape -- content/appearance overrides only,
// scoped to the spec's explicit field list (not "hundreds of controls").
// An empty string for a color/override means "use the app default /
// destination's own value," not "render blank" -- see FundraisingWidget.
export function defaultConfiguration() {
  return {
    content: { title: '', description: '', donateButtonText: 'Donate' },
    appearance: { primaryColor: '', backgroundColor: '', textColor: '', borderRadius: 12 },
  }
}

export function mergeConfiguration(configuration) {
  const defaults = defaultConfiguration()
  return {
    content: { ...defaults.content, ...(configuration?.content || {}) },
    appearance: { ...defaults.appearance, ...(configuration?.appearance || {}) },
  }
}
