import { Fragment, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { hero, contact } from '../content'
import { scrollToId, useIsMobile } from '../hooks'
import HeroReel from './HeroReel'
import Icon from './ui/Icon'
import { onBook } from './Booking'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  // Phones: the reel sits below the headline, so the hero must not fade or drift as you scroll to it
  const isMobile = useIsMobile()

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
      {/* Static backdrop: faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--hairline)_1px,transparent_1px),linear-gradient(90deg,var(--hairline)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_60%_45%,#000_10%,transparent_70%)]" />
      </div>

      <motion.div style={isMobile ? undefined : { y, opacity: fade }}
        className="wrap relative z-10 grid items-center gap-14 md:grid-cols-[1.05fr_1fr] md:gap-10 lg:gap-16">
        <div>
          <h1 aria-label={hero.headline} className="font-serif text-display font-semibold text-ink">
            {hero.headline.split(' ').map((w, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span className="word-in" style={{ '--d': `${0.1 + i * 0.07}s` }}>{w}</span>
                </span>
              </Fragment>
            ))}
          </h1>
          <p className="rise mt-6 max-w-xl text-lg leading-8 text-muted md:text-xl" style={{ '--d': '0.35s' }}>
            {hero.subline}
          </p>
          <div className="fade-rise mt-10 flex flex-wrap gap-3" style={{ '--d': '0.5s' }}>
            <a href={contact.callHref} onClick={onBook} className="btn-primary">{hero.primaryCta} <Icon name="arrow" size={18} /></a>
            <button onClick={() => scrollToId('services')} className="btn-ghost">{hero.secondaryCta}</button>
          </div>
        </div>
        {/* right column: the 16:10 brand reel; clicking it books a call */}
        <div className="board-in w-full"><HeroReel /></div>
      </motion.div>
    </section>
  )
}
