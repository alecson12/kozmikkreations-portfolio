import { useEffect, useMemo, useRef, useState } from 'react'
import { Arrow, Chevron, Sparkle } from '../components/Bits.jsx'
import { useCosmos, useDirector } from '../cosmos/context.js'
import { go } from '../lib/router.js'
import { projectById, projects, systems, total } from '../lib/projects.js'

const DRAG_THRESHOLD = 7

// The universe: every project is a planet. Drag, scroll or use the arrows to travel;
// hover (or tap) a planet to see what it is, click (or tap again) to fly in.
export default function Universe({ phase }) {
  const director = useDirector()
  const cosmos = useCosmos()
  const sceneRef = useRef(null)
  const layerRef = useRef(null)
  const drag = useRef({ id: null, x: 0, y: 0, moved: false, lastT: 0, v: 0, dragged: false })
  const [dragging, setDragging] = useState(false)
  const [hinted, setHinted] = useState(false)

  const focus = projectById[cosmos.focusId] ?? projects[0]
  const lit = cosmos.hoverId ?? cosmos.focusId
  const placed = useMemo(() => Object.fromEntries(cosmos.planets.map((p) => [p.id, p])), [cosmos.planets])

  // keep the layer of buttons and orbit lines glued to what the canvas draws
  useEffect(() => {
    return director.onFrame((f) => {
      const el = layerRef.current
      if (!el) return
      el.style.transform = `translate3d(${f.tx}px, ${f.ty}px, 0)`
      el.style.opacity = f.ui
      el.style.pointerEvents = f.ui > 0.7 ? '' : 'none'
    })
  }, [director])

  // ── travelling by hand ───────────────────────────────────────────────────
  const axis = (e) => (cosmos.portrait ? e.clientY : e.clientX)

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return
    if (e.target.closest('[data-hud]')) return
    drag.current = { id: e.pointerId, pos: axis(e), start: axis(e), moved: false, lastT: e.timeStamp, v: 0, dragged: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (d.id !== e.pointerId) return
    const pos = axis(e)
    if (!d.moved) {
      if (Math.abs(pos - d.start) < DRAG_THRESHOLD) return
      d.moved = true
      d.dragged = true
      d.pos = pos
      sceneRef.current?.setPointerCapture(e.pointerId)
      director.dragStart()
      director.setHover(null)
      setDragging(true)
      setHinted(true)
      return
    }
    const delta = pos - d.pos
    const dt = Math.max(1, e.timeStamp - d.lastT)
    d.v = d.v * 0.6 + ((delta / dt) * 1000) * 0.4
    d.pos = pos
    d.lastT = e.timeStamp
    director.dragBy(delta)
  }
  const onPointerUp = (e) => {
    const d = drag.current
    if (d.id !== e.pointerId) return
    if (d.moved) {
      const stale = e.timeStamp - d.lastT > 90
      director.dragEnd(stale ? 0 : d.v)
      setDragging(false)
    }
    d.id = null
    // a drag must not count as a click on the planet under the pointer
    setTimeout(() => (drag.current.dragged = false), 0)
  }

  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const onWheel = (e) => {
      if (e.ctrlKey) return
      e.preventDefault()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      director.wheelBy(delta * (e.deltaMode === 1 ? 32 : 1) * 1.15)
      setHinted(true)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [director])

  const tabsRef = useRef(null)
  useEffect(() => {
    const tab = tabsRef.current?.querySelector('[aria-pressed="true"]')
    tab?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [focus.system])

  const step = (dir) => {
    const next = projects[(focus.index + dir + projects.length) % projects.length]
    director.setFocus(next.id, { glide: true })
    setHinted(true)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        step(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'Enter' && document.activeElement === document.body) {
        go(focus.href)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const activate = (project, e) => {
    if (drag.current.dragged) return
    const touch = e.nativeEvent.pointerType === 'touch' || e.nativeEvent.pointerType === 'pen'
    // on touch there is no hover: the first tap selects, the second opens
    if (touch && cosmos.focusId !== project.id) {
      director.setFocus(project.id, { glide: true })
      return
    }
    director.setFocus(project.id)
    go(project.href)
  }

  return (
    <section
      ref={sceneRef}
      className="scene universe"
      data-phase={phase}
      data-dragging={dragging}
      data-portrait={cosmos.portrait}
      aria-label="My kreations — every planet is a project"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={layerRef} className="absolute left-0 top-0 will-change-transform" style={{ opacity: 0 }}>
        {/* orbit lines */}
        <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1" aria-hidden="true">
          {cosmos.systems.map((s) => (
            <ellipse
              key={s.id}
              cx={s.x}
              cy={s.y}
              rx={s.rx}
              ry={s.ry}
              fill="none"
              stroke="rgb(201 214 242)"
              strokeOpacity={s.single ? 0.1 : 0.15}
              strokeWidth="1"
              strokeDasharray={s.single ? '2 7' : undefined}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* each system's own star and name */}
        {cosmos.systems.map((s) => {
          const here = focus.system === s.id
          const only = s.single ? placed[projects.find((p) => p.system === s.id)?.id] : null
          const top = only ? s.y - only.r - 52 : cosmos.portrait ? s.y - s.ry - 34 : s.y
          return (
            <div
              key={s.id}
              className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 text-center transition-opacity duration-500"
              style={{ left: s.x, top, opacity: here ? 1 : 0.55 }}
            >
              {!s.single && <Sparkle size={13} className="text-chrome" />}
              <span className="label whitespace-nowrap text-[10px] text-mute">{s.label}</span>
            </div>
          )
        })}

        {projects.map((project) => {
          const p = placed[project.id]
          if (!p) return null
          const look = project.planet
          const system = cosmos.systems.find((s) => s.id === project.system)
          const side = system && !system.single && (cosmos.portrait ? false : p.y < system.y - 1) ? 'above' : 'below'
          return (
            <button
              key={project.id}
              type="button"
              className="planet"
              data-lit={lit === project.id}
              data-fallback={!cosmos.ok}
              aria-label={`${project.title} — ${project.kind}. Open project.`}
              style={{
                left: p.x - p.r,
                top: p.y - p.r,
                width: p.r * 2,
                height: p.r * 2,
                '--p0': look?.colors?.[0],
                '--p1': look?.colors?.[1],
                '--p2': look?.colors?.[2],
                '--pa': look?.atmosphere,
              }}
              onPointerEnter={(e) => e.pointerType === 'mouse' && director.setHover(project.id)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && director.setHover(null)}
              onFocus={(e) => e.target.matches(':focus-visible') && director.setFocus(project.id, { glide: true })}
              onClick={(e) => activate(project, e)}
            >
              <span className="reticle" />
              <span className="tag" data-side={side}>
                <span className="display block text-[12px] leading-snug tracking-[0.14em] text-ink sm:text-[13px]">
                  {project.title}
                </span>
                <span className="mt-1.5 block text-[12px] tracking-wide text-mute">{project.kind}</span>
              </span>
            </button>
          )
        })}
      </div>

      <p
        className="label pointer-events-none absolute bottom-9 left-12 hidden text-[10px] leading-relaxed text-faint transition-opacity duration-700 min-[1440px]:block"
        style={{ opacity: hinted ? 0 : 1 }}
        aria-hidden="true"
      >
        Drag or scroll to travel
        <br />
        Select a planet to open it
      </p>

      {/* where you are, and how to move on */}
      <div
        data-hud
        className="fade pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-5 sm:gap-4 sm:px-8 sm:pb-8"
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))', '--d': '300ms' }}
      >
        <nav
          ref={tabsRef}
          aria-label="Planetary systems"
          className="no-scrollbar pointer-events-auto flex max-w-full gap-1 overflow-x-auto [@media(max-height:520px)]:hidden"
        >
          {systems.map((s) => {
            const here = focus.system === s.id
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={here}
                onClick={() => {
                  director.glideToSystem(s.id)
                  setHinted(true)
                }}
                className={`label relative whitespace-nowrap px-3 py-3 text-[10px] transition-colors sm:px-4 ${here ? 'text-ink' : 'text-faint hover:text-mute'}`}
              >
                {s.label}
                <span
                  className="absolute inset-x-3 bottom-1 h-px origin-left bg-chrome transition-transform duration-500 sm:inset-x-4"
                  style={{ transform: here ? 'scaleX(1)' : 'scaleX(0)' }}
                />
              </button>
            )
          })}
        </nav>

        <div className="panel pointer-events-auto flex w-full max-w-[700px] flex-wrap bg-deep/90 items-center gap-2 p-2 backdrop-blur-sm sm:flex-nowrap sm:gap-3 sm:p-2.5">
          <button type="button" className="icon-btn order-2 sm:order-none" aria-label="Previous planet" onClick={() => step(-1)}>
            <Chevron dir="left" />
          </button>
          <div className="order-1 min-w-0 basis-full px-2 pt-1.5 sm:order-none sm:flex-1 sm:basis-0 sm:pt-0" aria-live="polite">
            <p className="label truncate text-[10px] tracking-[0.2em] text-cosmic">
              {focus.number} / {total} <span className="mx-1.5 text-faint">·</span> {focus.kind}
            </p>
            <p className="display mt-1 line-clamp-2 text-balance text-[11px] leading-snug tracking-[0.12em] text-ink sm:text-[13px]">{focus.title}</p>
          </div>
          <a href={focus.href} className="btn order-3 min-h-11 flex-1 px-4 sm:order-none sm:flex-none sm:px-6" onClick={() => director.setFocus(focus.id)}>
            <span>Explore</span>
            <Arrow size={14} />
          </a>
          <button type="button" className="icon-btn order-4 sm:order-none" aria-label="Next planet" onClick={() => step(1)}>
            <Chevron />
          </button>
        </div>
      </div>
    </section>
  )
}
