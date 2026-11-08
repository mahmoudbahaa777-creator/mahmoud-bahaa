import { motion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { method } from '../content'
import { SectionHead } from './ui/Reveal'

/** Five stages joined by a line that draws itself as you scroll. */
export default function Method() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const draw = useSpring(scrollYProgress, { stiffness: 80, damping: 24 })
  return (
    <section id="method" className="section overflow-x-clip">
      <div className="wrap">
        <SectionHead eyebrow={method.eyebrow} headline={method.headline} />
        <div ref={ref} className="relative mt-16 pl-10 md:pl-0">
          <div className="absolute bottom-0 left-[15px] top-0 w-px bg-hairline md:left-1/2" />
          <motion.div style={{ scaleY: draw, originY: 0 }} className="absolute bottom-0 left-[15px] top-0 w-px bg-teal-500 md:left-1/2" />
          <ol className="space-y-12 md:space-y-20">
            {method.stages.map(([k, v], i) => {
              const right = i % 2 === 1
              return (
                <motion.li key={k} initial={{ opacity: 0, x: right ? 40 : -40 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative md:grid md:grid-cols-2 md:gap-16 ${right ? '' : ''}`}>
                  <span className="absolute -left-10 top-1 grid h-8 w-8 place-items-center rounded-full border border-teal-500 bg-ground font-serif text-sm text-teal-700 md:left-1/2 md:-translate-x-1/2">
                    {i + 1}
                  </span>
                  <div className={right ? 'md:col-start-2' : 'md:text-right'}>
                    <h3 className="font-serif text-[2rem] font-semibold leading-tight text-ink md:text-5xl">{k}</h3>
                    <p className="mt-2 text-lg text-muted">{v.charAt(0).toUpperCase() + v.slice(1)}</p>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
