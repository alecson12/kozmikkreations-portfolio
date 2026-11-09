import { Arrow, Mark, Sparkle } from '../components/Bits.jsx'
import { SITE } from '../content/site.js'
import { links } from '../lib/router.js'

// The creator behind the universe. All wording comes from content/site.js.
export default function About({ phase }) {
  const a = SITE.about
  return (
    <section className="scene scene-scroll" data-phase={phase} aria-label="About">
      <div
        className="mx-auto w-full max-w-[1180px] px-6 pb-20 sm:px-10"
        style={{ paddingTop: 'calc(var(--nav-h) + clamp(28px, 7vh, 84px))' }}
      >
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div>
            <p className="eyebrow rise flex items-center gap-3">
              <Sparkle size={11} /> {a.eyebrow}
            </p>
            <h1 className="display chrome-text rise mt-5 text-[clamp(26px,4.6vw,56px)]" style={{ '--i': 1 }}>
              {a.name}
            </h1>
            <div className="rise mt-8 max-w-[38em] space-y-5 text-[clamp(15px,1.15vw,17px)] leading-[1.75] text-mute" style={{ '--i': 2 }}>
              {a.bio.map((p, i) => (
                <p key={i} className={i === 0 ? 'text-ink/90' : ''}>
                  {p}
                </p>
              ))}
            </div>
            <dl className="rise mt-10 grid max-w-[38em] grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8" style={{ '--i': 3 }}>
              {a.facts.map((f) => (
                <div key={f.label}>
                  <dt className="label text-[10px] text-faint">{f.label}</dt>
                  <dd className="mt-2 text-[15px] text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rise panel self-start p-7 backdrop-blur-[2px] sm:p-9" style={{ '--i': 3 }}>
            <h2 className="eyebrow">{a.servicesTitle}</h2>
            <ul className="mt-6">
              {a.services.map((s, i) => (
                <li key={s} className="flex items-baseline gap-4 border-b border-line py-3.5 text-[15px] text-ink first:pt-0">
                  <span className="label w-5 flex-none text-[10px] text-faint">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
            <h2 className="eyebrow mt-9">{a.softwareTitle}</h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {a.software.map((s) => (
                <li key={s} className="border border-line px-4 py-2 text-[13px] tracking-wide text-mute">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rise mt-20" style={{ '--i': 4 }}>
          <div className="flex items-center gap-5">
            <h2 className="eyebrow whitespace-nowrap">{a.markTitle}</h2>
            <div className="hairline flex-1" />
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[auto_repeat(4,minmax(0,1fr))] lg:items-start">
            <Mark className="hidden w-[108px] lg:block" />
            {a.mark.map((m) => (
              <div key={m.title}>
                <h3 className="display text-[13px] tracking-[0.14em] text-ink">{m.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-mute">{m.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rise mt-16 flex flex-wrap gap-3" style={{ '--i': 5 }}>
          <a href={links.universe} className="btn btn-chrome">
            <span>Explore the work</span>
            <Arrow size={15} />
          </a>
          <a href={links.contact} className="btn">
            <span>Contact</span>
          </a>
        </div>
      </div>
    </section>
  )
}
