import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { services } from '../content'
import { useIsMobile } from '../hooks'
import { SectionHead } from './ui/Reveal'
import Icon from './ui/Icon'

const ease = [0.22, 1, 0.36, 1]
const pad = (i) => String(i + 1).padStart(2, '0')

/*
 * Scroll spotlight: a sticky feature panel and a list that lights up as you scroll.
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

  const s = services.items[active]
  const total = pad(services.items.length - 1)
  return (
    // Phone: plain block flow so the panel can stay pinned across the whole list.
    <div className="mt-12 md:mt-16 md:grid md:grid-cols-2 md:gap-16">
      <div className="contents md:relative md:block">
        <div className="sticky top-[4.5rem] z-10 md:top-28">
          <div className="glass glow-border relative overflow-hidden rounded-panel p-5 [background:color-mix(in_srgb,var(--surface-200)_92%,transparent)] md:p-10 md:[background:color-mix(in_srgb,var(--surface-200)_62%,transparent)]">
            <div aria-hidden className="glow absolute -right-24 -top-24 h-72 w-72 [--c:color-mix(in_srgb,var(--teal-500)_20%,transparent)] md:h-96 md:w-96" />
            {/* keyed remount = fresh fade-in per service; no exit wait, so fast scrolling never sticks */}
              <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }} className="relative min-h-[8.5rem] md:min-h-0">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-card border border-hairline bg-teal-100 text-teal-700 md:h-16 md:w-16 md:rounded-panel">
                    <Icon name={s.icon} size={isMobile ? 22 : 30} />
                  </span>
                  <span className="font-serif text-base tabular-nums text-muted md:text-lg">{pad(active)} / {total}</span>
                </div>
                <h3 className="mt-4 font-serif text-[1.75rem] font-semibold leading-tight text-ink md:mt-10 md:text-5xl md:leading-[1.05]">{s.title}</h3>
                <p className="mt-2 text-base leading-6 text-muted md:mt-5 md:text-xl md:leading-8">{s.line}</p>
              </motion.div>
            <div className="relative mt-4 flex gap-1.5 md:mt-10">
              {services.items.map((_, i) => (
                <span key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i <= active ? 'bg-teal-500' : 'bg-hairline'}`} />
              ))}
            </div>
          </div>
          {/* soft fade so the list slides under the pinned panel on phones */}
          <div aria-hidden className="pointer-events-none h-10 bg-gradient-to-b from-ground to-transparent md:hidden" />
        </div>
      </div>
      <ol className="pb-[34vh] pt-[6vh] md:py-[18vh]">
        {services.items.map((it, i) => (
          <li key={it.title} ref={(el) => (refs.current[i] = el)} data-i={i}
            className={`flex min-h-[19vh] items-center gap-4 transition-opacity duration-500 md:min-h-[22vh] md:gap-6 ${i === active ? 'opacity-100' : 'opacity-30'}`}>
            <span className="font-serif text-lg text-teal-500 md:text-xl">{pad(i)}</span>
            <span className={`font-serif text-[1.75rem] font-semibold leading-tight text-ink transition-transform duration-500 md:text-4xl ${i === active ? 'translate-x-2' : ''}`}>{it.title}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function FeatureCards() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [120, -120])
  const y2 = useTransform(scrollYProgress, [0, 1], [-80, 160])
  return (
    <section id="services" ref={ref} className="section overflow-x-clip">
      <motion.div aria-hidden style={{ y: y1 }} className="glow pointer-events-none absolute -left-64 top-0 h-[700px] w-[700px] [--c:color-mix(in_srgb,var(--teal-500)_20%,transparent)]" />
      <motion.div aria-hidden style={{ y: y2 }} className="glow pointer-events-none absolute -right-56 -bottom-10 h-[600px] w-[600px] [--c:color-mix(in_srgb,var(--teal-700)_25%,transparent)]" />
      <div className="wrap relative">
        <SectionHead eyebrow={services.eyebrow} headline={services.headline} />
        <Spotlight />
      </div>
    </section>
  )
}
