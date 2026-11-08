import { motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { navSections } from '../content'
import { scrollToId } from '../hooks'

/** Side timeline: fill shows depth, nodes jump to sections. A top bar does the job on mobile. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const [active, setActive] = useState('top')

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    navSections.forEach(({ id }) => { const el = document.getElementById(id); el && io.observe(el) })
    return () => io.disconnect()
  }, [])

  return (
    <>
      <motion.div style={{ scaleX: fill }} className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-teal-500 lg:hidden" />
      <nav aria-label="Page progress" className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <div className="relative flex flex-col items-end gap-5 py-2" style={{ perspective: 600 }}>
          <div className="absolute bottom-0 right-[5px] top-0 w-px bg-hairline" />
          <motion.div style={{ scaleY: fill, originY: 0 }} className="absolute bottom-0 right-[5px] top-0 w-px bg-teal-500" />
          {navSections.map(({ id, label }) => {
            const on = active === id
            return (
              <button key={id} onClick={() => scrollToId(id)} className="group relative flex items-center gap-3" aria-label={label} aria-current={on}>
                <span className={`text-xs transition-all duration-300 ${on ? 'translate-x-0 text-ink opacity-100' : 'translate-x-2 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>{label}</span>
                <motion.span animate={{ scale: on ? 1.3 : 1, rotateY: on ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`relative block h-[11px] w-[11px] rotate-45 rounded-[2px] border ${on ? 'border-teal-500 bg-teal-500' : 'border-hairline bg-ground group-hover:border-teal-500'}`} />
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
