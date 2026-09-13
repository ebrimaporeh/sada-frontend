import { mergeConfiguration } from '../defaultConfiguration'
import { getFontOption } from '../fontOptions'
import { FundraisingWidget } from './FundraisingWidget'

// The actual "one embed, many destinations" widget -- consumed by both
// Embed Studio's live preview (EmbedPreview.jsx) and the public /embed/$id
// page (EmbedWidgetPage.jsx), same "one implementation, two call sites"
// convention FundraisingWidget itself follows for its per-destination card.
//
// Applies the embed's shared appearance (background/text color, font
// family) once at this container level, then renders one FundraisingWidget
// card per entry in embed.destinations -- the organization's own card
// (only present when the organization opted in) followed by every
// currently-active, opted-in campaign, in the order the backend already
// resolved them in (see fundraising_destination.resolve_embed_gallery_destinations).
export function EmbedGallery({ embed, interactive = true }) {
  const config = mergeConfiguration(embed.configuration)
  const fontOption = getFontOption(config.appearance.fontFamily)
  const destinations = embed.destinations || []

  const containerStyle = {
    backgroundColor: config.appearance.backgroundColor || undefined,
    color: config.appearance.textColor || undefined,
    fontFamily: fontOption.stack,
  }

  if (!embed.is_active) {
    return (
      <div style={containerStyle} className="p-4 rounded-xl border bg-muted text-center text-sm text-muted-foreground">
        This donation widget is no longer active.
      </div>
    )
  }

  return (
    <div style={containerStyle} className="space-y-4 w-full">
      {fontOption.googleFontFamily && (
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${fontOption.googleFontFamily}&display=swap`} />
      )}
      {embed.organization && (
        <div className="flex items-center gap-2">
          {embed.organization.logo_url && (
            <img src={embed.organization.logo_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
          )}
          <p className="text-sm font-medium truncate">{embed.organization.organization_name}</p>
        </div>
      )}

      {destinations.length === 0 ? (
        <div className="p-4 rounded-xl border bg-muted text-center text-sm text-muted-foreground">
          Nothing to show here yet.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          {destinations.map((destination) => (
            <FundraisingWidget
              key={`${destination.type}-${destination.id}`}
              embed={embed}
              destination={destination}
              interactive={interactive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
