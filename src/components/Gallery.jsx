import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Clip, Picture } from './Media.jsx'

// Lays the pieces out in rows, in the given order, each at its own proportions:
// every row is scaled so it exactly fills the width. Nothing is cropped.
// On a phone it becomes one column.
function buildRows(items, width, gap, target, maxH) {
  const n = items.length
  if (!width || !n) return []
  const total = items.reduce((s, it) => s + it.aspect, 0)
  const count = Math.max(1, Math.min(n, Math.round((total * target) / width)))
  // the height a run of pieces gets when it fills the width
  const heightOf = (from, to) => {
    let sum = 0
    for (let i = from; i < to; i++) sum += items[i].aspect
    return (width - gap * (to - from - 1)) / sum
  }
  // try every way of cutting the sequence into `count` rows; keep the one whose
  // smallest row is largest, so no piece ends up tiny next to the others
  let best = null
  const search = (start, left, cuts, min) => {
    if (left === 1) {
      const m = Math.min(min, heightOf(start, n))
      const all = [...cuts, n]
      // on a tie, prefer fuller rows first so a short last row sits centred underneath
      const tie = best && Math.abs(m - best.min) <= 0.5 && all.join() > best.cuts.join()
      if (!best || m > best.min + 0.5 || tie) best = { min: m, cuts: all }
      return
    }
    for (let end = start + 1; end <= n - (left - 1); end++) {
      search(end, left - 1, [...cuts, end], Math.min(min, heightOf(start, end)))
    }
  }
  search(0, count, [], Infinity)
  const h = Math.min(best.min, maxH)
  const rows = []
  let from = 0
  for (const to of best.cuts) {
    rows.push({ h, items: items.slice(from, to).map((it) => ({ it, w: h * it.aspect })) })
    from = to
  }
  return rows
}

export default function Gallery({ project, onZoom }) {
  const items = project.items
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  const [vh, setVh] = useState(() => window.innerHeight)

  useLayoutEffect(() => {
    const el = ref.current
    const measure = () => {
      setWidth(el.clientWidth)
      setVh(window.innerHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const single = width < 640
  const gap = width < 900 ? 14 : 22
  const maxH = Math.max(320, vh * 0.76)
  // a handful of pieces get one generous row; larger sets use a tighter rhythm
  const target = items.length <= 3 ? maxH : Math.min(maxH, Math.max(300, width / 3.1))
  const rows = useMemo(
    () => (single ? [] : buildRows(items, width, gap, target, maxH)),
    [items, width, gap, target, maxH, single],
  )

  const cell = (it, w, h) => {
    const label = `${project.title} — piece ${it.index + 1} of ${items.length}`
    return (
      <div key={it.file} className="rise flex-none" style={{ width: w, height: h, '--i': Math.min(it.index, 8), '--d': '80ms' }}>
        {it.type === 'video' ? (
          <Clip item={it} active label={label} />
        ) : (
          <button type="button" className="zoomable block h-full w-full" aria-label={`${label}. View larger.`} onClick={() => onZoom(it.index)}>
            <Picture item={it} alt={label} eager={it.index < 3} sizes={`${Math.ceil(w)}px`} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1500px]">
      {single ? (
        <div className="flex flex-col items-center" style={{ gap }}>
          {items.map((it) => {
            // full width, but a very tall piece is limited so it can still be seen whole
            const w = Math.min(width, it.w, maxH * 1.15 * it.aspect)
            return cell(it, w, w / it.aspect)
          })}
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap }}>
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-center" style={{ gap }}>
              {r.items.map(({ it, w }) => cell(it, Math.min(w, it.w), Math.min(r.h, it.h)))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
