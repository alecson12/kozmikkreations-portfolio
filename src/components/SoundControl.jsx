import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
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
function PlayIcon({ playing, size = 13 }) {
  return (
    <svg {...svg} width={size} height={size} fill="currentColor" stroke="none">
      {playing ? <path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z" /> : <path d="M8 5l11 7-11 7V5Z" />}
    </svg>
  )
}

function Switch({ label, hint, checked, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} className="sound-row" onClick={() => onChange(!checked)}>
      <span className="min-w-0 text-left">
        <span className="label block text-[10px] text-ink">{label}</span>
        {hint && <span className="mt-1 block text-[11px] leading-snug text-mute">{hint}</span>}
      </span>
      <span className="sound-switch" data-on={checked} aria-hidden="true" />
    </button>
  )
}

// The small speaker in the navigation and the panel it opens:
// all sound on/off · effects on/off · music play/pause · volume.
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
  const musicNote =
    s.music === 'none'
      ? 'Soundtrack coming soon'
      : s.music === 'error'
        ? 'The soundtrack could not be loaded'
        : !s.master
          ? 'Turn sound on to play'
          : playing
            ? audio.musicTitle || 'Playing'
            : audio.musicTitle || 'Off until you press play'

  return (
    <div ref={root} className={`relative ${className}`} data-sfx="none">
      <button
        ref={button}
        type="button"
        className="sound-toggle"
        aria-label={`Sound settings. Sound is ${s.master ? 'on' : 'off'}${playing ? ', music is playing' : ''}`}
        title="Sound"
        aria-expanded={open}
        aria-controls={id}
        data-on={s.master}
        onClick={() => setOpen((v) => !v)}
      >
        <SpeakerIcon on={s.master} />
        {playing && s.master && <span className="sound-dot" aria-hidden="true" />}
      </button>

      {open && (
        <div id={id} role="group" aria-label="Sound settings" className="sound-panel fade" style={{ animationDuration: '0.25s' }}>
          <Switch label="Sound" hint="Everything on or off" checked={s.master} onChange={audio.setMaster} />
          <Switch label="Effects" hint="Hover, click and page sounds" checked={s.sfx && s.master} disabled={!s.master} onChange={audio.setSfx} />

          <button
            type="button"
            className="sound-row"
            disabled={s.music === 'none' || s.music === 'error' || !s.master}
            aria-pressed={playing}
            aria-label={playing ? 'Pause background music' : 'Play background music'}
            onClick={audio.toggleMusic}
          >
            <span className="min-w-0 text-left">
              <span className="label flex items-center gap-2 text-[10px] text-ink">
                <NoteIcon /> Music
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-mute">{musicNote}</span>
            </span>
            <span className="sound-play" data-on={playing} aria-hidden="true">
              <PlayIcon playing={playing} />
            </span>
          </button>

          <label className="sound-row sound-volume">
            <span className="label text-[10px] text-ink">Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(s.volume * 100)}
              disabled={!s.master}
              aria-label="Volume"
              aria-valuetext={`${Math.round(s.volume * 100)} percent`}
              style={{ '--fill': `${Math.round(s.volume * 100)}%` }}
              onChange={(e) => audio.setVolume(Number(e.target.value) / 100)}
            />
          </label>
        </div>
      )}
    </div>
  )
}
