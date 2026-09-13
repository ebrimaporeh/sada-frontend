// Embed.configuration's shape -- content/card-appearance/donation-flow-
// appearance overrides only, scoped to the spec's explicit field list (not
// "hundreds of controls"). An empty string for a color/override means "use
// the app default / destination's own value," not "render blank" -- see
// FundraisingWidget. `borderRadius` is the card's own corner radius;
// `buttonRadius` is independent (a pill-shaped Donate button on square-
// cornered cards is a real, common combination). `fontFamily` is a curated
// key from fontOptions.js, never a free-text value -- see that file's own
// comment.
//
// `donationFlow` styles the donation form that opens on Donate click
// (DonateModal -> DonateCheckout/OrganizationDonateCheckout) --
// deliberately a separate shape from `appearance`, not shared: the card an
// org designs to sit on their own site and the actual payment form are
// different surfaces with different constraints (see DonationFlowConfigForm.jsx),
// so styling one was never meant to imply anything about the other.
export function defaultConfiguration() {
  return {
    content: { title: '', description: '', donateButtonText: 'Donate' },
    appearance: {
      buttonColor: '', backgroundColor: '', textColor: '', borderRadius: 12, buttonRadius: 8, fontFamily: '',
    },
    donationFlow: {
      buttonColor: '', backgroundColor: '', textColor: '', borderRadius: 16, buttonRadius: 8, fontFamily: '',
    },
  }
}

export function mergeConfiguration(configuration) {
  const defaults = defaultConfiguration()
  return {
    content: { ...defaults.content, ...(configuration?.content || {}) },
    appearance: { ...defaults.appearance, ...(configuration?.appearance || {}) },
    donationFlow: { ...defaults.donationFlow, ...(configuration?.donationFlow || {}) },
  }
}
