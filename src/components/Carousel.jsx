import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Chevron } from './Bits.jsx'
import { Clip, Picture } from './Media.jsx'

const two = (n) => String(n).padStart(2, '0')

// A carousel post, shown the way it was posted: one slide at a time, in the original
// order, edge to edge so artwork that continues across slides still lines up.
// Swipe, drag the trackpad, use the arrows or the keyboard.
export default function Carousel({ project, onZoom, paused }) {
  const items = project.items
  const stageRef = useRef(null)
  const trackRef = useRef(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  useLayoutEffect(() => {
    const el = stageRef.current
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Each slide is as tall as the stage allows, never wider than the stage, never cropped.
  const narrow = box.w < 720
  const maxW = narrow ? box.w : box.w * 0.84
  const sizes = items.map((it) => {
    const w = Math.min(maxW, box.h * it.aspect)
    return { w: Math.floor(w), h: Math.floor(w / it.aspect) }
  })
  const padL = Math.max(0, (box.w - (sizes[0]?.w ?? 0)) / 2)
  const padR = Math.max(0, (box.w - (sizes.at(-1)?.w ?? 0)) / 2)

  const centreOf = useCallback(
    (i) => {
      let x = padL
      for (let k = 0; k < i; k++) x += sizes[k].w
      return x + sizes[i].w / 2 - box.w / 2
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [padL, box.w, box.h, items],
  )

  const goTo = useCallback(
    (i, smooth = true) => {
      const idx = Math.max(0, Math.min(items.length - 1, i))
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      trackRef.current?.scrollTo({ left: centreOf(idx), behavior: smooth && !reduce ? 'smooth' : 'auto' })
    },
    [centreOf, items.length],
  )

  // keep the current slide centred when the window size changes
  useLayoutEffect(() => {
    if (!box.w) return
    const el = trackRef.current
    const snap = el.style.scrollSnapType
    el.style.scrollSnapType = 'none'
    el.scrollLeft = centreOf(activeRef.current)
    el.style.scrollSnapType = snap
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.w, box.h])

  const onScroll = () => {
    const el = trackRef.current
    const mid = el.scrollLeft + box.w / 2
    let x = padL
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < sizes.length; i++) {
      const c = x + sizes[i].w / 2
      const d = Math.abs(c - mid)
      if (d < bestD) {
        bestD = d
        best = i
      }
      x += sizes[i].w
    }
    if (best !== activeRef.current) {
      activeRef.current = best
      setActive(best)
    }
  }

  useEffect(() => {
    if (paused) return
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target.closest?.('video')) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(activeRef.current + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(activeRef.current - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, paused])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={stageRef} className="relative min-h-0 flex-1">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar absolute inset-0 flex snap-x snap-mandatory items-center overflow-x-auto overflow-y-hidden"
          style={{ paddingLeft: padL, paddingRight: padR, visibility: box.w ? 'visible' : 'hidden' }}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${project.title} — ${items.length} slides`}
        >
          {items.map((item, i) => {
            const isActive = i === active
            const label = `${project.title} — slide ${i + 1} of ${items.length}`
            return (
              <div
                key={item.file}
                className="slide relative"
                data-active={isActive}
                style={{ width: sizes[i].w, height: sizes[i].h }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${items.length}`}
              >
                {item.type === 'video' ? (
                  <Clip item={item} active={isActive && !paused} label={label} />
                ) : (
                  <button
                    type="button"
                    className={`block h-full w-full ${isActive ? 'zoomable' : 'cursor-pointer'}`}
                    aria-label={isActive ? `${label}. View larger.` : `Go to slide ${i + 1}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => (isActive ? onZoom(i) : goTo(i))}
                  >
                    <Picture
                      item={item}
                      alt={label}
                      eager={i < 2}
                      sizes={`${Math.max(1, sizes[i].w)}px`}
                      fetchPriority={i === 0 ? 'high' : undefined}
                    />
                  </button>
                )}
                {!isActive && item.type === 'video' && (
                  <button type="button" className="absolute inset-0" aria-label={`Go to slide ${i + 1}`} onClick={() => goTo(i)} />
                )}
              </div>
            )
          })}
        </div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              className="icon-btn absolute left-3 top-1/2 hidden -translate-y-1/2 backdrop-blur-sm sm:left-6 md:grid lg:left-10"
              aria-label="Previous slide"
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              className="icon-btn absolute right-3 top-1/2 hidden -translate-y-1/2 backdrop-blur-sm sm:right-6 md:grid lg:right-10"
              aria-label="Next slide"
              disabled={active === items.length - 1}
              onClick={() => goTo(active + 1)}
            >
              <Chevron />
            </button>
          </>
        )}
      </div>

      <div className="flex h-14 flex-none items-center justify-center gap-5 px-5">
        <span className="label w-16 whitespace-nowrap text-right text-[10px] tabular-nums text-ink" aria-live="polite">
          {two(active + 1)} <span className="text-faint">/ {two(items.length)}</span>
        </span>
        {items.length > 1 && (
          <div className="flex w-full max-w-[360px] items-center gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.file}
                type="button"
                className="pip-btn"
                aria-label={`Slide ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
              >
                <span className="pip w-full max-w-none" />
              </button>
            ))}
          </div>
        )}
        <span className="w-16" aria-hidden="true" />
      </div>
    </div>
  )
}
