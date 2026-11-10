// The director decides what space looks like at every moment:
// where the planets sit, where the camera is, and how one place flows into the next.
// React tells it the current page; it drives the WebGL engine and reports back
// the planet positions so the clickable buttons line up with what is drawn.

import { PROJECTS, SYSTEMS } from '../content/projects.js'
import { createEngine } from './engine.js'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const norm3 = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}
const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
const hashStr = (s) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Sunlight for the universe: from the upper left, a little toward the viewer.
const SUN = norm3([-0.6, 0.5, 0.62])

// Looks used when a project has no `planet` block of its own.
const AUTO_LOOKS = [
  { type: 'gas', colors: ['#10244a', '#3f66a8', '#cfd9ee'], atmosphere: '#8fb4ff' },
  { type: 'rock', colors: ['#15171f', '#565c70', '#b9c0d2'], atmosphere: '#9fb0d8' },
  { type: 'ice', colors: ['#141a2a', '#8c9bbd', '#eef2fb'], atmosphere: '#a9c4ff' },
  { type: 'terra', colors: ['#0b2152', '#2b62b8', '#3d4a5e'], atmosphere: '#7fb0ff' },
  { type: 'gas', colors: ['#231a45', '#6652ac', '#d6ccf5'], atmosphere: '#b3a2ff' },
]

const BASE_RADIUS = 105 // world units; a planet with size 1

export const PLANETS = PROJECTS.map((project, index) => {
  const h = hashStr(project.id)
  const look = project.planet ?? AUTO_LOOKS[h % AUTO_LOOKS.length]
  const size = look.size ?? 0.85 + ((h >> 8) % 30) / 100
  const moons = []
  for (let i = 0; i < (look.moons ?? 0); i++) {
    const mh = hashStr(project.id + ':moon' + i)
    moons.push({
      dist: 1.75 + i * 0.55 + (mh % 20) / 100,
      size: 0.1 + ((mh >> 4) % 6) / 100,
      speed: (0.16 - i * 0.045) * (mh % 2 ? 1 : -1),
      phase: ((mh >> 8) % 628) / 100,
      squash: 0.3 + ((mh >> 12) % 12) / 100,
      roll: (((mh >> 16) % 60) - 30) / 100,
      seed: 3 + (mh % 97),
      colors: [hex('#16181f'), hex('#6e7385'), hex('#c4c9d6')],
      atmosphere: hex('#aab4cc'),
    })
  }
  return {
    id: project.id,
    index,
    system: project.system,
    type: look.type,
    size,
    colors: look.colors.map(hex),
    atmosphere: hex(look.atmosphere ?? '#8fb4ff'),
    ring: look.ring ? { ...look.ring, color: hex(look.ring.color) } : null,
    moons,
    seed: 1 + (h % 9973) / 100,
    tilt: look.ring ? look.ring.roll ?? 0 : (((h >> 5) % 70) - 35) / 100,
    spinRate: (look.type === 'gas' ? 0.05 : look.type === 'chrome' ? 0.035 : 0.028) * (0.8 + ((h >> 11) % 40) / 100),
    spinOffset: (h % 628) / 100,
    hover: 0,
  }
})

const planetById = Object.fromEntries(PLANETS.map((p) => [p.id, p]))

// Where every system and planet sits. `m` runs along the direction of travel
// (left→right on wide screens, top→bottom on phones), `c` across it.
function computeLayout(vw, vh) {
  const portrait = vw < vh * 0.9
  const scale = portrait ? clamp(Math.min(vw / 600, vh / 880), 0.5, 1.25) : clamp(vh / 1000, 0.36, 1.4)
  const step = portrait ? 300 : 272
  const gap = portrait ? 250 : 330
  const cross = portrait ? 150 : 176

  const planets = {}
  const systems = []
  let cursor = 0
  for (const sys of SYSTEMS) {
    const members = PLANETS.filter((p) => p.system === sys.id)
    const n = members.length
    if (!n) continue
    let a, b, half
    if (n === 1) {
      const p = members[0]
      const r = BASE_RADIUS * p.size
      a = r * (p.ring ? p.ring.outer + 0.5 : 2.15)
      b = a * 0.34
      half = a
    } else {
      a = ((n - 1) / 2) * step + 150
      b = cross
      half = a + 40
    }
    const centre = cursor + half
    members.forEach((p, i) => {
      let m = 0
      let c = 0
      if (n > 1) {
        m = (i - (n - 1) / 2) * step
        c = (i % 2 === 0 ? 1 : -1) * b * Math.sqrt(Math.max(0, 1 - (m / a) ** 2))
      }
      planets[p.id] = { m: centre + m, c, r: BASE_RADIUS * p.size }
    })
    systems.push({ id: sys.id, label: sys.label, count: n, m: centre, a, b, single: n === 1 })
    cursor = centre + half + gap
  }
  return { portrait, scale, planets, systems, length: Math.max(0, cursor - gap) }
}

