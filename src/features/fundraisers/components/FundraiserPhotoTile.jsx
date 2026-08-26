import { Link } from '@tanstack/react-router'
import { VerifiedTick } from '@/components/custom/VerifiedTick'
import { initials } from '@/utils/formatters'

// A deterministic-but-varied portrait ratio for fundraisers without a photo,
// so the placeholder tiles still break up into a masonry-like rhythm instead
// of a flat grid of identical squares.
const FALLBACK_RATIOS = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[2/3]']

function fallbackRatio(id) {
  const hash = String(id).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return FALLBACK_RATIOS[hash % FALLBACK_RATIOS.length]
}

export function FundraiserPhotoTile({ fundraiser }) {
  return (
    <Link
      to="/fundraisers/$id"
      params={{ id: fundraiser.id }}
      className="group relative block mb-4 break-inside-avoid rounded-2xl overflow-hidden bg-muted"
    >
      {fundraiser.avatar ? (
        <img
          src={fundraiser.avatar}
          alt={fundraiser.full_name}
          loading="lazy"
          className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className={`w-full ${fallbackRatio(fundraiser.id)} bg-gradient-to-br from-primary/25 to-primary/60 flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
          <span className="text-3xl font-bold text-primary-foreground/90">{initials(fundraiser.full_name)}</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pt-10 pb-3">
        <p className="text-white text-sm font-semibold truncate flex items-center gap-1">
          {fundraiser.full_name}
          {fundraiser.is_verified && <VerifiedTick size="w-3.5 h-3.5" className="text-white fill-blue-500" />}
        </p>
      </div>
    </Link>
  )
}
