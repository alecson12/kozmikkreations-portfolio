import { Arrow, Sparkle } from '../components/Bits.jsx'
import { Picture } from '../components/Media.jsx'
import { SITE } from '../content/site.js'
import { aboutMedia } from '../lib/projects.js'
import { links } from '../lib/router.js'

// Behind Kozmik: the creator's "galactic ID", in the spirit of the Behind Kozmik slide.
// All wording comes from content/site.js; all pictures from the AboutMe folder.
export default function About({ phase }) {
  const a = SITE.about
  const c = SITE.contact
  const portrait = aboutMedia(a.portrait)
  const video = aboutMedia(a.markVideo)

  return (
    <section className="scene scene-scroll" data-phase={phase} aria-label="About">
      <div
        className="mx-auto w-full max-w-[1180px] px-5 pb-20 sm:px-10"
        style={{ paddingTop: 'calc(var(--nav-h) + clamp(22px, 6vh, 72px))' }}
      >
        <p className="eyebrow rise flex items-center gap-3">
          <Sparkle size={11} /> {a.eyebrow}
        </p>

        {/* ── the ID card ─────────────────────────────────────────────────── */}
        <div className="id-card rise mt-6 grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-10 lg:p-9" style={{ '--i': 1 }}>
          <div className="relative mx-auto w-full max-w-[300px] lg:mx-0">
            <div className="id-photo">
              {portrait && <Picture item={portrait} alt={a.name} eager sizes="300px" className="block h-full w-full object-cover" />}
            </div>
            <div className="id-badge absolute left-3 top-3 flex flex-col px-3 py-2">
              <span className="label text-[8px] text-ink/85">{a.id.experience.label}:</span>
              <span className="display mt-0.5 text-[22px] leading-none text-ink">
                {a.id.experience.value}
                <span className="label ml-1.5 text-[9px] text-mute">{a.id.experience.unit}</span>
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <p className="label text-[10px] text-cosmic">Name:</p>
            <h1 className="display chrome-text mt-2 text-[clamp(24px,3.8vw,46px)]">{a.name}</h1>
            <dl className="id-specs mt-6 grid gap-y-2.5">
              {a.id.specs.map((s) => (
                <div key={s.label} className="flex flex-wrap gap-x-2 text-[13px] sm:text-[14px]">
                  <dt className="label text-[10px] leading-[1.9] text-mute">{s.label}:</dt>
                  <dd className="text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-5 lg:pt-6">
              <p className="label text-[10px] text-cosmic">
                {a.id.number.label}: <span className="ml-1 text-[12px] text-ink">{a.id.number.value}</span>
              </p>
              <p className="label flex items-center gap-2 text-[10px] text-mute">
                {a.id.valid.label}:
                <span className="inline-block bg-ink px-2 py-0.5 text-[13px] leading-none text-void">{a.id.valid.value}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── about · softwares · contacts ─────────────────────────────────── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="id-card rise p-6 sm:p-8" style={{ '--i': 2 }}>
            <h2 className="display flex items-center gap-3 text-[14px] tracking-[0.14em] text-cosmic sm:text-[15px]">
              {a.bioTitle} <Sparkle size={12} className="text-ink" />
            </h2>
            <div className="mt-5 space-y-4 text-[clamp(14px,1.05vw,16px)] leading-[1.75] text-mute">
              {a.bio.map((p, i) => (
                <p key={i} className={i === 0 ? 'text-ink/90' : ''}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="id-card rise p-6 sm:p-8" style={{ '--i': 3 }}>
              <h2 className="display text-[14px] tracking-[0.14em] text-cosmic sm:text-[15px]">{a.softwareTitle}:</h2>
              <ul className="mt-5 flex flex-wrap gap-4">
                {a.software.map((s) => {
                  const icon = aboutMedia(s.icon)
                  return (
                    <li key={s.name} className="flex flex-col items-center gap-2">
                      {icon && <Picture item={icon} alt="" sizes="72px" className="h-[64px] w-[64px] object-contain sm:h-[72px] sm:w-[72px]" />}
                      <span className="text-[11px] tracking-wide text-mute">{s.name}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="id-card rise p-6 sm:p-8" style={{ '--i': 4 }}>
              <h2 className="display text-[14px] tracking-[0.14em] text-cosmic sm:text-[15px]">{a.contactsTitle}:</h2>
              <ul className="mt-4 space-y-2.5 text-[13px] sm:text-[14px]">
                <li>
                  <a href={`mailto:${c.email}`} className="break-all text-ink transition-colors hover:text-cosmic">
                    {c.email}
                  </a>
                </li>
                {c.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-mute transition-colors hover:text-ink">
                      {l.label} <Arrow dir="out" size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── services ─────────────────────────────────────────────────────── */}
        <div className="id-card rise mt-6 p-6 sm:p-8" style={{ '--i': 5 }}>
          <h2 className="display text-[14px] tracking-[0.14em] text-cosmic sm:text-[15px]">{a.servicesTitle}:</h2>
          <ul className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {a.services.map((s, i) => (
              <li key={s} className="flex items-baseline gap-4 border-b border-line py-3 text-[14px] text-ink">
                <span className="label w-5 flex-none text-[10px] text-faint">0{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* ── logo breakdown ───────────────────────────────────────────────── */}
        <div className="rise mt-16" style={{ '--i': 6 }}>
          <div className="flex items-center gap-5">
            <h2 className="eyebrow whitespace-nowrap">{a.markTitle}</h2>
            <div className="hairline flex-1" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            {video && (
              <div className="id-card overflow-hidden p-2">
                <video
                  src={video.src}
                  poster={video.poster}
                  width={video.w}
                  height={video.h}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  aria-label="The Kozmik Kreations logo, animated"
                  className="block aspect-square w-full object-cover"
                />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {a.mark.map((m) => {
                const img = aboutMedia(m.image)
                const photo = m.photo ? aboutMedia(m.photo) : null
                return (
                  <div key={m.title} className="id-card relative flex flex-col p-5 sm:p-6">
                    <div className="relative mx-auto flex h-[110px] w-full items-center justify-center">
                      {img && <Picture item={img} alt="" sizes="150px" className="h-full w-auto max-w-[150px] object-contain" />}
                      {photo && (
                        <Picture
                          item={photo}
                          alt="The Kosmaj Monument"
                          sizes="90px"
                          className="absolute -right-1 -top-3 w-[82px] rotate-[8deg] object-contain drop-shadow-[0_10px_18px_rgb(0_0_0/0.6)]"
                        />
                      )}
                    </div>
                    <h3 className="display mt-4 text-center text-[13px] tracking-[0.14em] text-cosmic">{m.title}</h3>
                    <p className="mt-2.5 text-center text-[13px] leading-[1.65] text-mute">{m.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="rise mt-14 flex flex-wrap gap-3" style={{ '--i': 7 }}>
          <a href={links.universe} className="btn btn-chrome">
            <span>Explore Projects</span>
            <Arrow size={15} />
          </a>
          <a href={links.contact} className="btn">
            <span>Let’s work</span>
          </a>
        </div>
      </div>
    </section>
  )
}
