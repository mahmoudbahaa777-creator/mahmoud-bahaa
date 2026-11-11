import { contact, reviews as r } from '../content'
import { SectionHead } from './ui/Reveal'
import Icon from './ui/Icon'

const initials = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('')

function Card({ it, className = '' }) {
  return (
    <figure className={`flex shrink-0 flex-col justify-between rounded-panel border border-hairline bg-card p-6 transition-colors duration-300 hover:border-teal-500/60 md:p-7 ${className}`}>
      <blockquote className="font-serif text-xl font-semibold leading-snug text-ink md:text-2xl">“{it.pull}”</blockquote>
      <figcaption className="mt-6 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-100 font-serif text-sm font-semibold text-teal-700">
          {initials(it.name)}
        </span>
        <div className="min-w-0">
          <p className="font-serif text-base font-semibold text-ink">{it.name}</p>
          <p className="text-xs leading-5 text-muted">{it.role}</p>
          {/* how they know Mahmoud: the strongest credibility signal in the recommendation */}
          <p className="mt-1 text-xs font-semibold leading-5 text-teal-700">{it.relation} · {it.date}</p>
        </div>
      </figcaption>
    </figure>
  )
}

/**
 * Recommendations.
 * Two rows drifting in opposite directions, on every screen size; hover pauses a row.
 */
export default function Reviews() {
  const half = Math.ceil(r.items.length / 2)
  const rows = [r.items.slice(0, half), r.items.slice(half)]
  return (
    <section id="reviews" className="section overflow-x-clip">
      <div className="wrap">
        <SectionHead headline={r.headline} />
      </div>

      <div aria-hidden className="after-head space-y-4 md:space-y-5 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        {rows.map((row, ri) => (
          <div key={ri} data-reveal={ri ? 'left' : 'right'} className="overflow-hidden" style={{ '--reveal-i': ri }}>
            <div className={`flex w-max gap-4 md:gap-5 ${ri ? 'marquee-reverse' : 'marquee'}`} style={{ animationDuration: '60s' }}>
              {[...row, ...row, ...row, ...row].map((it, i) => <Card key={i} it={it} className="w-[18.5rem] sm:w-[22rem] md:w-[26rem]" />)}
            </div>
          </div>
        ))}
      </div>

      <ul className="sr-only">
        {r.items.map((it) => <li key={it.name}>“{it.text}” — {it.name}, {it.role}. {it.relation}, {it.date}.</li>)}
      </ul>

      <div className="wrap">
        <p className="mt-[var(--space-tight)] flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="text-teal-700"><Icon name="linkedin" size={16} /></span>
          {r.note}
          <a href={contact.linkedin} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 underline-offset-4 hover:underline">See them on LinkedIn</a>
        </p>
      </div>
    </section>
  )
}
