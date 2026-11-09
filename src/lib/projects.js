// Joins the project list (content/projects.js) with the measured media files
// (content/media.json, written by `npm run media`) into what the pages use.

import media from '../content/media.json'
import { PROJECTS, SYSTEMS } from '../content/projects.js'

const BASE = import.meta.env.BASE_URL
export const asset = (path) => `${BASE}${path}`

const two = (n) => String(n).padStart(2, '0')

export const projects = PROJECTS.map((p, index) => {
  const system = SYSTEMS.find((s) => s.id === p.system)
  const items = (media[p.id] ?? []).map((m, i) => {
    const url = (file) => asset(`media/${p.id}/${file}`)
    const common = { index: i, file: m.file, type: m.type, w: m.w, h: m.h, aspect: m.w / m.h }
    return m.type === 'video'
      ? { ...common, src: url(m.src), poster: url(m.poster) }
      : { ...common, variants: m.variants.map((v) => ({ w: v.w, src: url(v.src) })) }
  })
  return {
    ...p,
    index,
    number: two(index + 1),
    systemLabel: system?.label ?? '',
    items,
    href: `#/project/${p.id}`,
  }
})

export const total = two(projects.length)
export const projectById = Object.fromEntries(projects.map((p) => [p.id, p]))
export const systems = SYSTEMS.map((s) => ({ ...s, projects: projects.filter((p) => p.system === s.id) })).filter(
  (s) => s.projects.length,
)

export const neighbours = (project) => ({
  prev: projects[(project.index - 1 + projects.length) % projects.length],
  next: projects[(project.index + 1) % projects.length],
})

// srcset for an image item; the browser picks the smallest file that is sharp enough.
export const srcSet = (item) => item.variants.map((v) => `${v.src} ${v.w}w`).join(', ')
export const largest = (item) => item.variants[item.variants.length - 1]
export const fallbackSrc = (item) => (item.variants.find((v) => v.w >= 960) ?? largest(item)).src
