import { useEffect, useState } from 'react'
import { SITE } from '../content/site.js'
import { links } from '../lib/router.js'
import { Mark, Sparkle, Wordmark } from './Bits.jsx'
import SoundControl from './SoundControl.jsx'

const ITEMS = [
  { id: 'home', label: SITE.nav.home, href: links.home },
  { id: 'about', label: SITE.nav.about, href: links.about },
  { id: 'universe', label: SITE.nav.universe, href: links.universe },
  { id: 'contact', label: SITE.nav.contact, href: links.contact },
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
            {/* shown at every width except the narrow band where the four page names need the room */}
            <Wordmark className="h-[20px] w-auto flex-none sm:h-[22px] min-[768px]:max-[859px]:hidden" />
          </a>
        </div>

        <div className="pointer-events-auto flex items-center gap-4 md:gap-7 lg:gap-9">
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex lg:gap-10">
          {ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={current === item.id ? 'page' : undefined}
              className="label text-link"
            >
              <Sparkle size={9} className="nav-star" />
              {item.label}
            </a>
          ))}
        </nav>

        <SoundControl />

        <button
          type="button"
          className="label flex h-11 items-center gap-3 text-ink md:hidden"
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
              {current === item.id && <Sparkle size={13} className="self-center text-chrome" />}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
