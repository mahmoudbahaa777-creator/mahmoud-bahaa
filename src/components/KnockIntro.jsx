import { useEffect, useRef, useState } from 'react'
import { sponsorships } from '../content'
import { asset } from '../hooks'
import { uplIntro } from '../uplIntro'

/*
 * UAE Pro League intro: Mahmoud steps up to the glass, knocks three times
 * ("Look at me!"), then shrinks back onto the pitch, where the player wearing
 * his face takes the shot. While it plays, `uplIntro.hold` keeps the 3D player
 * waiting at the start of the run-up.
 */

const KNOCKS = [950, 1300, 1650] // ms after the intro starts
const BUBBLE = 1900
const LEAVE = 3900
const DONE = 4600

export default function KnockIntro({ active }) {
  const copy = sponsorships.knock
  const [phase, setPhase] = useState('off') // off → in → leave → done
  const [knock, setKnock] = useState(-1)
  const [bubble, setBubble] = useState(false)
  const [run, setRun] = useState(0) // bump to replay
  const timers = useRef([])
  const glass = useRef(null)

  useEffect(() => {
    const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
    if (!active) { clear(); uplIntro.hold = false; setPhase('off'); setKnock(-1); setBubble(false); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { uplIntro.hold = false; setPhase('done'); return }
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))
    uplIntro.hold = true
    setPhase('in'); setKnock(-1); setBubble(false)
    KNOCKS.forEach((ms, i) => at(ms, () => setKnock(i)))
    at(BUBBLE, () => setBubble(true))
    at(LEAVE, () => { setPhase('leave'); setBubble(false) })
    at(LEAVE + 250, () => { uplIntro.hold = false })
    at(DONE, () => setPhase('done'))
    return () => { clear(); uplIntro.hold = false }
  }, [active, run])

  // replay the shake on every knock without remounting anything
  useEffect(() => {
    const el = glass.current
    if (!el || knock < 0) return
    el.classList.remove('knock-shake'); void el.offsetWidth; el.classList.add('knock-shake')
  }, [knock])

  if (phase === 'off') return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {phase !== 'done' && (
        // the "glass" between the visitor and the pitch, shaken by each knock
        <div ref={glass} className="absolute inset-0">
          <div aria-hidden className={`absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(234,242,240,0.07)_45%,transparent_55%)] transition-opacity duration-500 ${phase === 'in' ? 'opacity-100' : 'opacity-0'}`} />
          {/* position (phone: upper middle, fading out at the waist; desktop: right, on the pitch) */}
          <div className="absolute left-1/2 top-[24%] h-[40%] -translate-x-1/2 [mask-image:linear-gradient(180deg,#000_75%,transparent)] md:left-auto md:right-[8%] md:top-auto md:bottom-0 md:h-[80%] md:translate-x-0 md:[mask-image:none]">
          <div className={`relative h-full ${phase === 'leave' ? 'knock-leave' : 'knock-rise'}`}>
            <img src={asset('/brand/me-knock.webp')} alt="" draggable="false" className="h-full w-auto max-w-none select-none" />
            {/* knock ripples on the glass, by his raised side */}
            {KNOCKS.map((_, i) => i <= knock && phase === 'in' && (
              <span key={i} aria-hidden className="knock-ripple absolute rounded-full border-2 border-[#EAF2F0]"
                style={{ left: `${74 + i * 4}%`, top: `${20 + i * 7}%` }} />
            ))}
            {/* speech bubble: above his head on phones, beside it on desktop */}
            <div className={`absolute bottom-full left-1/2 mb-1 -translate-x-1/2 transition-all duration-300 md:bottom-auto md:left-auto md:right-full md:top-[4%] md:mb-0 md:mr-4 md:translate-x-0 ${bubble ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="relative rounded-panel bg-[#F7F4EE] px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:px-5 md:py-3">
                <p className="whitespace-nowrap font-serif text-lg font-semibold text-[#10221F] md:text-2xl">{copy.bubble}</p>
                <p className="whitespace-nowrap text-xs text-[#4C5F5C] md:text-sm">{copy.sub}</p>
                <span aria-hidden className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#F7F4EE] md:-right-2 md:bottom-3 md:left-auto md:translate-x-0" />
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
      {phase === 'done' && (
        <button onClick={() => setRun((r) => r + 1)}
          className="pointer-events-auto absolute right-4 top-[7.5rem] rounded-full border border-[#EAF2F0]/30 bg-[#0E1817]/70 px-3.5 py-1.5 text-xs font-semibold text-[#EAF2F0] transition-colors hover:border-[#3FB5AC] md:right-8 md:top-28">
          {copy.replay}
        </button>
      )}
    </div>
  )
}
