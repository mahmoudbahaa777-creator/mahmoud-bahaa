import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { method, performance as p } from '../content'
import { SectionHead } from './ui/Reveal'
import Icon from './ui/Icon'
import { useIsMobile } from '../hooks'

const ease = [0.22, 1, 0.36, 1]
const pad = (i) => String(i + 1).padStart(2, '0')

/* Funnel graphic (6 stages narrowing to Revenue) + two collapsible playbooks. Stacks on phones. */
function Funnel() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(-1)
  const books = [
    [p.tracking.title, p.tracking.items.map(([k, v]) => [k, v])],
    [p.scaling.title, p.scaling.items.map((v) => [null, v])],
  ]
  return (
    <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
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
      <div className="border-t border-hairline lg:self-center">
        {books.map(([title, items], bi) => (
          <div key={title} className="border-b border-hairline">
            <button onClick={() => setOpen(open === bi ? -1 : bi)} aria-expanded={open === bi}
              className="flex w-full items-center justify-between gap-4 py-6 text-left">
              <span className="font-serif text-xl font-semibold text-ink md:text-2xl">{title}</span>
              <motion.span animate={{ rotate: open === bi ? 45 : 0 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline text-teal-700">
                <Icon name="plus" size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === bi && (
                <motion.ol initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease }} className="overflow-hidden">
                  {items.map(([k, v], i) => (
                    <li key={v} className="flex gap-4 pb-4">
                      <span className="font-serif text-teal-500">{pad(i)}</span>
                      <p className="text-muted">{k && <span className="font-semibold text-ink">{k}: </span>}{v}</p>
                    </li>
                  ))}
                  <li className="h-2" />
                </motion.ol>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Performance() {
  return (
    <section id="performance" className="section">
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
