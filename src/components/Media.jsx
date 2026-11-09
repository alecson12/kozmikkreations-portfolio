import { useEffect, useRef } from 'react'
import { fallbackSrc, srcSet } from '../lib/projects.js'

// One piece of artwork, exactly as supplied: never cropped (object-fit: contain),
// with its real width/height so the page does not jump while it loads.
export function Picture({ item, sizes, alt, eager = false, className = 'art', ...rest }) {
  return (
    <img
      src={fallbackSrc(item)}
      srcSet={srcSet(item)}
      sizes={sizes}
      width={item.w}
      height={item.h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      className={className}
      {...rest}
    />
  )
}

// A video slide. Plays (muted, looping) only while it is the one being looked at.
export function Clip({ item, active, label, className = 'art' }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) {
      const p = v.play()
      if (p?.catch) p.catch(() => {})
    } else {
      v.pause()
    }
  }, [active])
  return (
    <video
      ref={ref}
      src={item.src}
      poster={item.poster}
      width={item.w}
      height={item.h}
      muted
      loop
      playsInline
      controls
      preload={active ? 'auto' : 'none'}
      aria-label={label}
      className={className}
    />
  )
}
