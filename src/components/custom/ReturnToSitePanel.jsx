import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

const COUNTDOWN_SECONDS = 5

// Shown on DonateSuccessPage.jsx/OrganizationDonateSuccessPage.jsx when a
// donation carries a source_url (came through an embedded widget whose
// owner configured a return URL, see Embed.return_url / Donation.source_url
// -- services/donation_service.py::create_donation). Auto-redirects after a
// visible countdown rather than silently -- the destination is always shown
// to the donor before navigating away from Dolelma.
export function ReturnToSitePanel({ url }) {
  const [cancelled, setCancelled] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)

  let hostname = null
  try {
    hostname = new URL(url).hostname
  } catch {
    // Malformed source_url (shouldn't happen -- validated server-side at
    // Embed creation) -- just skip the panel rather than risk navigating
    // somewhere we can't even name.
  }

  useEffect(() => {
    if (!hostname || cancelled) return undefined
    if (secondsLeft <= 0) {
      window.location.href = url
      return undefined
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, cancelled, hostname, url])

  if (!hostname) return null

  return (
    <div className="bg-card border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm text-left">
      <p className="text-muted-foreground">
        {cancelled ? (
          'Staying here.'
        ) : (
          <>Returning you to <span className="font-semibold text-foreground">{hostname}</span> in {secondsLeft}s…</>
        )}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        {!cancelled && (
          <button
            type="button"
            onClick={() => setCancelled(true)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-md border hover:bg-accent transition-colors"
          >
            Stay here
          </button>
        )}
        <a
          href={url}
          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Return now <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
