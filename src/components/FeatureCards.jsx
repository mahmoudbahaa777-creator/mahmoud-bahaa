import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { services } from '../content'
import { useIsMobile, useReducedMotion } from '../hooks'
import { SectionHead } from './ui/Reveal'
import Icon from './ui/Icon'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

// One running list across both groups: Brand ads run by day, Performance ads after dusk.
const items = services.groups.flatMap((g, gi) => g.items.map((it) => ({ ...it, group: g.label, night: gi > 0 })))
const groupStart = services.groups.map((_, gi) => services.groups.slice(0, gi).reduce((t, g) => t + g.items.length, 0))

const FLIP_MS = 700
const STAGGER_MS = 38
const AUTOPLAY_MS = 3600

/**
 * One billboard ad, sized in container units (cqw) of the board, so it scales with
 * the board and renders correctly in the pre-built HTML. `w` (px) is only set when
 * the face is drawn inside a slat and must keep the full board width.
 */
function AdFace({ it, w }) {
  const dark = it.night
  const small = { fontSize: 'max(10px, 1.9cqw)' }
  return (
    <div className={`absolute inset-y-0 left-0 flex flex-col justify-between ${dark ? 'bg-deep text-ondeep' : 'bg-[#F7F4EE] text-[#10221F]'}`}
      style={{ width: w || '100%', padding: '4.5cqw 5.5cqw' }}>
      <div className="flex items-center justify-between">
        <span className={`rounded-tag border font-sans font-semibold ${dark ? 'border-ondeep/30 text-ondeep-muted' : 'border-[#0F5E5C]/30 text-[#0F5E5C]'}`}
          style={{ fontSize: 'max(10px, 1.6cqw)', padding: '0.4cqw 1cqw' }}>{it.group}</span>
        <span className={`block [&>svg]:h-full [&>svg]:w-full ${dark ? 'text-[#3FB5AC]' : 'text-[#0F5E5C]'}`} style={{ width: 'max(18px, 4.5cqw)', height: 'max(18px, 4.5cqw)' }}>
          <Icon name={it.icon} size={24} />
        </span>
      </div>
      <div>
        <p className={`font-serif font-semibold leading-[1.02] ${dark ? 'text-ondeep' : 'text-[#0F5E5C]'}`} style={{ fontSize: '8.5cqw' }}>{it.title}</p>
        <p className={`mt-[0.6em] max-w-[34ch] font-sans leading-snug ${dark ? 'text-ondeep-muted' : 'text-[#4C5F5C]'}`} style={{ fontSize: 'max(12px, 2.8cqw)' }}>{it.line}</p>
      </div>
      <div className="flex items-end justify-between">
        <span className={`font-serif italic ${dark ? 'text-ondeep-muted' : 'text-[#4C5F5C]'}`} style={small}>From reach to revenue.</span>
        <span className={`font-sans font-semibold ${dark ? 'text-ondeep' : 'text-[#10221F]'}`} style={small}>mahmoudbahaa.com</span>
      </div>
    </div>
  )
}

/**
 * Rotating billboard: the board is cut into vertical slats that turn one after another,
 * like a tri-vision sign. Each slat is a two-sided card; the hidden side is loaded with the
 * next ad, then every slat flips with a small stagger.
 */
