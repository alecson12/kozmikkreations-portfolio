import { useState, useSyncExternalStore } from 'react'
import { SITE } from '../content/site.js'
import { audio } from '../lib/audio.js'
import { Chevron, Close } from './Bits.jsx'

// The visitor's optional mixtape: Spotify's own player, docked in the corner.
// Nothing is loaded from Spotify until the visitor opens it from the sound panel,
// and it stays put while they move around the site. Tucked away it keeps playing:
// a small bar on wide screens, fully out of sight on phones (the sound panel brings it back).
export default function MixtapePlayer() {
  const s = useSyncExternalStore(audio.subscribe, audio.get)
  const open = s.mixtape
  const small = s.mixtapeSmall
  const [tall, setTall] = useState(false)
  const mix = SITE.audio?.mixtape
  if (!open || !mix?.embed || !audio.mixtapeReady) return null // kept for later: see audio.mixtape.comingSoon in site.js

  const src = `${mix.embed}${mix.embed.includes('?') ? '&' : '?'}utm_source=generator&theme=0`
  return (
    <aside className="mixtape" data-small={small} data-sfx="none" aria-label={`${mix.title}, playing from Spotify`}>
      <div className="mixtape-bar">
        <p className="label min-w-0 flex-1 truncate text-[9px] text-ink">Mixtape <span className="text-faint">· Spotify</span></p>
        {!small && (
          <button type="button" className="mixtape-btn" aria-label={tall ? 'Show less of the track list' : 'Show the track list'} title={tall ? 'Less' : 'Track list'} aria-pressed={tall} onClick={() => setTall((v) => !v)}>
            <span style={{ display: 'grid', rotate: tall ? '90deg' : '-90deg' }}>
              <Chevron size={14} />
            </span>
          </button>
        )}
        <button type="button" className="mixtape-btn" aria-label={small ? 'Show the player' : 'Tuck the player away (it keeps playing)'} title={small ? 'Show' : 'Tuck away'} aria-pressed={small} onClick={() => audio.setMixtapeSmall(!small)}>
          <span className="block h-px w-3 bg-current" />
        </button>
        <button type="button" className="mixtape-btn" aria-label="Close the mixtape" title="Close" onClick={() => audio.setMixtape(false)}>
          <Close size={13} />
        </button>
      </div>
      <iframe
        className="mixtape-frame"
        title={`${mix.title} on Spotify`}
        src={src}
        height={tall ? 352 : 152}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </aside>
  )
}
