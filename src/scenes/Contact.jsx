import { Arrow } from '../components/Bits.jsx'
import { SITE } from '../content/site.js'

// Contact / commission. Only the details given in content/site.js are shown.
export default function Contact({ phase }) {
  const c = SITE.contact
  const open = c.commissions.open
  const mailto = `mailto:${c.email}?subject=${encodeURIComponent(c.emailSubject)}`
  return (
    <section className="scene scene-scroll" data-phase={phase} aria-label="Contact">
      <div
        className="mx-auto flex min-h-full w-full max-w-[1100px] flex-col items-center px-6 text-center"
        style={{ paddingTop: 'calc(var(--nav-h) + clamp(20px, 7vh, 90px))', paddingBottom: 'clamp(120px, 22vh, 240px)' }}
      >
        <p className="label rise flex items-center gap-3 border border-line px-4 py-2.5 text-[10px] text-ink">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: open ? '#8fe3b0' : '#66718d', boxShadow: open ? '0 0 10px #8fe3b0' : 'none' }}
          />
          {open ? c.commissions.openLabel : c.commissions.closedLabel}
        </p>

        <h1
          className="display chrome-text rise mt-9 max-w-[16em] text-balance text-[clamp(22px,5.2vw,58px)]"
          style={{ '--i': 1 }}
        >
          {c.headline}
        </h1>

        <a
          href={mailto}
          className="rise mt-9 break-all text-[clamp(15px,2vw,22px)] tracking-wide text-ink underline decoration-line-strong decoration-1 underline-offset-8 transition-colors hover:decoration-ink"
          style={{ '--i': 2 }}
        >
          {c.email}
        </a>

        <div className="rise mt-10 flex flex-wrap items-center justify-center gap-3" style={{ '--i': 3 }}>
          <a href={mailto} className="btn btn-chrome">
            <span>{c.cta}</span>
            <Arrow size={15} />
          </a>
          {c.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener" className="btn">
              <span>{l.label}</span>
              <Arrow dir="out" size={13} />
            </a>
          ))}
        </div>

        <p className="label rise mt-auto pt-16 text-[10px] text-faint" style={{ '--i': 4 }}>
          {SITE.brand} <span className="mx-2">·</span>
          <a href={SITE.mainSite.href} className="transition-colors hover:text-ink">
            by {SITE.mainSite.label}
          </a>
        </p>
      </div>
    </section>
  )
}
