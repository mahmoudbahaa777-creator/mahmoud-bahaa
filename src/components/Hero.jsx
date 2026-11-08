import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { hero, contact } from '../content'
import { scrollToId } from '../hooks'
import { SplitText } from './ui/Reveal'
import TypingBoard from './TypingBoard'
import Icon from './ui/Icon'
import { onBook } from './Booking'

const ease = [0.22, 1, 0.36, 1]

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0])

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
      {/* Static backdrop: soft teal glow + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-1/4 h-[560px] w-[560px] rounded-full bg-teal-500/15 blur-[140px]" />
        <div className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-teal-700/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--hairline)_1px,transparent_1px),linear-gradient(90deg,var(--hairline)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_60%_45%,#000_10%,transparent_70%)]" />
      </div>

      <motion.div style={{ y, opacity: fade }}
        className="wrap relative z-10 grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <motion.p className="eyebrow mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
            {hero.eyebrow}
          </motion.p>
          <SplitText as="h1" text={hero.headline} delay={0.15} stagger={0.09}
            className="font-serif text-display font-semibold text-ink" />
          <motion.p className="mt-6 max-w-xl text-lg leading-8 text-muted md:text-xl"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.7, ease }}>
            {hero.subline}
          </motion.p>
          <motion.div className="mt-10 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.9, ease }}>
            <a href={contact.callHref} onClick={onBook} className="btn-primary">{hero.primaryCta} <Icon name="arrow" size={18} /></a>
            <button onClick={() => scrollToId('services')} className="btn-ghost">{hero.secondaryCta}</button>
          </motion.div>
        </div>
        <TypingBoard />
      </motion.div>
    </section>
  )
}
