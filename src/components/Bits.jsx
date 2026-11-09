// Small shared pieces: the logo, the four-point sparkle, arrows.

import { asset } from '../lib/projects.js'

const MARK = asset('brand/kozmik-mark.png')
const CHROME = asset('brand/kozmik-chrome.webp')
const WORDMARK = asset('brand/kozmik-wordmark.png')

// The chrome Kozmik mark exactly as supplied (Kozmik_Chrome.png, resized for the web).
export function Mark({ className = '', sheen = false, style }) {
  return (
    <span className={`mark ${className}`} style={style}>
      <img src={CHROME} alt="Kozmik Kreations" width="2262" height="1971" draggable="false" />
      {sheen && (
        <span className="mark-sheen" style={{ WebkitMaskImage: `url("${MARK}")`, maskImage: `url("${MARK}")` }} aria-hidden="true" />
      )}
    </span>
  )
}

export function Wordmark({ className = '' }) {
  return <img src={WORDMARK} alt="Kozmik Kreations" width="1796" height="513" className={className} draggable="false" />
}

// The four-point star used throughout the brand's own artwork.
export function Sparkle({ className = '', size = 12 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12C7.5 10.2 11.1 6.6 12 0Z" fill="currentColor" />
    </svg>
  )
}

export function Arrow({ dir = 'right', size = 16, className = '' }) {
  const rotate = { right: 0, left: 180, up: -90, down: 90, out: -45 }[dir]
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`arrow ${className}`}
      style={{ rotate: `${rotate}deg` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function Chevron({ dir = 'right', size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ rotate: dir === 'left' ? '180deg' : '0deg' }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function Close({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  )
}
