// The sound of the site, in one place.
//
//   · Sound effects are made on the spot with the Web Audio API (no sound files):
//     short, soft sine tones and a breath of filtered noise, tuned to one chord so
//     they always sit well together.
//   · Background music is one optional file (see content/site.js → audio.music).
//     It never starts by itself: only the visitor's own click on the music control.
//   · Nothing here makes a sound, or even creates an audio context, before the
//     visitor has clicked, tapped or pressed a key (browsers require that).
//   · The visitor's choices (sound on/off, effects on/off, volume) are remembered.

import { SITE } from '../content/site.js'
import { asset } from './projects.js'

const KEY = 'kozmik.audio.v1'
const cfg = SITE.audio ?? {}
const MUSIC_FILE = cfg.music?.file ? asset(`audio/${cfg.music.file}`) : ''
const MUSIC_LEVEL = cfg.music?.level ?? 0.32 // how loud music sits at full volume (0–1): kept low on purpose
const SFX_LEVEL = cfg.sfxLevel ?? 2.2
const FADE_IN = 1.6
const FADE_OUT = 0.9

const prefersCalm = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function loadPrefs() {
  // visitors who ask their device for less motion start with effects off
  const base = { master: cfg.defaults?.master ?? true, sfx: (cfg.defaults?.sfx ?? true) && !prefersCalm(), volume: cfg.defaults?.volume ?? 0.7 }
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || 'null')
    if (saved && typeof saved === 'object') {
      if (typeof saved.master === 'boolean') base.master = saved.master
      if (typeof saved.sfx === 'boolean') base.sfx = saved.sfx
      if (typeof saved.volume === 'number' && saved.volume >= 0 && saved.volume <= 1) base.volume = saved.volume
    }
  } catch {
    /* private window or blocked storage: the defaults are used */
  }
  return base
}

// music: 'none' (no file supplied) · 'off' · 'loading' · 'on' · 'error'
let state = { ...loadPrefs(), music: MUSIC_FILE ? 'off' : 'none' }
const listeners = new Set()
function set(patch) {
  state = { ...state, ...patch }
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ master: state.master, sfx: state.sfx, volume: state.volume }))
  } catch {
    /* not saved; still works for this visit */
  }
  for (const l of listeners) l()
}

// ── the synthesiser ─────────────────────────────────────────────────────────
let ctx = null
let out = null // everything → out → speakers
let bus = null // effects bus (dry + a touch of echo for space)
let noiseBuf = null

function build() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC()
  out = ctx.createGain()
  out.gain.value = state.master ? state.volume : 0
  // a gentle limiter, so quick clicks can never stack up into something loud
  const limit = ctx.createDynamicsCompressor()
  limit.threshold.value = -18
  limit.knee.value = 12
  limit.ratio.value = 6
  limit.attack.value = 0.003
  limit.release.value = 0.2
  out.connect(limit).connect(ctx.destination)

  bus = ctx.createGain()
  bus.gain.value = SFX_LEVEL
  bus.connect(out)
  const echo = ctx.createDelay(0.5)
  echo.delayTime.value = 0.093
  const feedback = ctx.createGain()
  feedback.gain.value = 0.26
  const soften = ctx.createBiquadFilter()
  soften.type = 'lowpass'
  soften.frequency.value = 2600
  const wet = ctx.createGain()
  wet.gain.value = 0.22
  bus.connect(echo)
  echo.connect(soften).connect(feedback).connect(echo)
  soften.connect(wet).connect(out)

  noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.6), ctx.sampleRate)
  const d = noiseBuf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return true
}

// Called from the first real click / tap / key press. Until then there is no audio at all.
function unlock() {
  try {
    if (!ctx && !build()) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  } catch {
    ctx = null // audio is simply unavailable on this device
  }
}

function tone({ from, to = from, dur = 0.1, gain = 0.05, type = 'sine', at = 0, attack = 0.006 }) {
  const t = ctx.currentTime + at
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(from, t)
  if (to !== from) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(bus)
  o.start(t)
  o.stop(t + dur + 0.03)
}

function air({ from, to, dur = 0.3, gain = 0.02, at = 0, q = 1.1 }) {
  const t = ctx.currentTime + at
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = q
  f.frequency.setValueAtTime(from, t)
  f.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.4)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(bus)
  src.start(t, Math.random() * 0.1, dur + 0.05)
}

// One chord (D · A · D · F♯) so every sound belongs with the others.
const D5 = 587.33
const A5 = 880
const D6 = 1174.66
const Fs6 = 1479.98

