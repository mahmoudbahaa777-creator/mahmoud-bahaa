import { motion } from 'framer-motion'
import { Fragment, useEffect, useRef, useState } from 'react'
import { services } from '../content'
import { useIsMobile } from '../hooks'
import { SectionHead } from './ui/Reveal'
import Icon from './ui/Icon'

const ease = [0.22, 1, 0.36, 1]
// One running index across both groups, so the spotlight walks Brand, then Performance.
const items = services.groups.flatMap((g) => g.items.map((it) => ({ ...it, group: g.label })))

/*
 * Scroll spotlight in two groups (Brand, Performance): a sticky panel and a
 * list that lights up as you scroll.
 * Desktop: panel on the left, list on the right.
 * Phone: panel pinned under the nav, list scrolling beneath it.
 */
function Spotlight() {
  const isMobile = useIsMobile()
  const [active, setActive] = useState(0)
  const refs = useRef([])
  useEffect(() => {
    // The "reading line" an item must cross to become active: screen middle on
    // desktop, just below the pinned panel on phones.
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(+e.target.dataset.i)),
      { rootMargin: isMobile ? '-58% 0px -38% 0px' : '-48% 0px -48% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [isMobile])

  const s = items[active]
  let n = -1
  return (
    // Phone: plain block flow so the panel can stay pinned across the whole list.
    <div className="mt-12 md:mt-16 md:grid md:grid-cols-2 md:gap-16">
      <div className="contents md:relative md:block" aria-hidden>
        <div className="sticky top-[4.5rem] z-10 md:top-28">
          <div className="relative overflow-hidden rounded-panel border border-hairline bg-card p-5 md:p-10">
            {/* keyed remount = fresh fade-in per service; no exit wait, so fast scrolling never sticks */}
            <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }} className="relative min-h-[8.5rem] md:min-h-0">
              <div className="flex items-center justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-card bg-teal-100 text-teal-700 md:h-16 md:w-16 md:rounded-panel">
                  <Icon name={s.icon} size={isMobile ? 22 : 30} />
                </span>
                <span className="rounded-tag border border-hairline px-2.5 py-1 text-xs font-semibold text-teal-700">{s.group}</span>
              </div>
              <h3 className="mt-4 font-serif text-[1.75rem] font-semibold leading-tight text-ink md:mt-10 md:text-5xl md:leading-[1.05]">{s.title}</h3>
              <p className="mt-2 text-base leading-6 text-muted md:mt-5 md:text-xl md:leading-8">{s.line}</p>
            </motion.div>
            {/* progress, split into the two groups */}
            <div className="relative mt-4 flex gap-3 md:mt-10">
              {services.groups.map((g, gi) => (
                <div key={g.label} className="flex flex-1 gap-1">
                  {g.items.map((_, i) => {
                    const idx = services.groups.slice(0, gi).reduce((t, x) => t + x.items.length, 0) + i
                    return <span key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${idx <= active ? 'bg-teal-500' : 'bg-hairline'}`} />
                  })}
                </div>
              ))}
            </div>
          </div>
          {/* soft fade so the list slides under the pinned panel on phones */}
          <div className="pointer-events-none h-8 bg-gradient-to-b from-ground to-transparent md:hidden" />
        </div>
      </div>

      <div className="pb-[30vh] pt-[4vh] md:py-[16vh]" aria-hidden>
        {services.groups.map((g, gi) => (
          <Fragment key={g.label}>
            <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline pb-3 ${gi ? 'mt-14 md:mt-20' : ''}`}>
              <span className="font-serif text-xl font-semibold text-teal-700 md:text-2xl">{g.label}</span>
              <span className="text-sm text-muted">{g.line}</span>
            </div>
            <ol>
              {g.items.map((it) => {
                const i = ++n
                return (
                  <li key={it.title} ref={(el) => (refs.current[i] = el)} data-i={i}
                    className={`flex min-h-[14vh] items-center transition-opacity duration-500 md:min-h-[20vh] ${i === active ? 'opacity-100' : 'opacity-50'}`}>
                    <span className={`font-serif text-[1.6rem] font-semibold leading-tight text-ink transition-transform duration-500 md:text-4xl ${i === active ? 'translate-x-2' : ''}`}>{it.title}</span>
                  </li>
                )
              })}
            </ol>
          </Fragment>
        ))}
      </div>

      {/* The spotlight shows one service at a time; this is the full list for screen readers. */}
      <div className="sr-only">
        {services.groups.map((g) => (
          <div key={g.label}>
            <h3>{g.label}: {g.line}</h3>
            <ul>{g.items.map((it) => <li key={it.title}>{it.title}: {it.line}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FeatureCards() {
  return (
    <section id="services" className="section overflow-x-clip">
      <div className="wrap relative">
        <SectionHead headline={services.headline} />
        <Spotlight />
      </div>
    </section>
  )
}
