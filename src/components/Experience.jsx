import { useEffect, useRef, useState } from 'react'
import { experience as e } from '../content'

// "$50M+" → { pre: '$', num: 50, post: 'M+' }
const parse = (v) => {
  const m = String(v).match(/^([^\d]*)([\d.]+)(.*)$/)
  return m ? { pre: m[1], num: parseFloat(m[2]), post: m[3], dec: (m[2].split('.')[1] || '').length } : { pre: v, num: 0, post: '', dec: 0 }
}

const DURATION = 1800

/**
 * Career totals on the deep-teal band (the brand's signature move), one figure
 * in coral. Each number counts up to its value the first time the band comes into view.
 * The pre-built HTML carries the final values, so they read correctly without JavaScript.
 */
export default function Experience() {
  const ref = useRef(null)
  const stats = e.stats.map((s) => ({ ...s, ...parse(s.value) }))
  // progress 0 → 1; null = show final values (before JS, or with reduced motion)
  const [t, setT] = useState(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    let raf
    const run = () => {
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min(1, Math.max(0, (now - start) / DURATION)) // rAF time can be a hair before `start`
        setT(1 - Math.pow(1 - p, 4)) // ease-out, fast then settling on the number
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    setT(0)
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return
      io.disconnect()
      run()
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [])

  if (!e.showStats) return null
  return (
    <section id="experience" ref={ref} aria-label={`${e.eyebrow}: ${e.stats.map((s) => `${s.value} ${s.label}`).join(', ')}`} className="bg-deep py-8 md:py-10">
      <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-5" aria-hidden>
        {stats.map((s) => {
          const shown = t === null ? s.num : s.num * t
          return (
            <div key={s.label} className="flex flex-col gap-1 border-l border-ondeep/20 pl-4">
              <dt className="order-2 text-sm text-ondeep-muted md:text-base">{s.label}</dt>
              <dd className={`order-1 font-serif text-4xl font-semibold tabular-nums md:text-5xl ${s.highlight ? 'text-coral-500' : 'text-ondeep'}`}>
                {s.pre}{shown.toFixed(s.dec)}{s.post}
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
