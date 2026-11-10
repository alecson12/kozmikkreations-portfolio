import { Arrow, Mark } from '../components/Bits.jsx'
import { SITE } from '../content/site.js'
import { links } from '../lib/router.js'

// The cosmic introduction: the mark, one line, a welcome, one way in.
export default function Home({ phase, intro }) {
  const { headline, text, cta } = SITE.home
  // On the very first load the mark condenses first and the words follow;
  // when returning from another page everything simply rises in.
  const d = intro ? '500ms' : '0ms'
  return (
    <section className="scene flex items-center justify-center" data-phase={phase} aria-label="Home">
      <div
        className="flex w-full max-w-[1100px] flex-col items-center px-6 text-center"
        style={{ paddingTop: 'var(--nav-h)', paddingBottom: 'clamp(64px, 21vh, 240px)' }}
      >
        <Mark sheen className={`w-[clamp(84px,10.5vw,148px)] [@media(max-height:480px)]:hidden ${intro ? 'mark-intro' : 'rise'}`} />
        <h1
          className="display chrome-text rise mt-[clamp(20px,4.2vh,48px)] max-w-[11.5em] text-balance text-[clamp(25px,7.6vw,38px)] md:max-w-[18.5em] md:text-[clamp(34px,3.85vw,58px)]"
          style={{ '--i': 1, '--d': d }}
        >
          {headline}
        </h1>
        <p
          className="rise mt-[clamp(14px,2.4vh,24px)] max-w-[34em] text-pretty text-[clamp(14px,1.2vw,17px)] leading-relaxed text-mute"
          style={{ '--i': 2, '--d': d }}
        >
          {text}
        </p>
        <a href={links.universe} className="btn btn-chrome rise mt-[clamp(26px,4.6vh,48px)]" style={{ '--i': 3, '--d': d }}>
          <span>{cta}</span>
          <Arrow size={15} />
        </a>
      </div>
    </section>
  )
}
