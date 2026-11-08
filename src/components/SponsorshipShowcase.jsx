import { lazy, Suspense, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { sponsorships as s } from '../content'
import { useInView, useIsMobile, useLowPower } from '../hooks'
import { SectionHead } from './ui/Reveal'

const CarCanvas = lazy(() => import('./three/CarCanvas'))
const ease = [0.22, 1, 0.36, 1]

/* Each zone gets its own motion personality. */
const motionByTone = {
  energy: {
    card: { initial: { opacity: 0, x: -120, skewX: -10 }, animate: { opacity: 1, x: 0, skewX: 0 }, exit: { opacity: 0, x: -80, skewX: 8, transition: { duration: 0.3 } },
      transition: { type: 'spring', stiffness: 220, damping: 22, delay: 0.55 } },
    item: { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } },
  },
  luxury: {
    card: { initial: { opacity: 0, filter: 'blur(14px)', y: 12 }, animate: { opacity: 1, filter: 'blur(0px)', y: 0 }, exit: { opacity: 0, filter: 'blur(10px)', transition: { duration: 0.4 } },
      transition: { duration: 1.4, ease, delay: 0.7 } },
    item: { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 1.1, ease } } },
  },
  sport: {
    card: { initial: { opacity: 0, scale: 0.86, y: 40 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.94, y: -20, transition: { duration: 0.3 } },
      transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.5 } },
    item: { hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 18 } } },
  },
}

function ZoneCard({ zone }) {
  const m = motionByTone[zone.tone]
  const list = { show: { transition: { staggerChildren: zone.tone === 'luxury' ? 0.22 : 0.09, delayChildren: 0.8 } } }
  const [tk, tv] = zone.trust

  if (zone.tone === 'energy') {
    return (
      <motion.article key={zone.id} {...m.card} className="glass relative overflow-hidden rounded-panel p-5 md:p-9">
        <motion.div variants={list} initial="hidden" animate="show" className="relative">
          <motion.h3 variants={m.item} className="font-serif text-[2rem] font-semibold italic leading-[1.05] text-ink md:text-5xl">{zone.partner}</motion.h3>
          <motion.div variants={m.item} className="my-6 h-[3px] w-24 origin-left rounded-full bg-gradient-to-r from-teal-500 to-transparent" />
          <motion.p variants={m.item} className="text-lg font-medium leading-7 text-ink md:text-xl md:leading-8">{zone.line}</motion.p>
          <motion.p variants={m.item} className="mt-6 border-t border-hairline pt-5 text-muted">
            <span className="font-semibold text-teal-700">{tk}:</span> {tv}
          </motion.p>
        </motion.div>
      </motion.article>
    )
  }

  if (zone.tone === 'luxury') {
    return (
      <motion.article key={zone.id} {...m.card} className="glass relative rounded-panel border-hairline p-6 md:p-12">
        <motion.div variants={list} initial="hidden" animate="show">
          <motion.h3 variants={m.item} className="font-serif text-[2rem] font-normal leading-tight text-ink md:text-[3.25rem]">{zone.partner}</motion.h3>
          <motion.p variants={m.item} className="mt-6 font-serif text-xl italic leading-8 text-muted">{zone.line}</motion.p>
          <motion.div variants={m.item} className="my-8 h-px w-full bg-gradient-to-r from-hairline via-teal-500/60 to-hairline" />
          <motion.p variants={m.item} className="text-[15px] leading-7 text-muted">
            <span className="font-semibold text-ink">{tk}</span> — {tv}
          </motion.p>
        </motion.div>
      </motion.article>
    )
  }

  return (
    <motion.article key={zone.id} {...m.card} className="glass relative overflow-hidden rounded-panel p-5 md:p-9">
      <motion.div variants={list} initial="hidden" animate="show">
        <div className="mb-5 flex items-center gap-3">
          <motion.span variants={m.item} className="inline-flex items-center gap-2 rounded-full border border-teal-500/50 bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" /> Matchday
          </motion.span>
        </div>
        <motion.h3 variants={m.item} className="font-serif text-[2rem] font-semibold leading-[1.05] text-ink md:text-5xl">{zone.partner}</motion.h3>
        <motion.p variants={m.item} className="mt-4 text-xl leading-8 text-ink">{zone.line}</motion.p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
          {[['Reach', 'Mass, local'], ['Rhythm', 'Every matchday'], ['Language', 'Arabic-first'], ['Moments', 'Fan-led']].map(([k, v]) => (
            <motion.div key={k} variants={m.item} className="rounded-card border border-hairline bg-ground/60 px-3 py-2 sm:p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-muted">{k}</p>
              <p className="mt-0.5 font-serif text-base text-ink sm:mt-1 sm:text-lg">{v}</p>
            </motion.div>
          ))}
        </div>
        <motion.p variants={m.item} className="mt-6 text-muted"><span className="font-semibold text-teal-700">{tk}:</span> {tv}</motion.p>
      </motion.div>
    </motion.article>
  )
}

