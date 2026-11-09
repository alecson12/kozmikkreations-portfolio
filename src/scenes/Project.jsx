import { useEffect, useState } from 'react'
import { Arrow } from '../components/Bits.jsx'
import Carousel from '../components/Carousel.jsx'
import Gallery from '../components/Gallery.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { go, links } from '../lib/router.js'
import { neighbours, projectById, total } from '../lib/projects.js'

// One project: the artwork is the centre of attention, space stays in the background.
export default function Project({ projectId, phase }) {
  const project = projectById[projectId]
  const { prev, next } = neighbours(project)
  const [zoomed, setZoomed] = useState(null)
  const isCarousel = project.layout === 'carousel'
  const pieces = project.items.length

  // Esc goes back to the universe (unless the enlarged view is open: then it closes that)
  useEffect(() => {
    if (zoomed !== null) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented) go(links.universe)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  const header = (
    <div className="rise flex flex-none flex-col items-start gap-4 px-5 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-8 lg:px-12" style={{ '--d': '60ms' }}>
      <a href={links.universe} className="btn min-h-11 flex-none px-4 text-[10px] sm:px-6">
        <Arrow dir="left" size={14} className="order-first" />
        <span>Explore Projects</span>
      </a>
      <div className="min-w-0 self-end text-right sm:self-auto">
        <p className="eyebrow truncate">
          {project.kind} <span className="mx-2 text-faint">·</span> {project.number} / {total}
        </p>
        <h1 className="display chrome-text mt-2.5 text-balance text-[clamp(17px,2.5vw,30px)]">{project.title}</h1>
      </div>
    </div>
  )

  const footer = (
    <nav
      aria-label="More projects"
      className="mx-auto grid w-full max-w-[1500px] flex-none grid-cols-2 gap-px px-5 pb-10 pt-4 sm:px-8 lg:px-12"
    >
      <a href={prev.href} className="group flex flex-col gap-2 border-t border-line py-5 pr-4 transition-colors hover:border-line-strong">
        <span className="label flex items-center gap-2 text-[10px] text-faint">
          <Arrow dir="left" size={12} /> Previous
        </span>
        <span className="display text-[11px] tracking-[0.12em] text-mute transition-colors group-hover:text-ink sm:text-[13px]">
          {prev.title}
        </span>
      </a>
      <a
        href={next.href}
        className="group flex flex-col items-end gap-2 border-t border-line py-5 pl-4 text-right transition-colors hover:border-line-strong"
      >
        <span className="label flex items-center gap-2 text-[10px] text-faint">
          Next <Arrow size={12} />
        </span>
        <span className="display text-[11px] tracking-[0.12em] text-mute transition-colors group-hover:text-ink sm:text-[13px]">
          {next.title}
        </span>
      </a>
      <a href={links.universe} className="label col-span-2 mt-3 flex items-center justify-center gap-3 py-3 text-[10px] text-mute transition-colors hover:text-ink">
        <Arrow dir="left" size={13} /> Back to all projects
      </a>
    </nav>
  )

  return (
    <section className="scene scene-scroll" data-phase={phase} aria-label={project.title}>
      {/* a soft veil keeps the artwork, not the sky, as the brightest thing on screen */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,rgb(3_4_10/0.55),rgb(3_4_10/0.2)_70%,transparent)]" />

      <div className="relative">
        {isCarousel ? (
          <div className="flex flex-col" style={{ height: '100dvh', paddingTop: 'var(--nav-h)' }}>
            {header}
            <div className="fade flex min-h-0 flex-1 flex-col" style={{ '--d': '140ms' }}>
              <Carousel project={project} onZoom={setZoomed} paused={zoomed !== null || phase === 'out'} />
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 'var(--nav-h)' }}>
            {header}
            <div className="px-5 pb-10 pt-2 sm:px-8 lg:px-12">
              <Gallery project={project} onZoom={setZoomed} />
            </div>
            <p className="label pb-2 text-center text-[10px] text-faint">
              {pieces} {pieces === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
        )}
        {footer}
      </div>

      {zoomed !== null && (
        <Lightbox project={project} index={zoomed} onIndex={setZoomed} onClose={() => setZoomed(null)} />
      )}
    </section>
  )
}
