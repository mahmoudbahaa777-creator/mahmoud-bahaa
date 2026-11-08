import { experience as e } from '../content'

/**
 * Career totals on the deep-teal band (the brand's signature move), one figure
 * in coral. Static, so the strongest evidence on the page can be read at a glance.
 */
export default function Experience() {
  if (!e.showStats) return null
  return (
    <section id="experience" aria-label={e.eyebrow} className="bg-deep py-8 md:py-10">
      <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {e.stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 border-l border-ondeep/20 pl-4">
            <dt className="order-2 text-sm text-ondeep-muted md:text-base">{s.label}</dt>
            <dd className={`order-1 font-serif text-4xl font-semibold tabular-nums md:text-5xl ${s.highlight ? 'text-coral-500' : 'text-ondeep'}`}>{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
