// The sound of the site, in one place. Everything that can make a sound goes through here.
//
//   · Sound effects are made on the spot with the Web Audio API (no sound files):
//     short, soft sine tones and a breath of filtered noise, tuned to one chord so
//     they always sit well together.
//   · The ambience is one music file (see content/site.js → audio.music). It is meant to
//     be playing from the start, but browsers decide that: when they refuse, it starts
//     with the visitor's first click, tap or key press, and until then the site says so.
//     With no file set, a space ambience generated live is used instead.
//   · Three settings, each remembered on its own:
//       muted      "Mute all sounds": silences both, changes neither volume
//       ambience   volume of the music, 0 to 1
//       sfx        volume of the effects, 0 to 1
//   · The mixtape (Spotify's own player) is kept here, switched off while it is "coming soon".

import { SITE } from '../content/site.js'
import { asset } from './projects.js'

const KEY = 'kozmik.audio.v2'
const cfg = SITE.audio ?? {}
const MUSIC_FILE = cfg.music?.file ? asset(`audio/${cfg.music.file}`) : ''
const MUSIC_LEVEL = cfg.music?.level ?? 1 // trim for the file: 1 = the volume slider is the true volume
const SFX_LEVEL = cfg.sfxLevel ?? 2.2
const USE_AMBIENT = !MUSIC_FILE && cfg.ambient?.on !== false
const AMBIENT_LEVEL = (cfg.ambient?.level ?? 0.35) * 2.8 // the generated ambience at full volume
const MIXTAPE_READY = Boolean(cfg.mixtape?.embed) && !cfg.mixtape?.comingSoon
const FADE_IN = 1.6
const FADE_OUT = 0.9
const AMBIENT_FADE_IN = 3.2 // the generated ambience arrives slowly, like a room coming into focus

const unit = (v, fallback) => (typeof v === 'number' && v >= 0 && v <= 1 ? v : fallback)

function loadPrefs() {
  const d = cfg.defaults ?? {}
  const base = { muted: d.muted ?? false, ambience: unit(d.ambience, 0.25), sfx: unit(d.sfx, 0.75), ambienceOn: d.playing ?? true }
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || 'null')
    if (saved && typeof saved === 'object') {
      if (typeof saved.muted === 'boolean') base.muted = saved.muted
      if (typeof saved.ambienceOn === 'boolean') base.ambienceOn = saved.ambienceOn
      base.ambience = unit(saved.ambience, base.ambience)
      base.sfx = unit(saved.sfx, base.sfx)
    }
    window.localStorage.removeItem('kozmik.audio.v1') // the settings of the earlier sound panel
  } catch {
    /* private window or blocked storage: the defaults are used */
  }
  return base
}

// ambienceOn: does the visitor want the music (their play / pause choice)
// music: what is actually happening
//   'none'     nothing to play
//   'blocked'  wanted, but the browser has not allowed sound yet: starts on the first interaction
//   'loading'  starting
//   'on'       playing
//   'paused'   wanted, resting for now (everything is muted, or the mixtape is open)
//   'off'      the visitor paused it
//   'error'    the file could not be played
// mixtape: is the Spotify player open (never remembered between visits)
let state = { ...loadPrefs(), music: MUSIC_FILE || USE_AMBIENT ? 'paused' : 'none', mixtape: false, mixtapeSmall: false }
const listeners = new Set()
function set(patch) {
  state = { ...state, ...patch }
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ muted: state.muted, ambience: state.ambience, sfx: state.sfx, ambienceOn: state.ambienceOn }))
  } catch {
    /* not saved; still works for this visit */
  }
  for (const l of listeners) l()
}

// ── the synthesiser ─────────────────────────────────────────────────────────
let ctx = null
let out = null // effects and generated ambience → out (the mute) → speakers
let bus = null // effects bus (dry + a touch of echo for space); its level is the effects volume
let noiseBuf = null

function build() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC()
  out = ctx.createGain()
  out.gain.value = state.muted ? 0 : 1
  // a gentle limiter, so quick clicks can never stack up into something loud
  const limit = ctx.createDynamicsCompressor()
  limit.threshold.value = -18
  limit.knee.value = 12
  limit.ratio.value = 6
  limit.attack.value = 0.003
  limit.release.value = 0.2
  out.connect(limit).connect(ctx.destination)

  bus = ctx.createGain()
  bus.gain.value = SFX_LEVEL * state.sfx
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

