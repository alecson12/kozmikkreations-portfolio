// Decides which interactions make a sound. One set of listeners for the whole site,
// so no component has to know about audio and nothing can be wired up twice.

import { audio } from './audio.js'

// Hovering one of these gives the faint blip (mouse only).
const HOVER = [
  'header nav a',
  'a.btn',
  'button.btn',
  'button.planet',
  '.icon-btn',
  '.photo-link',
  '.logo-stage-view',
  '.sound-toggle',
  'nav[aria-label="More projects"] a',
  'nav[aria-label="Planetary systems"] button',
].join(',')

// Clicking one of these gives the full click…
const CLICK = ['a[href^="#/"]', 'button.planet', 'button.btn'].join(',')
// …and these smaller controls give the lighter tick.
const TICK = [
  '.icon-btn',
  '.pip-btn',
  '.logo-stage-view',
  '.photo-link',
  'button.zoomable',
  'button[aria-controls="menu"]',
  'nav[aria-label="Planetary systems"] button',
].join(',')
// Never: links that leave the site, e-mail links, form fields, the sound panel itself.
const SILENT = 'a[target="_blank"], a[href^="mailto:"], input, textarea, select, [data-sfx="none"], [data-sfx="none"] *'

let started = false

export function startSfx() {
  if (started) return
  started = true

  // the first real click / tap / key press is what allows audio at all
  const wake = () => audio.unlock()
  window.addEventListener('pointerdown', wake, { capture: true, passive: true })
  window.addEventListener('keydown', wake, { capture: true })

  let lastEl = null
  let lastAt = 0
  document.addEventListener(
    'pointerover',
    (e) => {
      if (e.pointerType !== 'mouse') return // touch has no hover
      const el = e.target.closest?.(HOVER)
      if (!el || el.disabled || el.matches(SILENT)) return
      if (e.relatedTarget && el.contains(e.relatedTarget)) return // still inside the same control
      const now = performance.now()
      if (el === lastEl && now - lastAt < 700) return // no chatter when the cursor trembles on an edge
      lastEl = el
      lastAt = now
      audio.play('hover')
    },
    { passive: true },
  )

  document.addEventListener(
    'click',
    (e) => {
      const t = e.target
      if (!t.closest || t.closest(SILENT)) return
      const small = t.closest(TICK)
      if (small && !small.disabled) return void audio.play('tick')
      const main = t.closest(CLICK)
      if (main && !main.disabled) audio.play('click')
    },
    { capture: true },
  )
}

// Page changes: a project opening, a project closing, or a sweep between pages.
export function routeSound(from, to) {
  if (!from || (from.scene === to.scene && from.projectId === to.projectId)) return
  if (to.scene === 'project' && from.scene !== 'project') audio.play('open')
  else if (from.scene === 'project' && to.scene !== 'project') audio.play('close')
  else audio.play('transition')
}
