import { experience as e } from '../content'

/**
 * Experience as a moving bar: the career totals in Fraunces numerals on the
 * deep-teal band (the brand's signature move), one figure in coral.
 * Runs opposite to the brands strip below it.
 */
export default function Experience() {
  if (!e.showStats) return null
  const items = [...e.stats, ...e.stats, ...e.stats]
  return (
    <section id="experience" aria-label={`${e.eyebrow}: ${e.stats.map((s) => `${s.value} ${s.label}`).join(', ')}`}
      className="relative overflow-hidden bg-deep py-6 md:py-7">
      <div className="relative [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]" aria-hidden>
        <div className="marquee-reverse flex w-max items-center">
          {[0, 1].map((half) => (
            <div key={half} className="flex items-center">
              <span className="eyebrow mx-10 !text-ondeep-muted">{e.eyebrow}</span>
              {items.map((s, i) => (
                <span key={i} className="flex items-center">
                  <span className="flex items-baseline gap-3 whitespace-nowrap">
                    <span className={`font-serif text-4xl font-semibold tabular-nums md:text-5xl ${s.highlight ? 'text-coral-500' : 'text-ondeep'}`}>{s.value}</span>
                    <span className="text-sm text-ondeep-muted md:text-base">{s.label}</span>
                  </span>
                  <span className="mx-8 h-1.5 w-1.5 rotate-45 bg-teal-500 md:mx-12" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