// Called on every real click / tap / key press. The first one is what allows sound at all:
// it wakes the synthesiser, and starts the music if the browser had been holding it back.
let wokeAt = -1e9
function unlock() {
  try {
    if (!ctx && !build()) ctx = null
    else if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  } catch {
    ctx = null // the synthesiser is simply unavailable on this device
  }
  if (state.music === 'blocked') {
    wokeAt = performance.now()
    sync()
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
  // small controls: pips, the logo image, the menu
  tick: [() => tone({ from: A5, to: D5 * 1.2, dur: 0.05, gain: 0.04 }), 70, false],
  // moving from one project image to another: a short soft sweep, rising for the next
  // image and falling for the previous one. The gap keeps a long drag from chattering.
  slide: [
    ({ dir = 1 } = {}) => {
      const back = dir < 0
      air({ from: back ? 2500 : 650, to: back ? 650 : 2500, dur: 0.2, gain: 0.062, q: 0.9 })
      tone({ from: back ? A5 : D5, to: back ? D5 : A5, dur: 0.15, gain: 0.024, attack: 0.03 })
    },
    170,
    false,
  ],
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

function play(name, { force = false, ...how } = {}) {
  const def = SOUNDS[name]
  if (!def || !ctx || ctx.state !== 'running') return false
  if (!force && (state.muted || state.sfx <= 0)) return false
  const now = performance.now()
  const [make, gap, big] = def
  if (now - (last[name] ?? -1e9) < gap) return false
  // while a page sweep is sounding, the little hover blips stay quiet
  if (name === 'hover' && now < bigUntil) return false
  last[name] = now
  if (big) bigUntil = now + 260
  try {
    make(how)
  } catch {
    return false
  }
  log.push({ name, at: Math.round(now) })
  if (log.length > 60) log.shift()
  return true
}

// ── generated ambience (the stand-in when no music file is set) ─────────────
// A deep drone on D and A, a slow-breathing pad built from the same chord as the
// effects, a breath of filtered noise, and now and then a far-off note that blooms
// into a long reverb. It never repeats exactly, and it needs no audio file.
let amb = null
let ambStopTimer = 0

function reverbTail(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const b = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
  }
  return b
}

function buildAmbient() {
  const t = ctx.currentTime
  const live = [] // everything that has to be stopped later
  const gain = ctx.createGain()
  gain.gain.value = 0
  const soft = ctx.createBiquadFilter()
  soft.type = 'lowpass'
  soft.frequency.value = 2200
  const mix = ctx.createGain()
  const dry = ctx.createGain()
  dry.gain.value = 0.5
  const verb = ctx.createConvolver()
  verb.buffer = reverbTail(5)
  const wet = ctx.createGain()
  wet.gain.value = 0.85
  mix.connect(dry).connect(soft)
  mix.connect(verb).connect(wet).connect(soft)
  soft.connect(gain).connect(out)

  // something that slowly rises and falls: used for loudness, brightness and position
  const drift = (param, rate, depth) => {
    const o = ctx.createOscillator()
    o.frequency.value = rate
    const g = ctx.createGain()
    g.gain.value = depth
    o.connect(g).connect(param)
    o.start(t)
    live.push(o)
  }
  const placed = (node, pan) => {
    if (!ctx.createStereoPanner) return node.connect(mix)
    const p = ctx.createStereoPanner()
    p.pan.value = pan
    node.connect(p).connect(mix)
  }

  // the drone
  const deep = ctx.createBiquadFilter()
  deep.type = 'lowpass'
  deep.frequency.value = 240
  deep.Q.value = 0.5
  drift(deep.frequency, 0.031, 80)
  deep.connect(mix)
  for (const [freq, cents, level] of [[73.42, -6, 0.22], [73.42, 7, 0.22], [110, -4, 0.13], [110, 5, 0.13]]) {
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = freq
    o.detune.value = cents
    const g = ctx.createGain()
    g.gain.value = level
    o.connect(g).connect(deep)
    o.start(t)
    live.push(o)
  }

  // the pad: D · A · E · F♯ · A · D, each voice swelling at its own slow pace
  for (const [freq, level, type, rate, cents, pan] of [
    [146.83, 0.11, 'sine', 0.043, -3, -0.3],
    [220.0, 0.09, 'triangle', 0.057, 4, 0.35],
    [329.63, 0.055, 'sine', 0.071, -5, -0.55],
    [369.99, 0.05, 'sine', 0.049, 3, 0.6],
    [440.0, 0.035, 'sine', 0.083, 6, 0.15],
    [587.33, 0.022, 'sine', 0.037, -4, -0.15],
  ]) {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = freq
    o.detune.value = cents
    const g = ctx.createGain()
    g.gain.value = level * 0.6
    drift(g.gain, rate, level * 0.4)
    o.connect(g)
    placed(g, pan)
    o.start(t)
    live.push(o)
  }

  // the air
  const len = ctx.sampleRate * 5
  const hiss = ctx.createBuffer(1, len, ctx.sampleRate)
  const hd = hiss.getChannelData(0)
  for (let i = 0; i < len; i++) hd[i] = Math.random() * 2 - 1
  const wind = ctx.createBufferSource()
  wind.buffer = hiss
  wind.loop = true
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 720
  band.Q.value = 0.8
  drift(band.frequency, 0.021, 360)
  const windLevel = ctx.createGain()
  windLevel.gain.value = 0.02
  drift(windLevel.gain, 0.017, 0.012)
  wind.connect(band).connect(windLevel).connect(mix)
  wind.start(t)
  live.push(wind)

  // far-off notes
  const STARS = [880, 1174.66, 1318.51, 1479.98, 1760, 2349.32]
  let timer = 0
  const star = () => {
    if (!document.hidden && ctx.state === 'running') {
      const now = ctx.currentTime
      const dur = 3.5 + Math.random() * 3
      const o = ctx.createOscillator()
      o.frequency.value = STARS[Math.floor(Math.random() * STARS.length)]
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.012 + Math.random() * 0.016, now + dur * 0.35)
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
      o.connect(g).connect(verb)
      o.start(now)
      o.stop(now + dur + 0.1)
    }
    timer = window.setTimeout(star, 2600 + Math.random() * 5200)
  }
  timer = window.setTimeout(star, 1800)

  return {
    gain,
    stop() {
      window.clearTimeout(timer)
      for (const n of live) {
        try {
          n.stop()
        } catch {
          /* already stopped */
        }
      }
      gain.disconnect()
    },
  }
}