function Billboard({ index, slats, reduced }) {
  const ref = useRef(null)
  const [w, setW] = useState(0)
  // faces[0] is on the front of every slat, faces[1] on the back; `turned` says which shows.
  const [faces, setFaces] = useState([index, index])
  const [turned, setTurned] = useState(false)

  useIsoLayoutEffect(() => {
    const el = ref.current
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const showing = faces[turned ? 1 : 0]
    if (index === showing) return
    if (reduced) { setFaces([index, index]); return }
    // put the next ad on the side facing away and turn in the same render;
    // the hidden side can change freely because no one can see it
    setFaces((f) => (turned ? [index, f[1]] : [f[0], index]))
    setTurned((x) => !x)
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  const sw = w / slats
  const night = items[faces[turned ? 1 : 0]].night
  const steel = `transition-colors duration-700 ${night ? 'bg-[#33524D]' : 'bg-[#10221F]'}`
  return (
    <div className="relative mx-auto w-full max-w-5xl md:max-w-[min(64rem,calc((100svh-20rem)*16/7))]">
      {/* lamp bar */}
      <div aria-hidden className="mx-[6%] flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="flex flex-col items-center">
            <span className={`h-2 w-7 rounded-t-full transition-colors duration-700 md:h-2.5 md:w-10 ${night ? 'bg-[#EAF2F0]' : 'bg-[#10221F]'}`} />
            <span className={`h-2 w-[2px] ${steel}`} />
          </span>
        ))}
      </div>
      {/* frame */}
      <div className={`rounded-[6px] p-[6px] md:p-[10px] ${steel}`}>
        <div ref={ref} className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-[#10221F] [container-type:inline-size] sm:aspect-[16/8] md:aspect-[16/7]" style={{ perspective: 1400 }}>
          {w === 0 ? (
            <AdFace it={items[index]} />
          ) : (
            Array.from({ length: slats }).map((_, i) => (
              <div key={i} className="absolute inset-y-0" style={{ left: i * sw, width: sw + 0.5 }}>
                <div className="relative h-full w-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${turned ? 180 : 0}deg)`,
                    transition: reduced ? 'none' : `transform ${FLIP_MS}ms cubic-bezier(.65,0,.35,1) ${i * STAGGER_MS}ms`,
                  }}>
                  {[0, 1].map((side) => (
                    <div key={side} className="absolute inset-0 overflow-hidden"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: side ? 'rotateY(180deg)' : undefined }}>
                      <div className="absolute inset-y-0" style={{ left: -i * sw, width: w }}>
                        <AdFace it={items[faces[side]]} w={w} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          {/* slat seams */}
          {w > 0 && (
            <div aria-hidden className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent 0 ${sw - 1}px, rgba(16,34,31,.18) ${sw - 1}px ${sw}px)` }} />
          )}
        </div>
      </div>
      {/* posts */}
      <div aria-hidden className="flex justify-center gap-[28%]">
        <span className={`h-12 w-3 md:h-20 md:w-4 ${steel}`} />
        <span className={`h-12 w-3 md:h-20 md:w-4 ${steel}`} />
      </div>
    </div>
  )
}

/**
 * The billboard's control plate, hung between the posts like a site sign:
 * what's up now, what's next, arrows, and the eight slots in their two groups.
 * It tells visitors at a glance that the board has more to show, and lets them pick.
 */
function Plate({ index, onPick, night }) {
  const it = items[index]
  const next = items[(index + 1) % items.length]
  const go = (d) => onPick((index + d + items.length) % items.length)
  const arrow = 'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#F7F4EE]/25 text-[#F7F4EE] transition-colors hover:border-[#3FB5AC] hover:text-[#3FB5AC] md:h-11 md:w-11'
  return (
    <div className="relative z-10 mx-auto -mt-6 w-full max-w-[34rem] md:-mt-10">
      <div className={`rounded-panel p-3 text-[#F7F4EE] transition-colors duration-700 md:p-4 ${night ? 'bg-[#1d3532]' : 'bg-[#10221F]'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => go(-1)} aria-label="Previous ad" className={arrow}><Icon name="arrow" size={18} className="rotate-180" /></button>
          <div className="min-w-0 flex-1 text-center" aria-live="polite">
            <p className="truncate font-serif text-lg font-semibold leading-tight md:text-xl">{it.title}</p>
            <p className="mt-0.5 truncate text-xs text-[#9FC9C4]">
              <span className="tabular-nums">{index + 1} of {items.length}</span> · Next: {next.title}
            </p>
          </div>
          <button onClick={() => go(1)} aria-label="Next ad" className={arrow}><Icon name="arrow" size={18} /></button>
        </div>
        {/* the eight slots: Brand (day) then Performance (dusk) */}
        <div className="mt-3 flex gap-3">
          {services.groups.map((g, gi) => (
            <div key={g.label} className="flex-1">
              <div className="flex gap-1">
                {g.items.map((x, i) => {
                  const idx = groupStart[gi] + i
                  return (
                    <button key={x.title} onClick={() => onPick(idx)} aria-label={`Show ${x.title}`} aria-current={idx === index}
                      className="group flex h-6 flex-1 items-center">
                      <span className={`h-1.5 w-full rounded-full transition-colors duration-300 ${idx === index ? 'bg-[#3FB5AC]' : idx < index ? 'bg-[#F7F4EE]/55' : 'bg-[#F7F4EE]/20 group-hover:bg-[#F7F4EE]/45'}`} />
                    </button>
                  )
                })}
              </div>
              <p className={`text-[11px] font-semibold ${it.group === g.label ? 'text-[#F7F4EE]' : 'text-[#9FC9C4]/70'}`}>{g.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FeatureCards() {
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()
  const stage = useRef(null)
  const box = useRef(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // read inside the scroll listener, which is subscribed once
  const mobileRef = useRef(isMobile)
  mobileRef.current = isMobile

  // Desktop: the scroll through the section drives the board.
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (mobileRef.current || window.innerWidth < 768) return
    setIndex(Math.min(items.length - 1, Math.max(0, Math.floor(v * items.length))))
  })

  // Phone: the board plays on its own while on screen; a tap moves it on.
  useEffect(() => {
    if (!isMobile || reduced || paused) return
    const t = setInterval(() => {
      // only advance while the board is actually on screen and the tab is visible
      const r = box.current?.getBoundingClientRect()
      if (!r || document.hidden || r.bottom < 0 || r.top > window.innerHeight) return
      setIndex((i) => (i + 1) % items.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [isMobile, reduced, paused])

  const pick = (i) => {
    if (isMobile) { setIndex(i); setPaused(true); return }
    // desktop: scroll to the part of the section that shows that ad
    const el = stage.current
    const top = el.getBoundingClientRect().top + window.scrollY
    const y = top + ((i + 0.5) / items.length) * (el.offsetHeight - window.innerHeight)
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 0.9 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const night = items[index].night
  return (
    <section id="services" className="relative">
      <div className="wrap section-top pb-[var(--space-head)]">
        <SectionHead headline={services.headline} />
      </div>

      {/* Desktop: a tall stage with the scene pinned; phone: a normal block */}
      <div ref={stage} className="relative md:h-[240vh]">
        <div ref={box} className="md:sticky md:top-0 md:flex md:h-[100svh] md:items-center md:pt-16">
          <div className={`relative w-full overflow-hidden py-[var(--space-head)] transition-colors duration-700 ${night ? 'bg-[#0E1817]' : 'bg-teal-100'}`}>
            {/* horizon */}
            <div aria-hidden className={`absolute inset-x-0 bottom-0 h-16 transition-colors duration-700 md:h-24 ${night ? 'bg-[#152321]' : 'bg-[#E4DFD4]'}`} />
            <div data-reveal className="wrap relative" aria-hidden
              onClick={() => isMobile && (setIndex((i) => (i + 1) % items.length), setPaused(true))}>
              <Billboard index={index} slats={isMobile ? 9 : 16} reduced={reduced} />
            </div>
            <div data-reveal className="wrap relative" style={{ '--reveal-i': 2 }}>
              <Plate index={index} onPick={pick} night={night} />
            </div>
          </div>
        </div>
      </div>

      {/* The board shows one service at a time; this is the full list for screen readers. */}
      <div className="sr-only">
        {services.groups.map((g) => (
          <div key={g.label}>
            <h3>{g.label}: {g.line}</h3>
            <ul>{g.items.map((it) => <li key={it.title}>{it.title}: {it.line}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  )
}
