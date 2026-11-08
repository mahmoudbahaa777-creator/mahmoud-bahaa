import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { performance as p } from '../content'
import { SectionHead } from './ui/Reveal'
import Icon from './ui/Icon'
import { useIsMobile } from '../hooks'

const ease = [0.22, 1, 0.36, 1]
const pad = (i) => String(i + 1).padStart(2, '0')

function Channels({ className = '' }) {
  return (
    <p className={`flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm leading-7 text-muted lg:justify-start ${className}`}>
      {p.channels.map((c, i) => (
        <span key={c} className="whitespace-nowrap">{c}{i < p.channels.length - 1 && <span className="ml-2 text-teal-500">·</span>}</span>
      ))}
    </p>
  )
}

/* Funnel graphic (6 stages narrowing to Revenue) + two collapsible playbooks. Stacks on phones. */
function Funnel() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(-1)
  const books = [
    [p.tracking.title, p.tracking.items.map(([k, v]) => [k, v])],
    [p.scaling.title, p.scaling.items.map((v) => [null, v])],
  ]
  return (
    <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <p className="eyebrow mb-6 text-center !text-muted lg:text-left">{p.stagesLabel}</p>
        <ol className="space-y-2">
          {p.stages.map((s, i) => {
            const last = i === p.stages.length - 1
            // gentler taper on phones so long labels still fit
            const w = 100 - i * (isMobile ? 8 : 11)
            return (
              <li key={s} className="flex justify-center">
                <motion.div initial={{ width: '30%', opacity: 0 }} whileInView={{ width: `${w}%`, opacity: 1 }} viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.9, delay: i * 0.1, ease }}
                  className={`flex h-12 items-center justify-between gap-2 rounded-card px-4 md:h-14 md:px-5 ${last ? 'bg-coral-500 text-[#10221F]' : 'border border-teal-500/40 text-ink'}`}
                  style={last ? undefined : { background: `color-mix(in srgb, var(--teal-500) ${8 + i * 5}%, transparent)` }}>
                  <span className="font-serif text-sm opacity-70">{pad(i)}</span>
                  <span className="truncate font-serif text-base font-semibold sm:text-lg md:text-xl">{s}</span>
                  <span className="w-4 shrink-0 md:w-5" />
                </motion.div>
              </li>
            )
          })}
        </ol>
        <Channels className="mt-6 text-center" />
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
      <div className="wrap">
        <SectionHead eyebrow={p.eyebrow} headline={p.headline} line={p.line} />
        <Funnel />
      </div>
    </section>
  )
}
