import { motion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1]

/** Fades + lifts children into view once. */
export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const M = motion[as]
  return (
    <M className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease, delay }}>
      {children}
    </M>
  )
}

/** Word-by-word staggered headline reveal. */
export function SplitText({ text, className = '', delay = 0, stagger = 0.06, as = 'h2' }) {
  const M = motion[as]
  const words = text.split(' ')
  return (
    <M className={className} aria-label={text}
      initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden="true">
          <motion.span className="inline-block"
            variants={{ hidden: { y: '110%', rotate: 4 }, show: { y: '0%', rotate: 0, transition: { duration: 0.9, ease } } }}>
            {w}{i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </M>
  )
}

export function SectionHead({ eyebrow, headline, line, className = '' }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <Reveal><p className="eyebrow mb-4">{eyebrow}</p></Reveal>
      <SplitText text={headline} className="font-serif text-h1 font-semibold text-ink" />
      {line && <Reveal delay={0.2}><p className="mt-5 max-w-2xl text-lg leading-7 text-muted">{line}</p></Reveal>}
    </div>
  )
}
