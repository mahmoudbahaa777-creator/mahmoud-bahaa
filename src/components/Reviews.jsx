import { contact, reviews as r } from '../content'
import { SectionHead } from './ui/Reveal'
import Icon from './ui/Icon'

const initials = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('')

function Card({ it }) {
  return (
    <figure className="w-[18.5rem] border border-hairline bg-card shrink-0 rounded-panel p-6 transition-colors duration-300 hover:border-teal-500/60 sm:w-[22rem] md:w-[26rem] md:p-7">
      <blockquote className="font-serif text-xl font-semibold leading-snug text-ink md:text-2xl">“{it.pull}”</blockquote>
      <figcaption className="mt-6 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hairline bg-teal-100 font-serif text-sm font-semibold text-teal-700">
            {initials(it.name)}
          </span>
          <div className="min-w-0">
            <p className="font-serif text-base font-semibold text-ink">{it.name}</p>
            <p className="truncate text-xs text-muted">{it.role}</p>
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[1.5px] text-teal-700">{it.date}</span>
      </figcaption>
    </figure>
  )
}

/**
 * Recommendations as two rows of short quotes drifting in opposite directions.
 * Hover pauses a row. Full texts stay in content.js for screen readers below.
 */
export default function Reviews() {
  const half = Math.ceil(r.items.length / 2)
  const rows = [r.items.slice(0, half), r.items.slice(half)]
  return (
    <section id="reviews" className="section overflow-x-clip">
      <div className="wrap">
        <SectionHead headline={r.headline} />
      </div>

      <div aria-hidden className="mt-12 space-y-5 md:mt-14 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        {rows.map((row, ri) => (
          <div key={ri} className="overflow-hidden">
            <div className={`flex w-max gap-5 ${ri ? 'marquee-reverse' : 'marquee'}`} style={{ animationDuration: '70s' }}>
              {[...row, ...row, ...row, ...row].map((it, i) => <Card key={i} it={it} />)}
            </div>
          </div>
        ))}
      </div>

      {/* The moving rows are decorative duplicates; this list is what assistive tech reads. */}
      <ul className="sr-only">
        {r.items.map((it) => <li key={it.name}>“{it.text}” — {it.name}, {it.role}, {it.date}</li>)}
      </ul>

      <div className="wrap">
        <p className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="text-teal-700"><Icon name="linkedin" size={16} /></span>
          {r.note}
          <a href={contact.linkedin} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 underline-offset-4 hover:underline">See them on LinkedIn</a>
        </p>
      </div>
    </section>
  )
}
