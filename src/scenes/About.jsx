import { Arrow, Mark, Sparkle } from '../components/Bits.jsx'
import LogoCycler from '../components/LogoCycler.jsx'
import { Picture } from '../components/Media.jsx'
import { SITE } from '../content/site.js'
import { aboutMedia } from '../lib/projects.js'
import { links } from '../lib/router.js'

// Behind Kozmik: the creator's identity card, then the story, tools, logo and services.
// All wording comes from content/site.js; all pictures from the AboutMe folder.
export default function About({ phase }) {
  const a = SITE.about
  const c = SITE.contact.commissions
  const portrait = aboutMedia(a.portrait)
  const stages = a.markStages.map((s) => ({ label: s.label, item: aboutMedia(s.image) })).filter((s) => s.item)
  const heading = 'display text-[13px] tracking-[0.16em] text-cosmic sm:text-[14px]'

  return (
    <section className="scene scene-scroll" data-phase={phase} aria-label={SITE.nav.about}>
      <div
        className="mx-auto w-full max-w-[1180px] px-5 pb-20 sm:px-10"
        style={{ paddingTop: 'calc(var(--nav-h) + clamp(18px, 4.5vh, 56px))' }}
      >
        {/* ── the identity card ───────────────────────────────────────────── */}
        <article className="id-card id-doc rise" aria-label={`${a.id.document}: ${a.name}`}>
          <header className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3.5">
              <Mark className="w-8 flex-none sm:w-9" />
              <div className="min-w-0">
                <p className="display truncate text-[12px] tracking-[0.2em] text-ink sm:text-[13px]">{SITE.brand}</p>
                <p className="label mt-1 truncate text-[9px] text-mute">{a.id.document}</p>
              </div>
            </div>
            <p className="label flex flex-none items-baseline justify-between gap-3 text-[9px] leading-[1.9] text-mute sm:block sm:text-right">
              <span>{a.id.number.label}</span>
              <span className="text-[11px] text-ink sm:block sm:text-[12px]">{a.id.number.value}</span>
            </p>
          </header>

          <div className="grid gap-x-10 gap-y-7 p-5 sm:grid-cols-[minmax(200px,0.55fr)_minmax(0,1fr)] sm:p-8 lg:grid-cols-[330px_minmax(0,1fr)]">
            <div className="id-photo mx-auto w-full max-w-[330px] sm:mx-0">
              {portrait && <Picture item={portrait} alt={a.name} eager sizes="330px" className="block h-full w-full object-cover" />}
            </div>

            <div className="relative flex min-w-0 flex-col justify-center">
              <Mark className="id-watermark" />
              <p className="eyebrow relative flex items-center gap-2.5">
                <Sparkle size={10} /> {a.eyebrow}
              </p>
              <h1 className="display chrome-text relative mt-3 text-[clamp(22px,3.3vw,42px)]">{a.name}</h1>

              <dl className="relative mt-5 lg:mt-6">
                {a.id.specs.map((s) => (
                  <div key={s.label} className="id-row">
                    <dt className="label text-[9px] text-mute sm:text-[10px]">{s.label}</dt>
                    <dd className="text-[14px] text-ink sm:text-[15px]">{s.value}</dd>
                  </div>
                ))}
              </dl>

            </div>
          </div>

        <dl className="id-stats mx-5 mb-5 sm:mx-8 sm:mb-8">
          <div>
            <dt className="label text-[9px] text-mute">{a.id.experience.label}</dt>
            <dd className="display mt-1.5 text-[20px] leading-none text-ink sm:text-[24px]">
              {String(a.id.experience.value).padStart(2, '0')}
              <span className="label ml-2 text-[9px] text-mute">{a.id.experience.unit}</span>
            </dd>
          </div>
          <div>
            <dt className="label text-[9px] text-mute">{a.id.status.label}</dt>
            <dd className="label mt-2 flex items-center gap-2 text-[10px] leading-[1.5] text-ink">
              <span className={`h-1.5 w-1.5 flex-none rounded-full ${c.open ? 'bg-cosmic' : 'bg-faint'}`} />
              {c.open ? c.openLabel : c.closedLabel}
            </dd>
          </div>
          <div>
            <dt className="label text-[9px] text-mute">{a.id.valid.label}</dt>
            <dd className="display mt-1 text-[24px] leading-none text-ink sm:text-[28px]">{a.id.valid.value}</dd>
          </div>
        </dl>
        </article>

        {/* ── the story · the tools ───────────────────────────────────────── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="id-card rise p-6 sm:p-8" style={{ '--i': 1 }}>
            <h2 className={`${heading} flex items-center gap-3`}>
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

          <div className="id-card rise flex flex-col p-6 sm:p-8" style={{ '--i': 2 }}>
            <h2 className={heading}>{a.softwareTitle}</h2>
            <ul className="software-grid mt-5 flex-1">
              {a.software.map((s) => {
                const icon = aboutMedia(s.icon)
                return (
                  <li key={s.name}>
                    {icon && <Picture item={icon} alt="" sizes="110px" className="software-icon" />}
                    <span className="label text-[8px] tracking-[0.14em] text-mute sm:text-[10px] sm:tracking-[0.26em]">{s.name}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* ── logo breakdown ───────────────────────────────────────────────── */}
        <div className="rise mt-16" style={{ '--i': 3 }}>
          <div className="flex items-center gap-5">
            <h2 className="eyebrow whitespace-nowrap">{a.markTitle}</h2>
            <div className="hairline flex-1" />
          </div>
          {stages.length > 0 && (
            <div className="mt-7">
              <LogoCycler stages={stages} seconds={a.markSeconds} />
            </div>
          )}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {a.mark.map((m, i) => {
              const img = aboutMedia(m.image)
              const photo = m.photo ? aboutMedia(m.photo) : null
              return (
                <div key={m.title} className="id-card flex items-center gap-5 p-5 sm:gap-6 sm:p-6 md:max-lg:flex-col md:max-lg:items-start md:max-lg:gap-4">
                  <div className="relative flex h-[84px] w-[84px] flex-none items-center justify-center sm:h-[104px] sm:w-[104px]">
                    {img && <Picture item={img} alt="" sizes="104px" className="h-full w-full object-contain" />}
                    {photo && (
                      <Picture
                        item={photo}
                        alt="The Kosmaj Monument"
                        sizes="60px"
                        className="absolute -right-3 -top-3 w-[46px] rotate-[8deg] object-contain drop-shadow-[0_8px_14px_rgb(0_0_0/0.6)] sm:w-[54px]"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="display flex items-baseline gap-3 text-[12px] tracking-[0.14em] text-ink sm:text-[13px]">
                      <span className="label text-[9px] text-faint">0{i + 1}</span>
                      {m.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.65] text-mute sm:text-[14px]">{m.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── services ─────────────────────────────────────────────────────── */}
        <div className="rise mt-16" style={{ '--i': 4 }}>
          <div className="flex items-center gap-5">
            <h2 className="eyebrow whitespace-nowrap">{a.servicesTitle}</h2>
            <div className="hairline flex-1" />
          </div>
          <ul className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {a.services.map((s, i) => (
              <li key={s} className="flex items-baseline gap-4 border-b border-line py-4 text-[14px] text-ink sm:text-[15px]">
                <span className="label w-5 flex-none text-[10px] text-faint">0{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rise mt-14 flex flex-wrap gap-3" style={{ '--i': 5 }}>
          <a href={links.universe} className="btn btn-chrome">
            <span>{SITE.home.cta}</span>
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