const ambientTo = (level, seconds) => {
  if (!amb) return
  amb.gain.gain.cancelScheduledValues(ctx.currentTime)
  amb.gain.gain.setTargetAtTime(level, ctx.currentTime, seconds / 3)
}

function startAmbient() {
  if (!ctx) return set({ music: 'blocked' }) // the synthesiser only exists after the first interaction
  window.clearTimeout(ambStopTimer)
  try {
    amb = amb ?? buildAmbient()
  } catch {
    amb = null
    return set({ music: 'error' })
  }
  set({ music: 'on' })
  ambientTo(AMBIENT_LEVEL * state.ambience, AMBIENT_FADE_IN)
}

function stopAmbient(status) {
  set({ music: status })
  if (!amb) return
  ambientTo(0, FADE_OUT)
  window.clearTimeout(ambStopTimer)
  // once it has faded away the generators are switched off, so nothing runs in silence
  ambStopTimer = window.setTimeout(() => {
    amb?.stop()
    amb = null
  }, FADE_OUT * 1000 * 2.2)
}

// ── the music file ──────────────────────────────────────────────────────────
// One <audio> for the whole visit: it is never recreated, so the track never restarts
// or doubles up when the page changes.
let el = null
let run = false // is the track meant to be sounding right now
let fadeId = 0
let musicGain = null // only on devices that ignore an <audio>'s own volume (iPhone, iPad)
let volumeLocked = false

const musicTarget = () => Math.max(0, Math.min(1, state.ambience * MUSIC_LEVEL))
const getLevel = () => (musicGain ? musicGain.gain.value : el.volume)
const setLevel = (v) => {
  if (musicGain) musicGain.gain.value = v
  else el.volume = v
}