export default function SponsorshipShowcase() {
  const stage = useRef(null)
  const activeRef = useRef(0)
  const scrollRef = useRef(0)
  const [active, setActive] = useState(0)
  const isMobile = useIsMobile()
  const low = useLowPower()
  const inView = useInView(stage, '300px')
  // Don't even download the 3D engine until the visitor is ~2 screens away
  const near = useInView(stage, '1600px')
  const [mount, setMount] = useState(false)
  if (near && !mount) setMount(true)
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] })
  const zoneProgress = useTransform(scrollYProgress, (v) => (v >= 1 ? 1 : (v * 3) % 1))

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    scrollRef.current = v
    const i = Math.min(2, Math.max(0, Math.floor(v * 3)))
    if (i !== activeRef.current) { activeRef.current = i; setActive(i) }
  })

  const goTo = (i) => {
    const el = stage.current
    const top = el.getBoundingClientRect().top + window.scrollY
    const y = top + ((i + 0.35) / 3) * (el.offsetHeight - window.innerHeight)
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const zone = s.zones[active]
  // Cards sit opposite the car: left for zones 1 & 3, right for the GT car that parks left.
  const side = active === 1 ? 'md:ml-auto' : ''

  return (
    <section id="sponsorships" className="theme-dark relative bg-ground text-ink">
      <div className="wrap section !pb-16">
        <SectionHead headline={s.headline} line={s.line} />
      </div>

      <div ref={stage} className="relative h-[240vh] md:h-[330vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-0">
            {/* No Suspense boundary until it's needed, so it never sits in the pre-rendered HTML mid-hydration */}
            {mount && (
              <Suspense fallback={<div className="h-full w-full bg-ground" />}>
                <CarCanvas activeRef={activeRef} scrollRef={scrollRef} running={inView} isMobile={isMobile} low={low} />
              </Suspense>
            )}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ground to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ground to-transparent" />
          </div>

          <div className="wrap relative flex h-full flex-col justify-end pb-10 pt-24 md:justify-center md:pb-0">
            {/* Zone tabs */}
            <div role="tablist" aria-label="Sponsorship zones" className="absolute left-4 right-4 top-20 flex gap-2 sm:left-8 lg:left-16 md:top-24">
              {s.zones.map((z, i) => (
                <button key={z.id} role="tab" aria-selected={active === i} onClick={() => goTo(i)}
                  className={`relative overflow-hidden rounded-full border px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:text-sm ${active === i ? 'border-teal-500 text-ink' : 'border-hairline text-muted hover:text-ink'}`}>
                  {active === i && <motion.span layoutId="zone-pill" className="absolute inset-0 -z-10 bg-teal-100" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                  <span className="md:hidden">{z.short}</span>
                  <span className="hidden md:inline">{z.partner}</span>
                </button>
              ))}
            </div>

            <div className={`w-full max-w-[34rem] ${side} transition-[margin] duration-700`}>
              <AnimatePresence mode="wait">
                <ZoneCard key={zone.id} zone={zone} />
              </AnimatePresence>
            </div>

            {/* Progress within the showcase */}
            <div className="absolute bottom-6 left-4 right-4 flex items-center gap-3 sm:left-8 lg:left-16 md:bottom-10">
              {s.zones.map((z, i) => (
                <div key={z.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-hairline">
                  <motion.div className="h-full origin-left bg-teal-500"
                    style={{ scaleX: i < active ? 1 : i === active ? zoneProgress : 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The showcase shows one partner at a time; screen readers get all three. */}
      <ul className="sr-only">
        {s.zones.map((z) => <li key={z.id}>{z.partner} ({z.category}): {z.line} {z.trust[0]}: {z.trust[1]}</li>)}
      </ul>
    </section>
  )
}
