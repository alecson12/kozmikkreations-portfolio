import { useEffect, useState } from 'react'
import { Arrow, Chevron } from '../components/Bits.jsx'
import Carousel from '../components/Carousel.jsx'
import Gallery from '../components/Gallery.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { SITE } from '../content/site.js'
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

  // back button · centred title · project switcher (labelled, so it is not mistaken for the slide arrows)
  const header = (
    <div
      className="rise grid flex-none grid-cols-[auto_auto] items-center justify-between gap-x-3 gap-y-4 px-5 pb-4 sm:px-8 wide:grid-cols-[auto_minmax(0,1fr)_auto] wide:gap-x-6 lg:px-12"
      style={{ '--d': '60ms' }}
    >
      <a href={links.universe} aria-label={`Back to ${SITE.nav.universe}`} className="btn min-h-11 justify-self-start gap-2 px-3 text-[10px] tracking-[0.1em] sm:gap-[0.9em] sm:px-6 sm:tracking-[0.26em]">
        <Arrow dir="left" size={14} className="order-first" />
        <span className="max-[379px]:hidden">{SITE.nav.universe}</span>
      </a>
      <div className="order-last col-span-2 min-w-0 text-center wide:order-none wide:col-span-1">
        <p className="eyebrow truncate">{project.kind}</p>
        <h1 className="display chrome-text mt-2.5 text-balance text-[clamp(17px,2.5vw,30px)]">{project.title}</h1>
      </div>
      <nav aria-label="Change project" className="flex items-center gap-1.5 justify-self-end sm:gap-3">
        <a href={prev.href} className="icon-btn max-sm:h-10 max-sm:w-10" aria-label={`Previous project: ${prev.title}`} title={`Previous project: ${prev.title}`}>
          <Chevron dir="left" />
        </a>
        <p className="label text-center text-[9px] leading-[1.7] tracking-[0.18em] text-mute sm:text-[10px] sm:tracking-[0.26em]">
          Project
          <span className="block text-ink">
            {project.number} / {total}
          </span>
        </p>
        <a href={next.href} className="icon-btn max-sm:h-10 max-sm:w-10" aria-label={`Next project: ${next.title}`} title={`Next project: ${next.title}`}>
          <Chevron />
        </a>
      </nav>
    </div>
  )

  // "About this project": the short story and the facts that are known. Nothing is shown for a fact that is not set.
  // It always comes after the images, with the same counter line in between, whatever the layout.
  const facts = [
    ['Category', project.kind],
    ['Client', project.client],
    ['Year', project.year],
    ['Role', project.role],
    ['Tools', project.tools],
  ].filter(([, v]) => v)
  const story = project.story && (
    <section aria-label="About this project" className="mx-auto w-full max-w-[1500px] px-5 pb-8 sm:px-8 lg:px-12">
      <div className="flex h-16 items-center gap-5">
        <h2 className="eyebrow whitespace-nowrap">About this project</h2>
        <div className="hairline flex-1" />
      </div>
      <div className="grid gap-x-16 gap-y-7 pt-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <p className="max-w-[66ch] text-pretty text-[clamp(15px,1.2vw,18px)] leading-[1.75] text-ink/90">{project.story}</p>
        <dl className="story-facts self-start">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="label text-[9px] text-mute sm:text-[10px]">{k}</dt>
              <dd className="text-[14px] text-ink sm:text-[15px]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
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
    </nav>
  )

  return (
    <section className="scene scene-scroll" data-phase={phase} aria-label={project.title}>
      {/* a soft veil keeps the artwork, not the sky, as the brightest thing on screen */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,rgb(3_4_10/0.55),rgb(3_4_10/0.2)_70%,transparent)]" />

      <div className="relative">
        {isCarousel ? (
          <div className="flex flex-col" style={{ height: project.story ? 'calc(100dvh - 58px)' : '100dvh', paddingTop: 'var(--nav-h)' }}>
            {header}
            <div className="fade flex min-h-0 flex-1 flex-col" style={{ '--d': '140ms' }}>
              <Carousel project={project} onZoom={setZoomed} paused={zoomed !== null || phase === 'out'} />
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 'var(--nav-h)' }}>
            {header}
            <div className="px-5 pt-2 sm:px-8 lg:px-12">
              <Gallery project={project} onZoom={setZoomed} />
            </div>
            <p className="label flex h-14 items-center justify-center text-[10px] text-faint">
              {pieces} {pieces === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
        )}
        {story}
        {footer}
      </div>

      {zoomed !== null && (
        <Lightbox project={project} index={zoomed} onIndex={setZoomed} onClose={() => setZoomed(null)} />
      )}
    </section>
  )
}
