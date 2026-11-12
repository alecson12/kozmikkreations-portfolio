import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { audio } from '../lib/audio.js'
import { largest, srcSet } from '../lib/projects.js'
import { Chevron, Close } from './Bits.jsx'

const two = (n) => String(n).padStart(2, '0')

// Full-screen view of one piece. Fits the screen first; “Actual size” shows the
// largest file at 1:1 and lets you drag (or scroll / pinch) around it.
export default function Lightbox({ project, index, onIndex, onClose }) {
  const images = project.items.filter((it) => it.type === 'image')
  const pos = Math.max(0, images.findIndex((it) => it.index === index))
  const item = images[pos]
  const [zoom, setZoom] = useState(false)
  const scroller = useRef(null)
  const closeRef = useRef(null)
  const pan = useRef(null)

  const step = (d) => {
    const next = images[(pos + d + images.length) % images.length]
    setZoom(false)
    audio.play('slide', { dir: d })
    onIndex(next.index)
  }

  useEffect(() => {
    const before = document.activeElement
    closeRef.current?.focus()
    return () => before?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        e.preventDefault()
        step(1)
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        e.preventDefault()
        step(-1)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  // when switching to actual size, start centred
  useEffect(() => {
    const el = scroller.current
    if (!el || !zoom) return
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
  }, [zoom, index])

  const big = largest(item)
  const bigH = Math.round(big.w / item.aspect)
  const canZoom = big.w > window.innerWidth * 0.9 || bigH > window.innerHeight * 0.8

  const onPointerDown = (e) => {
    if (!zoom || e.pointerType !== 'mouse') return
    const el = scroller.current
    pan.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false }
    el.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    const p = pan.current
    if (!p) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    if (Math.abs(dx) + Math.abs(dy) > 4) p.moved = true
    scroller.current.scrollLeft = p.left - dx
    scroller.current.scrollTop = p.top - dy
  }
  const onPointerUp = () => {
    const p = pan.current
    pan.current = null
    if (p && !p.moved) setZoom(false)
  }

  // drawn at the top level of the page so it covers the navigation too
  return createPortal(
    <div
      className="fade fixed inset-0 z-50 flex flex-col bg-[#02030a]/96 backdrop-blur-md"
      style={{ animationDuration: '0.3s' }}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — piece ${index + 1}, enlarged`}
    >
      <div className="flex h-16 flex-none items-center justify-between gap-4 px-4 sm:px-6">
        <p className="label min-w-0 truncate text-[10px] text-mute">
          <span className="text-ink">{two(pos + 1)}</span> / {two(images.length)}
          <span className="mx-3 hidden text-faint sm:inline">·</span>
          <span className="hidden sm:inline">{project.title}</span>
        </p>
        <div className="flex items-center gap-2">
          {canZoom && (
            <button type="button" className="btn min-h-11 px-4 text-[10px]" aria-pressed={zoom} onClick={() => setZoom((z) => !z)}>
              {zoom ? 'Fit to screen' : 'Actual size'}
            </button>
          )}
          <button ref={closeRef} type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Close />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className={`relative min-h-0 flex-1 ${zoom ? 'overflow-auto' : 'overflow-hidden'}`}
        style={{ cursor: zoom ? 'grab' : 'default', touchAction: zoom ? 'pan-x pan-y pinch-zoom' : 'auto' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(e) => !zoom && e.target === e.currentTarget && onClose()}
      >
        {zoom ? (
          <img
            key={`z${item.index}`}
            src={big.src}
            width={big.w}
            height={bigH}
            alt={`${project.title} — piece ${index + 1} at actual size`}
            draggable="false"
            className="block max-w-none select-none"
            style={{ width: big.w, height: bigH, margin: 'auto' }}
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 pb-6 sm:px-20">
            <img
              key={item.index}
              src={big.src}
              srcSet={srcSet(item)}
              sizes="100vw"
              width={item.w}
              height={item.h}
              alt={`${project.title} — piece ${index + 1}`}
              draggable="false"
              className={`fade pointer-events-auto max-h-full max-w-full select-none object-contain ${canZoom ? 'zoomable' : ''}`}
              style={{ width: 'auto', height: 'auto', animationDuration: '0.35s' }}
              onClick={() => canZoom && setZoom(true)}
            />
          </div>
        )}

        {!zoom && images.length > 1 && (
          <>
            <button
              type="button"
              className="icon-btn absolute left-3 top-1/2 -translate-y-1/2 backdrop-blur-sm sm:left-6"
              aria-label="Previous piece"
              data-sfx="slide"
              onClick={() => step(-1)}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              className="icon-btn absolute right-3 top-1/2 -translate-y-1/2 backdrop-blur-sm sm:right-6"
              aria-label="Next piece"
              data-sfx="slide"
              onClick={() => step(1)}
            >
              <Chevron />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
