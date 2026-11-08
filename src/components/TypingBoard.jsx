import { useEffect, useReducer, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { heroBoard } from '../content'
import { useInView, useIsMobile, useReducedMotion } from '../hooks'
import Icon from './ui/Icon'

const ease = [0.22, 1, 0.36, 1]

/**
 * Hero "growth board": the words a strategy is built on, typed one at a time.
 * When the list is done it holds, clears and starts again. Pauses off-screen.
 */
function useTyping(words, active, reduced) {
  const st = useRef({ done: [], i: 0, n: 0, holding: false, cycle: 0 })
  const [, render] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    if (reduced) {
      st.current = { done: words.map((_, i) => i), i: words.length, n: 0, holding: true, cycle: 0 }
      render()
      return
    }
    if (!active) return
    let timer
    const loop = () => {
      const s = st.current
      let delay = 45 + Math.random() * 65 // human-ish keystrokes
      if (s.i >= words.length) {
        if (!s.holding) { s.holding = true; delay = 2800 }
        else { Object.assign(s, { done: [], i: 0, n: 0, holding: false, cycle: s.cycle + 1 }); delay = 700 }
      } else if (s.n < words[s.i].word.length) {
        s.n += 1
      } else {
        s.done = [...s.done, s.i]; s.i += 1; s.n = 0; delay = 480
      }
      render()
      timer = setTimeout(loop, delay)
    }
    timer = setTimeout(loop, 900)
    return () => clearTimeout(timer)
  }, [active, reduced, words])

  return st.current
}

export default function TypingBoard() {
  const ref = useRef(null)
  const inView = useInView(ref, '0px')
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const { words, title, footer } = heroBoard
  const s = useTyping(words, inView, reduced)
  const maxRows = isMobile ? 5 : 7

  const rows = [...s.done, ...(s.i < words.length ? [s.i] : [])].slice(-maxRows)

  // Gentle 3D tilt toward the pointer
  const px = useMotionValue(0.5), py = useMotionValue(0.5)
  const cfg = { stiffness: 120, damping: 20 }
  const rx = useSpring(useTransform(py, [0, 1], [7, -7]), cfg)
  const ry = useSpring(useTransform(px, [0, 1], [-9, 9]), cfg)

  return (
    <div ref={ref} style={{ perspective: 1200 }} className="board-in"
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); px.set((e.clientX - r.left) / r.width); py.set((e.clientY - r.top) / r.height) }}
      onPointerLeave={() => { px.set(0.5); py.set(0.5) }}>
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="glow-border relative overflow-hidden rounded-panel border border-hairline bg-card">
        {/* board grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(var(--hairline)_1px,transparent_1px),linear-gradient(90deg,var(--hairline)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(180deg,#000,transparent_95%)]" />

        <div className="relative flex items-center justify-between border-b border-hairline px-5 py-3.5 md:px-7">
          <p className="eyebrow">{title}</p>
          <span className="flex items-center gap-2 text-xs text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            Live
          </span>
        </div>

        <ol className={`relative px-5 py-4 md:px-7 md:py-5 h-[17.5rem] md:h-[25rem]`} aria-label={words.map((w) => w.word).join(', ')}>
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((idx) => {
              const w = words[idx]
              const typing = idx === s.i
              const text = typing ? w.word.slice(0, s.n) : w.word
              return (
                <motion.li key={`${s.cycle}-${idx}`} layout
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
                  transition={{ duration: 0.5, ease }}
                  className="flex h-14 items-center gap-4 border-b border-hairline/70" aria-hidden>
                  <span className="w-6 shrink-0 font-sans text-xs tabular-nums text-muted">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="relative min-w-0 flex-1">
                    <span className={`font-serif text-2xl md:text-[1.75rem] ${w.key ? 'font-semibold text-teal-700' : 'text-ink'}`}>{text}</span>
                    {typing && !s.holding && (
                      <motion.span className="ml-0.5 inline-block h-6 w-[2px] translate-y-1 bg-teal-500 md:h-7"
                        animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }} />
                    )}
                    {!typing && (
                      <motion.span className="absolute -bottom-1 left-0 h-px w-full origin-left bg-gradient-to-r from-teal-500 to-transparent"
                        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, ease }} />
                    )}
                  </span>
                  {!typing && (
                    <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                      className="flex shrink-0 items-center gap-2">
                      <span className="rounded-tag border border-hairline px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">{w.tag}</span>
                      <span className="text-teal-500"><Icon name="check" size={16} /></span>
                    </motion.span>
                  )}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>

        <div className="relative flex items-center justify-between gap-4 border-t border-hairline px-5 py-3.5 md:px-7">
          <span className="font-serif text-sm italic text-muted">{footer}</span>
          <div className="h-[3px] w-24 overflow-hidden rounded-full bg-hairline md:w-32">
            <motion.div className="h-full origin-left bg-teal-500"
              animate={{ scaleX: (s.done.length) / words.length }} transition={{ duration: 0.5, ease }} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