function tween(duration, onUpdate, onDone) {
  return { t: 0, duration, onUpdate, onDone }
}

export function createDirector(canvas) {
  const engine = createEngine(canvas)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const listeners = new Set()
  const frameListeners = new Set()

  const state = {
    ok: !!engine,
    vw: 1,
    vh: 1,
    layout: computeLayout(1, 1),
    scene: null, // 'home' | 'about' | 'universe' | 'project' | 'contact'
    openId: null, // project whose planet is opened
    focusId: PLANETS[0]?.id ?? null,
    hoverId: null,
    busy: false, // a travel animation is running
  }

  // continuous values
  const pres = { home: 0, about: 0, universe: 0, contact: 0 }
  let open = 0 // 0 = universe overview, 1 = inside a project
  let backdrop = 1 // fades the opened planet when hopping between projects
  let pan = 0
  let panTarget = null
  let panVel = 0
  let dragging = false
  let follow = false // true while the visitor pans by hand: the nearest planet becomes the current one
  let time = 0
  let last = 0
  let raf = 0
  let camZ = 0
  const cam = [0, 0, 0]
  const prevCam = [0, 0, 0]
  const vel = [0, 0, 0]
  const mouse = [0, 0]
  const mouseS = [0, 0]
  const tweens = new Set()
  let slowFrames = 0
  let measured = 0
  let version = 0
  let snapshot = null

  const emit = () => {
    version++
    snapshot = null
    for (const l of listeners) l()
  }

  const getSnapshot = () => {
    if (!snapshot) {
      const { layout } = state
      const s = layout.scale
      const toPx = (m, c) => (layout.portrait ? { x: c * s, y: m * s } : { x: m * s, y: c * s })
      snapshot = {
        version,
        ok: state.ok,
        scene: state.scene,
        openId: state.openId,
        focusId: state.focusId,
        hoverId: state.hoverId,
        busy: state.busy,
        portrait: layout.portrait,
        planets: PLANETS.map((p) => {
          const pos = layout.planets[p.id]
          return { id: p.id, ...toPx(pos.m, pos.c), r: pos.r * s }
        }),
        systems: layout.systems.map((sys) => ({
          id: sys.id,
          label: sys.label,
          count: sys.count,
          single: sys.single,
          ...toPx(sys.m, 0),
          rx: (layout.portrait ? sys.b : sys.a) * s,
          ry: (layout.portrait ? sys.a : sys.b) * s,
        })),
      }
    }
    return snapshot
  }

  // ── geometry helpers ────────────────────────────────────────────────────
  const panBounds = () => {
    const { systems, length, scale, portrait } = state.layout
    if (!systems.length) return [0, 0]
    const visible = (portrait ? state.vh : state.vw) / scale
    if (visible >= length + 240) return [length / 2, length / 2]
    const first = systems[0]
    const lastSys = systems[systems.length - 1]
    return [Math.min(first.m, visible / 2 - 120), Math.max(lastSys.m, length - visible / 2 + 120)]
  }

  const anchor = () => (state.layout.portrait ? state.vh * 0.47 : state.vw * 0.5)
  const crossAnchor = () => (state.layout.portrait ? state.vw * 0.5 : state.vh * 0.455)

  // screen position of a planet in the universe overview
  const overviewPos = (id) => {
    const { layout } = state
    const pos = layout.planets[id]
    const s = layout.scale
    const along = (pos.m - pan) * s + anchor()
    const across = pos.c * s + crossAnchor()
    return layout.portrait ? { x: across, y: along, r: pos.r * s } : { x: along, y: across, r: pos.r * s }
  }

  // where the opened planet rests behind a project page: a quiet arc in the top-right corner
  const backdropPos = () => {
    const { vw, vh } = state
    if (state.layout.portrait) {
      const r = vw * 0.5
      return { x: vw * 1.04, y: -r * 0.5, r }
    }
    const r = Math.min(vh * 0.36, vw * 0.23)
    return { x: vw - r * 0.02, y: -r * 0.34, r }
  }

  const nearestToCentre = () => {
    let best = null
    let bestD = Infinity
    for (const p of PLANETS) {
      const d = Math.abs(state.layout.planets[p.id].m - pan)
      if (d < bestD) {
        bestD = d
        best = p.id
      }
    }
    return best
  }

  // ── public controls ─────────────────────────────────────────────────────
  function resize() {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const before = state.layout
    const focus = state.focusId && before.planets[state.focusId]
    state.vw = vw
    state.vh = vh
    state.layout = computeLayout(vw, vh)
    if (engine) engine.resize(vw, vh, window.devicePixelRatio || 1)
    // keep looking at the same planet after a rotate / resize
    if (focus) pan = state.layout.planets[state.focusId].m
    const [lo, hi] = panBounds()
    pan = clamp(pan, lo, hi)
    panTarget = null
    emit()
  }

  function run(tw) {
    tweens.add(tw)
    return tw
  }

  function setPresence(target, duration) {
    const from = { ...pres }
    const to = { home: 0, about: 0, universe: 0, contact: 0, [target]: 1 }
    run(
      tween(duration, (t) => {
        for (const k of Object.keys(pres)) {
          // the old place leaves in the first part, the new one arrives in the last part
          const out = 1 - smooth(0, 0.42, t)
          const inn = smooth(0.5, 1, t)
          pres[k] = to[k] > from[k] ? lerp(from[k], 1, inn) : to[k] < from[k] ? from[k] * out : from[k]
        }
      }),
    )
  }

  function travel(distance, duration) {
    if (reduced.matches || !distance) return
    const start = camZ
    run(tween(duration, (t) => (camZ = start + distance * easeInOut(t))))
  }

  const ORDER = { home: 0, about: 1, universe: 2, project: 2, contact: 3 }
  const placeOf = (scene) => (scene === 'project' ? 'universe' : scene)

  // Called by the app whenever the page (route) changes.
  function setRoute(scene, projectId = null) {
    const prev = state.scene
    const prevOpen = state.openId
    if (prev === scene && prevOpen === projectId) return
    const first = prev === null
    const quick = reduced.matches
    state.scene = scene
    state.openId = scene === 'project' ? projectId : null
    if (projectId && planetById[projectId]) state.focusId = projectId

    const done = () => {
      state.busy = false
      emit()
    }
    tweens.clear()

    if (first) {
      // first paint: no journey, just be there
      for (const k of Object.keys(pres)) pres[k] = k === placeOf(scene) ? 1 : 0
      open = scene === 'project' ? 1 : 0
      backdrop = 1
      if (state.focusId) pan = state.layout.planets[state.focusId].m
      emit()
      return
    }

    state.busy = true
    const samePlace = placeOf(prev) === placeOf(scene)

    if (samePlace && prev === 'universe' && scene === 'project') {
      // fly into the planet
      const from = open
      run(tween(quick ? 260 : 1250, (t) => (open = lerp(from, 1, easeInOut(t))), done))
      travel(0.5, 1250)
    } else if (samePlace && prev === 'project' && scene === 'universe') {
      // pull back out to the overview, centred on the planet we just left
      if (prevOpen && state.layout.planets[prevOpen]) {
        const [lo, hi] = panBounds()
        pan = clamp(state.layout.planets[prevOpen].m, lo, hi)
        panTarget = null
        panVel = 0
      }
      const from = open
      run(tween(quick ? 260 : 1100, (t) => (open = lerp(from, 0, easeInOut(t))), done))
      travel(-0.4, 1100)
    } else if (samePlace && prev === 'project' && scene === 'project') {
      // hop from one planet to the next
      const half = quick ? 140 : 380
      run(
        tween(half, (t) => (backdrop = 1 - t), () => {
          run(tween(half * 1.4, (t) => (backdrop = easeOut(t)), done))
        }),
      )
      travel(0.6, 900)
    } else {
      // a journey between two places
      const duration = quick ? 320 : 1500
      const direction = Math.sign(ORDER[scene] - ORDER[prev]) || 1
      setPresence(placeOf(scene), duration)
      travel(direction * 1.1, duration)
      const targetOpen = scene === 'project' ? 1 : 0
      const from = open
      // when leaving/arriving the universe the planets are invisible in the middle, so switch then
      run(tween(duration, (t) => (open = t < 0.46 ? from : targetOpen), done))
      backdrop = 1
      if (scene === 'universe' || scene === 'project') {
        const id = state.focusId
        if (id && placeOf(prev) !== 'universe') {
          const [lo, hi] = panBounds()
          pan = clamp(state.layout.planets[id].m, lo, hi)
          panTarget = null
          panVel = 0
        }
      }
    }
    emit()
  }

  function setFocus(id, { glide = false } = {}) {
    if (!planetById[id]) return
    if (glide) {
      const [lo, hi] = panBounds()
      panTarget = clamp(state.layout.planets[id].m, lo, hi)
      panVel = 0
      follow = false
    }
    if (state.focusId !== id) {
      state.focusId = id
      emit()
    }
  }

  function setHover(id) {
    if (state.hoverId === id) return
    state.hoverId = id
    emit()
  }

  function glideToSystem(systemId) {
    const sys = state.layout.systems.find((s) => s.id === systemId)
    if (!sys) return
    const members = PLANETS.filter((p) => p.system === systemId)
    const [lo, hi] = panBounds()
    panTarget = clamp(sys.m, lo, hi)
    panVel = 0
    follow = false
    // focus the member nearest the system's centre
    let best = members[0]
    for (const m of members) {
      if (Math.abs(state.layout.planets[m.id].m - sys.m) < Math.abs(state.layout.planets[best.id].m - sys.m)) best = m
    }
    if (best && state.focusId !== best.id) {
      state.focusId = best.id
      emit()
    }
  }

  // dragging / wheel: `px` is a distance on screen along the direction of travel
  function dragStart() {
    dragging = true
    follow = true
    panTarget = null
    panVel = 0
  }
  function dragBy(px) {
    const [lo, hi] = panBounds()
    let next = pan - px / state.layout.scale
    // rubber band at the ends
    if (next < lo) next = lo - (lo - next) * 0.35
    if (next > hi) next = hi + (next - hi) * 0.35
    pan = next
    panTarget = null
  }
  function dragEnd(velocityPx = 0) {
    dragging = false
    panVel = reduced.matches ? 0 : -velocityPx / state.layout.scale
  }
  function wheelBy(px) {
    const [lo, hi] = panBounds()
    const base = panTarget ?? pan
    panTarget = clamp(base + px / state.layout.scale, lo, hi)
    panVel = 0
    follow = true
  }

  function setMouse(nx, ny) {
    mouse[0] = nx
    mouse[1] = ny
  }

  // ── building a frame ────────────────────────────────────────────────────
  // ── Home: distant worlds, moons and drifting rocks around the words ─────
  // l / p   where it sits in landscape / portrait, as fractions of the screen
  // r       radius, as a fraction of the screen's height (landscape)
  // depth   how near it feels: nearer things answer the pointer more and bob more
  const HOME_LIGHT = norm3([-0.4, 0.66, 0.45])
  const HOME_SKY = [
    {
      l: [0.085, 0.27], p: [0.86, 0.15], r: 0.036, depth: 1.0, alpha: 0.55,
      type: 'gas', colors: ['#0e1024', '#2e335c', '#9aa0c4'], atmosphere: '#6f78a8',
      ring: { inner: 1.45, outer: 2.25, tilt: 0.26, roll: 0.34, color: hex('#8a90b4') },
      seed: 4.2, tilt: 0.34, spin: 0.03, moon: { a: 3.2, b: 0.85, roll: 0.34, rate: 0.11, r: 0.14 },
    },
    {
      l: [0.9, 0.205], p: [0.1, 0.235], r: 0.016, depth: 0.5, alpha: 0.5,
      type: 'ice', colors: ['#0c1a33', '#5f8fd0', '#e6f1ff'], atmosphere: '#a9d0ff', seed: 18.6, tilt: -0.2, spin: 0.02,
    },
    {
      l: [0.95, 0.6], p: [0.92, 0.745], r: 0.026, depth: 1.5, alpha: 0.55,
      type: 'rock', colors: ['#15171f', '#565c70', '#b9c0d2'], atmosphere: '#9fb0d8', seed: 9.1, tilt: 0.15, spin: 0.018,
    },
    {
      l: [0.86, 0.79], p: [0.08, 0.715], r: 0.009, depth: 2.1, alpha: 0.55,
      type: 'chrome', colors: ['#1a1f2e', '#8a93ab', '#eef2fb'], atmosphere: '#c9d6f2', seed: 2.7, tilt: 0, spin: 0.05,
    },
  ].map((b) => ({ ...b, colors: b.colors.map(hex), atmosphere: hex(b.atmosphere) }))
  // a loose stream of small rocks crossing the lower left corner, very slowly
  const HOME_ROCKS = Array.from({ length: 7 }, (_, i) => {
    const h = (n) => ((hashStr(`rock${i}-${n}`) % 1000) / 1000)
    return { u: h(1), rate: 0.006 + h(2) * 0.006, off: (h(3) - 0.5) * 0.11, r: 0.0024 + h(4) * 0.004, seed: 40 + i * 3.7, depth: 1.6 + h(5) * 1.4 }
  })
  const ROCK_LOOK = { colors: ['#101219', '#4a4f60', '#a7aec0'].map(hex), atmosphere: hex('#000000') }

  function homeSky(bodies) {
    const { vw, vh } = state
    const portrait = state.layout.portrait
    const e = easeOut(pres.home)
    const fade = smooth(0, 0.8, pres.home)
    const unit = portrait ? Math.min(vw * 1.5, vh) : vh
    const calm = reduced.matches ? 0 : 1
    const place = (fx, fy, depth, phase) => [
      fx * vw + (fx - 0.5) * (1 - e) * 110 * depth - mouseS[0] * depth * 11,
      fy * vh + (fy - 0.5) * (1 - e) * 70 * depth - mouseS[1] * depth * 8 + Math.sin(time * 0.22 + phase) * depth * 3.5 * calm,
    ]

    for (const b of HOME_SKY) {
      const [fx, fy] = portrait ? b.p : b.l
      const [x, y] = place(fx, fy, b.depth, b.seed)
      const r = b.r * unit
      const body = {
        x, y, r, type: b.type, colors: b.colors, atmosphere: b.atmosphere, ring: b.ring,
        seed: b.seed, spin: time * b.spin + b.seed, tilt: b.tilt, light: HOME_LIGHT, alpha: fade * b.alpha, glow: 0.35,
      }
      if (!b.moon) {
        bodies.push(body)
        continue
      }
      // its moon goes round on a tilted orbit: drawn behind the planet for half the trip
      const a = time * b.moon.rate * calm + 1.1
      const ox = Math.cos(a) * b.moon.a * r
      const oy = Math.sin(a) * b.moon.b * r
      const c = Math.cos(-b.moon.roll)
      const s = Math.sin(-b.moon.roll)
      const moon = {
        x: x + ox * c - oy * s, y: y + ox * s + oy * c, r: r * b.moon.r, type: 'rock', colors: ROCK_LOOK.colors, atmosphere: ROCK_LOOK.atmosphere,
        seed: 71.3, spin: time * 0.05, tilt: 0, light: HOME_LIGHT, alpha: fade * 0.5, glow: 0,
      }
      if (Math.sin(a) < 0) bodies.push(moon, body)
      else bodies.push(body, moon)
    }

    const from = portrait ? [-0.06, 0.725] : [-0.03, 0.6]
    const to = portrait ? [0.52, 0.8] : [0.27, 0.86]
    for (const k of HOME_ROCKS) {
      const u = (k.u + time * k.rate * calm) % 1
      const fx = lerp(from[0], to[0], u) - k.off * 0.35
      const fy = lerp(from[1], to[1], u) + k.off
      const [x, y] = place(fx, fy, k.depth, k.seed)
      bodies.push({
        x, y, r: k.r * unit, type: 'rock', colors: ROCK_LOOK.colors, atmosphere: ROCK_LOOK.atmosphere,
        seed: k.seed, spin: time * 0.12 + k.seed, tilt: k.off * 6, light: HOME_LIGHT, alpha: fade * Math.sin(Math.PI * u) * 0.5, glow: 0,
      })
    }
  }

  function decorBodies(bodies) {
    const { vw, vh } = state
    const portrait = state.layout.portrait

    if (pres.home > 0.002) {
      homeSky(bodies)
      // Home: a blue world seen from orbit, its horizon glowing along the bottom.
      const e = easeOut(pres.home)
      const R = Math.max(vw * 1.25, vh * 1.7)
      const visible = vh * (portrait ? 0.17 : 0.215)
      bodies.push({
        x: vw * 0.5,
        y: vh - visible + R + (1 - e) * vh * 0.42,
        r: R,
        type: 'terra',
        colors: [hex('#04112e'), hex('#1a4f9e'), hex('#26344a')],
        atmosphere: hex('#77b2ff'),
        seed: 12.4,
        spin: time * 0.0045 + 1.3,
        tilt: 1.22,
        light: norm3([0.14, 0.5, -0.85]),
        alpha: smooth(0, 0.7, pres.home),
        detail: 2.4,
        glow: 1.5,
        haze: 10,
        cloud: 0.5,
      })
    }

    if (pres.about > 0.002) {
      // About: a silver-blue ringed giant drifting at the edge.
      const e = easeOut(pres.about)
      const r = portrait ? vw * 0.34 : Math.min(vh * 0.27, vw * 0.17)
      bodies.push({
        x: portrait ? vw * 1.1 : vw + r * 0.42 + (1 - e) * 60,
        y: portrait ? vh * 0.93 : vh * 0.8,
        r: r * lerp(0.86, 1, e),
        type: 'gas',
        colors: [hex('#0b1838'), hex('#3c5f9f'), hex('#c8d5f0')],
        atmosphere: hex('#9cbcff'),
        ring: { inner: 1.4, outer: 2.2, tilt: 0.3, roll: -0.38, color: hex('#b7c5e6') },
        seed: 7.7,
        spin: time * 0.035,
        tilt: -0.38,
        light: SUN,
        alpha: pres.about * 0.6,
        glow: 1,
      })
    }

    if (pres.contact > 0.002) {
      // Contact: the night side of a world, a thin sunrise tracing its edge.
      const e = easeOut(pres.contact)
      const R = Math.max(vw * 0.95, vh * 1.25)
      const visible = vh * (portrait ? 0.14 : 0.19)
      bodies.push({
        x: vw * 0.5,
        y: vh - visible + R + (1 - e) * vh * 0.35,
        r: R,
        type: 'rock',
        colors: [hex('#0a0f1e'), hex('#2a3550'), hex('#8fa0c4')],
        atmosphere: hex('#9cc2ff'),
        seed: 31.9,
        spin: time * 0.003,
        tilt: 0.1,
        light: norm3([0.3, 0.42, -0.86]),
        alpha: smooth(0, 0.7, pres.contact),
        detail: 2.2,
        glow: 2.0,
        haze: 8,
      })
    }
  }

  function universeBodies(bodies, placed) {
    const u = pres.universe
    if (u <= 0.002) return
    const { vw, vh } = state
    const arrive = easeOut(u)
    const openE = open
    const openPlanet = state.openId ? planetById[state.openId] : null
    // while travelling in/out of a project, everything else rushes past the opened planet
    const pivotId = openPlanet ? openPlanet.id : state.focusId
    const pivot = pivotId ? overviewPos(pivotId) : { x: vw / 2, y: vh / 2, r: 1 }
    const target = backdropPos()

    for (const p of PLANETS) {
      const o = overviewPos(p.id)
      let x = o.x
      let y = o.y
      let r = o.r
      let alpha = u
      let glow = 1 + p.hover * 0.45
      const isOpen = openPlanet && p.id === openPlanet.id

      // arriving in the universe: planets ease in from deeper space
      const sc = lerp(0.72, 1, arrive)
      x = vw / 2 + (x - vw / 2) * sc
      y = vh / 2 + (y - vh / 2) * sc
      r *= sc * (1 + p.hover * 0.045)

      if (openE > 0.0005) {
        if (isOpen) {
          const k = easeInOut(openE)
          x = lerp(x, target.x, k)
          y = lerp(y, target.y, k)
          r = r * Math.pow(target.r / r, k)
          alpha = u * lerp(1, 0.55, k) * backdrop
          glow = lerp(glow, 0.9, k)
        } else {
          const k = openE * openE
          const push = 1 + k * 3.2
          x = pivot.x + (x - pivot.x) * push
          y = pivot.y + (y - pivot.y) * push
          r *= 1 + k * 1.6
          alpha = u * (1 - smooth(0.05, 0.6, openE))
        }
      }

      placed[p.id] = { x, y, r, alpha }
      if (alpha <= 0.003) continue
      if (x + r * 2.6 < 0 || x - r * 2.6 > vw || y + r * 2.6 < 0 || y - r * 2.6 > vh) continue

      const planetBody = {
        x,
        y,
        r,
        type: p.type,
        colors: p.colors,
        atmosphere: p.atmosphere,
        ring: p.ring,
        seed: p.seed,
        spin: p.spinOffset + time * p.spinRate,
        tilt: p.tilt,
        light: SUN,
        alpha,
        glow,
        detail: 1,
      }

      const behind = []
      const front = []
      for (const m of p.moons) {
        const a = m.phase + time * m.speed
        const dx = Math.cos(a) * m.dist
        const depth = Math.sin(a)
        const dy = depth * m.dist * m.squash
        const cr = Math.cos(m.roll)
        const sr = Math.sin(m.roll)
        const moon = {
          x: x + (dx * cr - dy * sr) * r,
          y: y + (dx * sr + dy * cr) * r,
          r: r * m.size * (1 + depth * 0.08),
          type: 'rock',
          colors: m.colors,
          atmosphere: m.atmosphere,
          seed: m.seed,
          spin: time * 0.05 + m.phase,
          tilt: 0.2,
          light: SUN,
          alpha: alpha * (isOpen ? 1 - openE : 1),
          glow: 0.5,
          detail: 0.8,
        }
        ;(depth > 0 ? front : behind).push(moon)
      }
      bodies.push(...behind, planetBody, ...front)
    }
  }

  function tick(now) {
    raf = requestAnimationFrame(tick)
    if (!last) last = now
    const rawDt = (now - last) / 1000
    const dt = Math.min(0.05, rawDt)
    last = now
    time += dt * (reduced.matches ? 0.25 : 1)

    for (const tw of [...tweens]) {
      tw.t = Math.min(1, tw.t + (dt * 1000) / tw.duration)
      tw.onUpdate(tw.t)
      if (tw.t >= 1) {
        tweens.delete(tw)
        tw.onDone?.()
      }
    }

    // panning: glide to a target, or coast after a flick
    const [lo, hi] = panBounds()
    if (!dragging) {
      if (panTarget != null) {
        pan += (panTarget - pan) * (1 - Math.exp(-dt * 5.5))
        if (Math.abs(panTarget - pan) < 0.4) {
          pan = panTarget
          panTarget = null
        }
      } else {
        if (Math.abs(panVel) > 2) {
          pan += panVel * dt
          panVel *= Math.exp(-dt * 3.4)
        } else panVel = 0
        // settle back inside the ends
        if (pan < lo) pan += (lo - pan) * (1 - Math.exp(-dt * 9))
        if (pan > hi) pan += (hi - pan) * (1 - Math.exp(-dt * 9))
      }
    }

    // while exploring by hand, the planet nearest the centre becomes the current one
    if (state.scene === 'universe' && follow && !state.busy && (dragging || panVel !== 0 || panTarget != null)) {
      const near = nearestToCentre()
      if (near && near !== state.focusId) {
        state.focusId = near
        emit()
      }
    }

    const lit = state.scene === 'universe' ? state.hoverId ?? state.focusId : null
    for (const p of PLANETS) {
      const target = p.id === lit ? 1 : 0
      p.hover += (target - p.hover) * (1 - Math.exp(-dt * 9))
    }

    // camera for stars and nebula
    if (!reduced.matches) camZ += dt * 0.0032
    mouseS[0] += (mouse[0] - mouseS[0]) * (1 - Math.exp(-dt * 3))
    mouseS[1] += (mouse[1] - mouseS[1]) * (1 - Math.exp(-dt * 3))
    const s = state.layout.scale
    const along = pan * s * 0.07
    cam[0] = (state.layout.portrait ? 0 : along) + mouseS[0] * 14 + time * 0.6
    cam[1] = (state.layout.portrait ? along : 0) + mouseS[1] * 10
    cam[2] = camZ
    const streak = [0, 0, 0]
    if (rawDt > 0 && rawDt < 0.2) {
      for (let i = 0; i < 3; i++) {
        const v = (cam[i] - prevCam[i]) / dt
        vel[i] += (v - vel[i]) * (1 - Math.exp(-dt * 14))
      }
      streak[0] = vel[0] * 0.012
      streak[1] = vel[1] * 0.012
      streak[2] = vel[2] * 0.06
    }
    prevCam[0] = cam[0]
    prevCam[1] = cam[1]
    prevCam[2] = cam[2]

    const bodies = []
    const placed = {}
    decorBodies(bodies)
    universeBodies(bodies, placed)

    const inProject = pres.universe * open
    if (engine) {
      engine.render({
        time,
        cssW: state.vw,
        cssH: state.vh,
        cam,
        streak,
        nebula: [cam[0] * 0.00022 + 0.4, -cam[1] * 0.00022 + 0.2, camZ * 0.55],
        nebulaAmount: lerp(1, 0.55, inProject),
        galaxy: Math.max(pres.home, pres.contact * 0.7),
        starAmount: lerp(1, 0.8, inProject),
        dim: inProject * 0.28,
        bodies,
      })

      // if the device is struggling, draw at a lower resolution
      if (measured < 240) {
        measured++
        if (measured > 40 && rawDt > 0.03) slowFrames++
        if (measured === 240 && slowFrames > 70 && engine.quality > 0.55) {
          engine.setQuality(engine.quality * 0.75)
          engine.resize(state.vw, state.vh, window.devicePixelRatio || 1)
          measured = 0
          slowFrames = 0
        }
      }
    }

    if (frameListeners.size) {
      const info = {
        portrait: state.layout.portrait,
        // translate for the layer that holds the planet buttons and orbit lines
        tx: state.layout.portrait ? crossAnchor() : anchor() - pan * s,
        ty: state.layout.portrait ? anchor() - pan * s : crossAnchor(),
        // 1 while the overview is fully there, 0 while travelling or inside a project
        ui: smooth(0.75, 1, pres.universe) * (1 - smooth(0, 0.25, open)),
        open,
        pres,
        placed,
      }
      for (const l of frameListeners) l(info)
    }
  }

  function start() {
    resize()
    window.addEventListener('resize', resize)
    cancelAnimationFrame(raf)
    last = 0
    raf = requestAnimationFrame(tick)
  }

  function stop() {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    engine?.dispose()
  }

  return {
    start,
    stop,
    setRoute,
    setFocus,
    setHover,
    glideToSystem,
    dragStart,
    dragBy,
    dragEnd,
    wheelBy,
    setMouse,
    subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
    getSnapshot,
    onFrame: (l) => (frameListeners.add(l), () => frameListeners.delete(l)),
  }
}