// name → [what it plays, shortest gap before it may play again (ms), is it a "big" sound]
const SOUNDS = {
  // cursor arrives on something you can use
  hover: [() => tone({ from: D6 * 1.5, to: Fs6 * 1.5, dur: 0.055, gain: 0.02 }), 90, false],
  // small controls: slide arrows, pips, the logo image, the menu
  tick: [() => tone({ from: A5, to: D5 * 1.2, dur: 0.05, gain: 0.04 }), 70, false],
  // choosing something: a navigation link, a button, a planet
  click: [
    () => {
      tone({ from: A5, dur: 0.1, gain: 0.05 })
      tone({ from: D6, dur: 0.12, gain: 0.03, at: 0.014 })
      air({ from: 5000, to: 3000, dur: 0.03, gain: 0.012, q: 0.7 })
    },
    90,
    false,
  ],
  // moving between the main pages
  transition: [
    () => {
      air({ from: 320, to: 2600, dur: 0.46, gain: 0.03, at: 0.04 })
      tone({ from: D5 / 2, dur: 0.5, gain: 0.02, at: 0.04, attack: 0.12 })
      tone({ from: A5 / 2, dur: 0.5, gain: 0.014, at: 0.08, attack: 0.14 })
    },
    500,
    true,
  ],
  // a project opens
  open: [
    () => {
      air({ from: 500, to: 3400, dur: 0.34, gain: 0.022, at: 0.03 })
      tone({ from: D5, dur: 0.2, gain: 0.04, at: 0.04 })
      tone({ from: A5, dur: 0.22, gain: 0.036, at: 0.11 })
      tone({ from: D6, dur: 0.3, gain: 0.03, at: 0.18 })
    },
    450,
    true,
  ],
  // back from a project
  close: [
    () => {
      air({ from: 2800, to: 420, dur: 0.3, gain: 0.02, at: 0.02 })
      tone({ from: A5, dur: 0.18, gain: 0.036, at: 0.03 })
      tone({ from: D5, dur: 0.26, gain: 0.034, at: 0.1 })
    },
    450,
    true,
  ],
  // switches in the sound panel
  on: [
    () => {
      tone({ from: D5, dur: 0.1, gain: 0.04 })
      tone({ from: A5, dur: 0.14, gain: 0.04, at: 0.07 })
    },
    120,
    false,
  ],
  off: [
    () => {
      tone({ from: A5, dur: 0.1, gain: 0.04 })
      tone({ from: D5, dur: 0.14, gain: 0.036, at: 0.07 })
    },
    120,
    false,
  ],
}

const last = {}
let bigUntil = 0
const log = [] // the most recent sounds, for the automated checks

function play(name, { force = false } = {}) {
  const def = SOUNDS[name]
  if (!def || !ctx || ctx.state !== 'running') return false
  if (!force && (!state.master || !state.sfx)) return false
  const now = performance.now()
  const [make, gap, big] = def
  if (now - (last[name] ?? -1e9) < gap) return false
  // while a page sweep is sounding, the little hover blips stay quiet
  if (name === 'hover' && now < bigUntil) return false
  last[name] = now
  if (big) bigUntil = now + 260
  try {
    make()
  } catch {
    return false
  }
  log.push({ name, at: Math.round(now) })
  if (log.length > 60) log.shift()
  return true
}

// ── background music ────────────────────────────────────────────────────────
let el = null
let fadeId = 0
let pausedByTab = false
let pausedByMute = false

const musicTarget = () => (state.master ? MUSIC_LEVEL * state.volume : 0)

function fadeTo(target, seconds, then) {
  cancelAnimationFrame(fadeId)
  if (!el) return
  const from = el.volume
  const start = performance.now()
  const step = (now) => {
    const k = Math.min(1, (now - start) / (seconds * 1000))
    el.volume = Math.max(0, Math.min(1, from + (target - from) * k))
    if (k < 1) fadeId = requestAnimationFrame(step)
    else then?.()
  }
  fadeId = requestAnimationFrame(step)
}

function ensureMusic() {
  if (el || !MUSIC_FILE) return el
  el = new Audio()
  el.loop = true
  el.preload = 'none'
  el.volume = 0
  el.src = MUSIC_FILE
  el.addEventListener('error', () => {
    cancelAnimationFrame(fadeId)
    set({ music: 'error' })
  })
  return el
}

function startMusic() {
  if (!ensureMusic()) return
  set({ music: 'loading' })
  const p = el.play()
  const begun = () => {
    set({ music: 'on' })
    fadeTo(musicTarget(), FADE_IN)
  }
  if (p?.then) p.then(begun).catch(() => state.music !== 'error' && set({ music: 'off' }))
  else begun()
}

function stopMusic(next = 'off') {
  if (!el) return
  set({ music: next })
  fadeTo(0, FADE_OUT, () => el.pause())
}

// Only ever called from the visitor's own click on the music control.
function toggleMusic() {
  if (!MUSIC_FILE || !state.master) return
  pausedByTab = pausedByMute = false
  if (state.music === 'on' || state.music === 'loading') stopMusic()
  else startMusic()
}

// the tab goes to the background → music rests, and picks up again on return
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (state.music === 'on') {
      pausedByTab = true
      cancelAnimationFrame(fadeId)
      el.volume = 0
      el.pause()
    }
  } else if (pausedByTab) {
    pausedByTab = false
    if (state.music === 'on' && state.master) el.play().then(() => fadeTo(musicTarget(), FADE_IN)).catch(() => set({ music: 'off' }))
  }
})

// ── the controls ────────────────────────────────────────────────────────────
function setMaster(on) {
  if (on === state.master) return
  if (!on) play('off')
  set({ master: on })
  if (out) out.gain.setTargetAtTime(on ? state.volume : 0, ctx.currentTime, on ? 0.02 : 0.12)
  if (!on && state.music === 'on') {
    pausedByMute = true
    stopMusic('off')
  } else if (on && pausedByMute) {
    pausedByMute = false
    startMusic()
  }
  if (on) play('on')
}

function setSfx(on) {
  if (on === state.sfx) return
  if (!on) play('off')
  set({ sfx: on })
  if (on) play('on')
}

function setVolume(v) {
  const volume = Math.max(0, Math.min(1, v))
  set({ volume })
  if (out && state.master) out.gain.setTargetAtTime(volume, ctx.currentTime, 0.03)
  if (el && state.music === 'on') {
    cancelAnimationFrame(fadeId)
    el.volume = musicTarget()
  }
}

export const audio = {
  subscribe: (l) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  get: () => state,
  unlock,
  play,
  setMaster,
  setSfx,
  setVolume,
  toggleMusic,
  hasMusic: Boolean(MUSIC_FILE),
  musicTitle: cfg.music?.title ?? '',
  log,
  running: () => Boolean(ctx && ctx.state === 'running'),
  musicElement: () => el,
  nodes: () => ({ ctx, out }),
}

if (import.meta.env.DEV) window.__kozmikAudio = audio
