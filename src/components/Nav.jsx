import { useEffect, useState } from 'react'
import { links } from '../lib/router.js'
import { Arrow, Mark, Wordmark } from './Bits.jsx'

const ITEMS = [
  { id: 'home', label: 'Home', href: links.home },
  { id: 'about', label: 'About', href: links.about },
  { id: 'universe', label: 'Universe', href: links.universe },
  { id: 'contact', label: 'Contact', href: links.contact },
]

export default function Nav({ route }) {
  const [open, setOpen] = useState(false)
  const inProject = route.scene === 'project'
  const current = inProject ? 'universe' : route.scene

  useEffect(() => setOpen(false), [route])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div
        className="flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"
        style={{ height: 'var(--nav-h)', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="pointer-events-auto flex items-center gap-5 sm:gap-7">
          <a href={links.home} aria-label="Kozmik Kreations — home" className="flex items-center gap-3">
            <Mark className="w-7 sm:w-8" />
            <Wordmark className="hidden h-[22px] w-auto opacity-95 sm:block" />
          </a>
          {inProject && (
            <a href={links.universe} className="label flex items-center gap-2.5 text-mute transition-colors hover:text-ink">
              <Arrow dir="left" size={14} />
              <span>Universe</span>
            </a>
          )}
        </div>

        <nav aria-label="Main" className="pointer-events-auto hidden items-center gap-9 md:flex">
          {ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={current === item.id ? 'page' : undefined}
              className="label text-link"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="label pointer-events-auto flex h-11 items-center gap-3 text-ink md:hidden"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span>{open ? 'Close' : 'Menu'}</span>
          <span className="relative block h-3 w-5" aria-hidden="true">
            <span
              className="absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-300"
              style={{ transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }}
            />
            <span
              className="absolute bottom-0 left-0 h-px w-5 bg-current transition-transform duration-300"
              style={{ transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none' }}
            />
          </span>
        </button>
      </div>

      {/* phone menu */}
      <div
        id="menu"
        className="pointer-events-auto fixed inset-0 -z-10 flex flex-col justify-center bg-void/92 px-8 backdrop-blur-md transition-opacity duration-300 md:hidden"
        style={{ opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden' }}
        inert={!open}
      >
        <nav aria-label="Menu" className="flex flex-col gap-7">
          {ITEMS.map((item, i) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={current === item.id ? 'page' : undefined}
              className="display flex items-baseline gap-4 text-2xl text-ink"
            >
              <span className="label w-6 text-cosmic">0{i + 1}</span>
              <span className={current === item.id ? 'chrome-text' : ''}>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
