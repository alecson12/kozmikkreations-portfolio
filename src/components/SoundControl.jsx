import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { SITE } from '../content/site.js'
import { audio } from '../lib/audio.js'

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

function SpeakerIcon({ on, size = 18 }) {
  return (
    <svg {...svg} width={size} height={size}>
      <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4Z" />
      {on ? <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.4 7.4 0 0 1 0 10.4" /> : <path d="M16 9.5l5 5M21 9.5l-5 5" />}
    </svg>
  )
}
function NoteIcon({ size = 15 }) {
  return (
    <svg {...svg} width={size} height={size}>
      <path d="M9 17.5V6l10-2v11.5" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="15.5" r="2.5" />
    </svg>
  )
}
function TapeIcon({ size = 15 }) {
  return (
    <svg {...svg} width={size} height={size}>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <circle cx="8.5" cy="11.5" r="1.8" />
      <circle cx="15.5" cy="11.5" r="1.8" />
      <path d="M7 18l1.5-2.5h7L17 18" />
    </svg>
  )
}
function PlayIcon({ playing, size = 13 }) {
  return (
    <svg {...svg} width={size} height={size} fill="currentColor" stroke="none">
      {playing ? <path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z" /> : <path d="M8 5l11 7-11 7V5Z" />}
    </svg>
  )
}

// One volume: its name and the level in words above, the slider below.
function Volume({ label, value, onChange, disabled }) {
  const pct = Math.round(value * 100)
  return (
    <label className="sound-volume">
      <span className="flex items-baseline justify-between gap-3">
        <span className="label text-[10px] text-ink">{label}</span>
        <span className="label text-[10px] tabular-nums text-mute">{pct}%</span>
      </span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={pct}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={`${pct} percent`}
        style={{ '--fill': `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
      />
    </label>
  )
}

// The small speaker in the navigation and the panel it opens:
// mute all sounds · the ambience (what is playing, play / pause, its volume) · the mixtape · effects volume.
export default function SoundControl({ className = '' }) {
  const s = useSyncExternalStore(audio.subscribe, audio.get)
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const button = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const away = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false)
    }
    const key = (e) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key, true)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key, true)
    }
  }, [open])

  const playing = s.music === 'on' || s.music === 'loading'
  const track = audio.track
  // said plainly, so the panel never claims a sound the browser is not making
  const status =
    s.music === 'none'
      ? 'Coming soon'
      : s.music === 'error'
        ? 'Could not be loaded'
        : s.muted
          ? 'Muted'
          : s.music === 'on'
            ? 'Playing'
            : s.music === 'loading'
              ? 'Starting'
              : s.music === 'blocked'
                ? 'Starts on your first click'
                : s.mixtape
                  ? 'Paused for the mixtape'
                  : 'Paused'
  const mix = SITE.audio?.mixtape?.embed ? SITE.audio.mixtape : null
  const soon = mix && !audio.mixtapeReady

  return (
    <div ref={root} className={`relative ${className}`} data-sfx="none">
      <button
        ref={button}
        type="button"
        className="sound-toggle"
        aria-label={`Sound settings. ${s.muted ? 'All sounds are muted' : 'Sound is on'}${playing && track.title ? `, ${track.title} is playing` : ''}${s.mixtape ? ', the mixtape is open' : ''}`}
        title="Sound"
        aria-expanded={open}
        aria-controls={id}
        data-on={!s.muted}
        onClick={() => setOpen((v) => !v)}
      >
        <SpeakerIcon on={!s.muted} />
        {(s.music === 'on' || s.mixtape) && !s.muted && <span className="sound-dot" aria-hidden="true" />}
      </button>

      {open && (
        <div id={id} role="group" aria-label="Sound settings" className="sound-panel fade" style={{ animationDuration: '0.25s' }}>
          <button type="button" role="switch" aria-checked={s.muted} className="sound-row" onClick={() => audio.setMuted(!s.muted)}>
            <span className="min-w-0 text-left">
              <span className="label block text-[10px] text-ink">Mute all sounds</span>
              <span className="mt-1 block truncate text-[11px] leading-snug text-mute">{s.muted ? 'Everything is muted' : 'Sound is on'}</span>
            </span>
            <span className="sound-switch" data-on={s.muted} aria-hidden="true" />
          </button>

          <div className="sound-block">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="label flex items-center gap-2 text-[10px] text-ink">
                  <NoteIcon /> Ambience
                </p>
                <p className="sound-status mt-1 truncate text-[11px] leading-snug text-mute" aria-live="polite">
                  {status}
                </p>
              </div>
              <button
                type="button"
                className="sound-play"
                data-on={playing}
                disabled={s.music === 'none' || s.music === 'error' || s.muted}
                aria-pressed={playing}
                aria-label={playing ? 'Pause the ambience' : 'Play the ambience'}
                title={playing ? 'Pause' : 'Play'}
                onClick={audio.toggleMusic}
              >
                <PlayIcon playing={playing} />
              </button>
            </div>
            {track.title && (
              <p className="sound-credit">
                <span className="display block text-[11px] tracking-[0.2em] text-ink">{track.title}</span>
                {track.artist && <span className="mt-1 block text-[11.5px] leading-snug text-mute">{track.artist}</span>}
              </p>
            )}
            <Volume label="Ambience volume" value={s.ambience} onChange={audio.setAmbience} disabled={s.muted || s.music === 'none'} />
          </div>

          {mix &&
            (soon ? (
              // kept in its place, switched off on purpose until it is ready
              <div className="sound-row sound-soon" role="group" aria-label="Mixtape: coming soon" aria-disabled="true">
                <span className="min-w-0 text-left">
                  <span className="label flex items-center gap-2 text-[10px] text-ink">
                    <TapeIcon /> Mixtape
                  </span>
                  <span className="mt-1 block truncate text-[11px] leading-snug text-mute">Not available yet</span>
                </span>
                <span className="sound-badge label">Coming soon</span>
              </div>
            ) : (
              <button
                type="button"
                className="sound-row"
                disabled={s.muted}
                aria-pressed={s.mixtape}
                aria-label={!s.mixtape ? `Open the mixtape: ${mix.title}, in Spotify's player` : s.mixtapeSmall ? 'Show the mixtape player again' : `Close the mixtape: ${mix.title}`}
                onClick={() => (s.mixtape && s.mixtapeSmall ? audio.setMixtapeSmall(false) : audio.setMixtape(!s.mixtape))}
              >
                <span className="min-w-0 text-left">
                  <span className="label flex items-center gap-2 text-[10px] text-ink">
                    <TapeIcon /> Mixtape
                  </span>
                  <span className="mt-1 block truncate text-[11px] leading-snug text-mute">{!s.mixtape ? mix.note || mix.title : s.mixtapeSmall ? 'Tucked away · show player' : 'Open in the corner'}</span>
                </span>
                <span className="sound-play" data-on={s.mixtape} aria-hidden="true">
                  {s.mixtape && !s.mixtapeSmall ? <span className="block h-px w-3 bg-current" /> : <PlayIcon playing={false} />}
                </span>
              </button>
            ))}

          <div className="sound-block">
            <Volume label="SFX volume" value={s.sfx} onChange={audio.setSfx} disabled={s.muted} />
          </div>
        </div>
      )}
    </div>
  )
}