function fadeTo(target, seconds, then) {
  cancelAnimationFrame(fadeId)
  if (!el) return
  const from = getLevel()
  const start = performance.now()
  const step = (now) => {
    const k = Math.min(1, (now - start) / (seconds * 1000))
    setLevel(Math.max(0, Math.min(1, from + (target - from) * k)))
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
  volumeLocked = el.volume !== 0 // iPhone and iPad keep it at 1 whatever is asked
  el.src = MUSIC_FILE
  el.addEventListener('error', () => {
    cancelAnimationFrame(fadeId)
    run = false
    set({ music: 'error' })
  })
  return el
}

function startFile() {
  if (!ensureMusic()) return
  if (volumeLocked && ctx && !musicGain) {
    // there the volume is set after the player instead of on it
    try {
      musicGain = ctx.createGain()
      musicGain.gain.value = 0
      ctx.createMediaElementSource(el).connect(musicGain).connect(ctx.destination)
    } catch {
      musicGain = null
    }
  }
  if (run) return
  run = true
  cancelAnimationFrame(fadeId)
  if (el.paused) setLevel(0)
  if (state.music !== 'on') set({ music: 'loading' })
  const begun = () => {
    if (!run) return
    set({ music: 'on' })
    fadeTo(musicTarget(), FADE_IN)
  }
  const refused = (err) => {
    if (!run || err?.name === 'AbortError') return // it was paused again before it could start
    run = false
    // NotAllowedError = the browser wants the visitor to interact with the page first
    if (state.music === 'error') return
    const blocked = err?.name === 'NotAllowedError'
    if (blocked) el.preload = 'auto' // fetch it meanwhile, so it starts the instant they do
    set({ music: blocked ? 'blocked' : 'error' })
  }
  try {
    const p = el.play()
    if (p?.then) p.then(begun, refused)
    else begun()
  } catch (err) {
    refused(err)
  }
}

function stopFile(status, atOnce) {
  run = false
  if (state.music !== status) set({ music: status })
  if (!el || el.paused) return
  if (atOnce) {
    cancelAnimationFrame(fadeId)
    setLevel(0)
    el.pause()
  } else fadeTo(0, FADE_OUT, () => !run && el.pause())
}

// The one place that decides whether the music should be sounding.
function sync() {
  if (state.music === 'none' || state.music === 'error') return
  const wanted = state.ambienceOn && !state.muted && !state.mixtape
  if (wanted && !document.hidden) return USE_AMBIENT ? startAmbient() : startFile()
  // in a background tab it only rests: what the panel says stays as it was
  const status = !state.ambienceOn ? 'off' : wanted ? state.music : 'paused'
  if (USE_AMBIENT) stopAmbient(status)
  else stopFile(status, document.hidden)
}

// the tab goes to the background → the music rests, and picks up where it was on return
document.addEventListener('visibilitychange', sync)
// the page is being left: nothing keeps playing behind it
window.addEventListener('pagehide', () => {
  if (el && !el.paused) stopFile(state.music, true)
})
window.addEventListener('pageshow', (e) => e.persisted && sync())

// ── the controls ────────────────────────────────────────────────────────────
// The play / pause button of the ambience.
function toggleMusic() {
  if (state.music === 'none' || state.music === 'error' || state.muted) return
  const playing = state.music === 'on' || state.music === 'loading'
  if (!playing) {
    set({ ambienceOn: true, mixtape: false, mixtapeSmall: false }) // one source of music at a time
    return sync()
  }
  // the very click that let the browser start the music is not a request to pause it
  if (performance.now() - wokeAt < 1200) return
  set({ ambienceOn: false })
  sync()
}

// "Mute all sounds": silences the effects and the music, leaves both volumes as they are.
function setMuted(muted) {
  if (muted === state.muted) return
  if (muted) play('off')
  // the only way to silence Spotify's player is to close it
  set(muted ? { muted, mixtape: false, mixtapeSmall: false } : { muted })
  if (out) out.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, muted ? 0.12 : 0.02)
  sync()
  if (!muted) play('on')
}

function setAmbience(v) {
  set({ ambience: unit(Math.max(0, Math.min(1, v)), state.ambience) })
  if (USE_AMBIENT) {
    if (state.music === 'on') ambientTo(AMBIENT_LEVEL * state.ambience, 0.15)
  } else if (el && run && state.music === 'on') {
    cancelAnimationFrame(fadeId)
    setLevel(musicTarget())
  }
}

let heardAt = 0
function setSfx(v) {
  set({ sfx: unit(Math.max(0, Math.min(1, v)), state.sfx) })
  if (bus) bus.gain.setTargetAtTime(SFX_LEVEL * state.sfx, ctx.currentTime, 0.02)
  // a tick now and then while the slider moves, so the level can be heard
  const now = performance.now()
  if (now - heardAt > 190) {
    heardAt = now
    play('tick')
  }
}

// The Spotify player. Opening it lets the music step aside; closing it brings the music back.
function setMixtape(open) {
  if (!MIXTAPE_READY || open === state.mixtape || (open && state.muted)) return
  if (open) play('on')
  set({ mixtape: open, mixtapeSmall: false })
  sync()
}

let booted = false

export const audio = {
  subscribe: (l) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  get: () => state,
  // Called once when the site opens: tries to start the music straight away.
  boot() {
    if (booted) return
    booted = true
    sync()
  },
  unlock,
  play,
  setMuted,
  setAmbience,
  setSfx,
  toggleMusic,
  setMixtape,
  setMixtapeSmall: (small) => state.mixtape && set({ mixtapeSmall: small }),
  mixtapeReady: MIXTAPE_READY,
  musicKind: MUSIC_FILE ? 'file' : USE_AMBIENT ? 'ambient' : 'none',
  track: MUSIC_FILE ? { title: cfg.music?.title ?? '', artist: cfg.music?.artist ?? '' } : { title: USE_AMBIENT ? 'Space ambience' : '', artist: '' },
  ambient: () => (amb ? { level: amb.gain.gain.value } : null),
  log,
  running: () => Boolean(ctx && ctx.state === 'running'),
  musicElement: () => el,
  musicLevel: () => (el ? getLevel() : 0),
  nodes: () => ({ ctx, out, bus }),
}

if (import.meta.env.DEV) window.__kozmikAudio = audio
