import { motion } from 'framer-motion'
import { method, performance as p } from '../content'
import { SectionHead } from './ui/Reveal'
import { useIsMobile } from '../hooks'

const ease = [0.22, 1, 0.36, 1]
const pad = (i) => String(i + 1).padStart(2, '0')

/* Funnel graphic: 6 stages narrowing to Revenue, with the Reach → Revenue method stages beside them. */
function Funnel() {
  const isMobile = useIsMobile()
  return (
    <div data-reveal="left" className="after-head grid grid-cols-[minmax(0,1fr)] gap-10 lg:max-w-[60rem]">
      <div>
        {/* Foundation of the method: everything in the funnel sits on positioning */}
        <div className="mb-5 rounded-card border border-dashed border-teal-500/50 px-4 py-3 md:px-5">
          <p className="text-sm text-muted"><span className="font-serif text-base font-semibold text-teal-700">{method.foundation[0]}</span> · {method.foundation[1]}</p>
        </div>
        <ol className="space-y-5 md:space-y-3">
          {method.map.map((g) => (
            <li key={g.stage} className="md:grid md:grid-cols-[9.5rem_minmax(0,1fr)] md:items-center md:gap-6">
              {/* method stage that drives these funnel stages */}
              <div className="mb-2 md:mb-0 md:text-right">
                <p className="font-serif text-lg font-semibold leading-tight text-teal-700">{g.stage}</p>
                <p className="text-sm leading-5 text-muted">{g.note.charAt(0).toUpperCase() + g.note.slice(1)}</p>
              </div>
              <ol className="space-y-2">
                {g.rows.map((row) => {
                  const i = p.stages.indexOf(row)
                  const last = i === p.stages.length - 1
                  // gentler taper on phones so long labels still fit
                  const w = 100 - i * (isMobile ? 8 : 10)
                  return (
                    <li key={row} className="flex justify-center">
                      <motion.div initial={{ width: '30%', opacity: 0 }} whileInView={{ width: `${w}%`, opacity: 1 }} viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.9, delay: i * 0.1, ease }}
                        className={`flex h-12 items-center justify-between gap-2 rounded-card px-4 md:h-14 md:px-5 ${last ? 'bg-teal-700 text-card' : 'border border-teal-500/40 text-ink'}`}
                        style={last ? undefined : { background: `color-mix(in srgb, var(--teal-500) ${6 + i * 4}%, transparent)` }}>
                        <span className={`font-serif text-sm tabular-nums ${last ? '' : 'text-muted'}`}>{pad(i)}</span>
                        <span className="truncate font-serif text-base font-semibold sm:text-lg md:text-xl">{row}</span>
                        <span className="w-4 shrink-0 md:w-5" />
                      </motion.div>
                    </li>
                  )
                })}
              </ol>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-center text-xs text-muted md:pl-[11rem]">{p.stagesLabel}</p>
      </div>
    </div>
  )
}

export default function Performance() {
  return (
    <section id="performance" className="section theme-dark bg-deep text-ink">
      {/* old #method links land here: the method now lives on this funnel */}
      <span id="method" className="absolute top-0" aria-hidden />
      <div className="wrap">
        <SectionHead headline={p.headline} line={p.line} />
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{p.methodLine}</p>
        <Funnel />
      </div>
    </section>
  )
}
