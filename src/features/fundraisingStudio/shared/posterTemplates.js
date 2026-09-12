// Poster sizes -- a choice of frame shape/aspect ratio, not a design
// style: every size renders the same composition (destination's cover
// photo full-bleed, dark overlay, title/org/description + QR anchored
// bottom-left, see templateCompositions.js), matched to how people
// actually share it -- a square feed post, a vertical story/status, or a
// wide link-preview banner. Deliberately named by shape, not by platform
// (this mirrors a shape a competing tool exposes, named after specific
// apps -- kept generic here instead). Kept as a plain array, not a
// DB-editable catalog -- same "small, static, launch-phase" tradeoff as
// OrganizationPermission/Resource elsewhere in this codebase. `width`/
// `height` become the actual design document's canvas size (see
// templateCompositions.buildInitialDesign) and back Poster.Template on
// the backend (apps/fundraising/models.py) -- keep both in sync.
export const POSTER_TEMPLATES = [
  { value: 'square', label: 'Square', description: '1:1 - feed posts and profile shares.', width: 1080, height: 1080 },
  { value: 'story', label: 'Story', description: '9:16 - full-screen stories and status updates.', width: 1080, height: 1920 },
  { value: 'wide', label: 'Wide', description: '1.9:1 - link-preview banners for shared posts.', width: 1200, height: 630 },
]
