import { useCallback, useEffect, useRef, useState } from 'react'
import { fallbackSrc, srcSet } from '../lib/projects.js'
import { Arrow } from './Bits.jsx'

const FADE_MS = 900

// The logo icon versions, one at a time, cross-fading on their own and on click.
// `stages` = [{ label, item }] where item is a picture from aboutMedia().
// The artwork is always shown whole; the soft glow behind it is the same picture, blurred.
export default function LogoCycler({ stages, seconds = 3.5 }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const root = useRef(null)
  const lastChange = useRef(0)
  const count = stages.length

  const next = useCallback(() => {
    lastChange.current = performance.now()
    setIndex((i) => (i + 1) % count)
  }, [count])

  // The wait restarts after every change, so a click never fights the automatic loop.
  useEffect(() => {
    if (count < 2 || !visible) return
    const id = setTimeout(next, seconds * 1000)
    return () => clearTimeout(id)
  }, [index, count, seconds, visible, next])

  // Rest while it is off screen or the tab is in the background.
  useEffect(() => {
    const el = root.current
    if (!el) return
    let onScreen = true
    const update = () => setVisible(onScreen && !document.hidden)
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      update()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  // Clicks that arrive while a fade is still under way are ignored.
  const onClick = () => {
    if (performance.now() - lastChange.current < FADE_MS * 0.6) return
    next()
  }

  const current = stages[index]
  const two = (n) => String(n).padStart(2, '0')

  return (
    <div ref={root} className="logo-stage id-card overflow-hidden">
      <button
        type="button"
        onClick={onClick}
        className="logo-stage-view group"
        aria-label={`Logo version ${index + 1} of ${count}: ${current.label}. Show the next one.`}
      >
        {stages.map((s, i) => (
          <img
            key={`glow-${s.label}`}
            src={s.item.variants[0].src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            draggable="false"
            className="logo-stage-glow"
            data-on={i === index}
          />
        ))}
        {stages.map((s, i) => (
          <img
            key={s.label}
            src={fallbackSrc(s.item)}
            srcSet={srcSet(s.item)}
            sizes="(max-width: 700px) 100vw, 640px"
            width={s.item.w}
            height={s.item.h}
            alt={i === index ? `Kozmik logo icon: ${s.label}` : ''}
            aria-hidden={i !== index}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable="false"
            className="logo-stage-art"
            data-on={i === index}
          />
        ))}
        <span className="logo-stage-hint label" aria-hidden="true">
          Next <Arrow size={12} />
        </span>
      </button>

      <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 sm:px-6">
        <p className="label flex items-baseline gap-3 text-[10px] text-mute" aria-live="off">
          <span className="text-ink">
            {two(index + 1)} <span className="text-faint">/ {two(count)}</span>
          </span>
          <span key={current.label} className="fade text-cosmic">
            {current.label}
          </span>
        </p>
        <div className="flex flex-1 items-center justify-end gap-1.5" aria-hidden="true">
          {stages.map((s, i) => (
            <span key={s.label} className="logo-stage-pip" data-on={i === index} />
          ))}
        </div>
      </div>
    </div>
  )
}
