import { useEffect, useRef, useState } from 'react'
import { channels as c } from '../content'
import { SectionHead } from './ui/Reveal'

/*
 * "Where your buyers look": every channel shown in the place it actually runs,
 * as small animated mockups. Ads use a neutral "Your Brand" so nothing reads as a
 * real client or a real result. Animations start when a row scrolls into view.
 */

/** true once the element has been on screen (animations then run on their own). */
function useSeen(margin = '-80px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, seen]
}

/** Types `text` once `on` is true, then holds. */
function useTyped(text, on, speed = 70) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!on) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(text.length); return }
    let i = 0
    const t = setInterval(() => { i += 1; setN(i); if (i >= text.length) clearInterval(t) }, speed)
    return () => clearInterval(t)
  }, [on, text, speed])
  return text.slice(0, n)
}

const Bar = ({ w = '100%', className = '' }) => <span className={`block h-2 rounded-full bg-[#10221F]/10 ${className}`} style={{ width: w }} />
const Sponsored = ({ dark }) => <span className={`text-[10px] font-semibold ${dark ? 'text-white/70' : 'text-[#4C5F5C]'}`}>Sponsored</span>

/* ---------- Search & video ---------- */

function GoogleSearch({ on }) {
  const q = useTyped(c.searchQuery, on)
  const done = q.length === c.searchQuery.length
  return (
    <div className="mx-auto w-full max-w-[34rem]">
      {/* laptop lid */}
      <div className="rounded-t-[14px] border-[7px] border-b-[10px] border-[#10221F] bg-white">
        {/* browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-[#D6DEDC] bg-[#F7F4EE] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#D6DEDC]" /><span className="h-2 w-2 rounded-full bg-[#D6DEDC]" /><span className="h-2 w-2 rounded-full bg-[#D6DEDC]" />
          <span className="ml-2 flex-1 truncate rounded-full bg-white px-3 py-0.5 text-[10px] text-[#4C5F5C]">google.com/search</span>
        </div>
        <div className="h-[15.5rem] overflow-hidden p-4 sm:h-[17rem] sm:p-5">
          <div className="flex items-center gap-2 rounded-full border border-[#D6DEDC] px-4 py-2 shadow-[0_1px_6px_rgba(16,34,31,0.08)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4C5F5C" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span className="text-[13px] text-[#10221F]">{q}<span className="ch-caret ml-px inline-block h-3.5 w-px translate-y-0.5 bg-[#10221F]" /></span>
          </div>
          <div className={`mt-4 space-y-4 transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}>
            {/* the sponsored result */}
            <div className={`transition-transform duration-700 ${done ? 'translate-y-0' : 'translate-y-2'}`}>
              <p className="text-[10px] text-[#10221F]"><span className="font-semibold">Sponsored</span> · yourbrand.com</p>
              <p className="mt-0.5 text-[15px] leading-snug text-[#1a4fd6]">{c.searchAd.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#4C5F5C]">{c.searchAd.text}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-[#1a4fd6]">{c.searchAd.links.map((l) => <span key={l}>{l}</span>)}</p>
            </div>
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1.5">
                <Bar w="38%" className="!h-1.5" /><Bar w="72%" className="!bg-[#1a4fd6]/25" /><Bar w="88%" className="!h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* laptop base */}
      <div className="mx-[-6%] h-3 rounded-b-[10px] bg-[#33524D]" />
    </div>
  )
}

function YouTube({ on }) {
  const [left, setLeft] = useState(5)
  useEffect(() => {
    if (!on) return
    setLeft(5)
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 5)), 1000)
    return () => clearInterval(t)
  }, [on])
  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <div className="relative aspect-video overflow-hidden rounded-[12px] bg-[#0B3B3C]">
        {/* the "video": slow drift of shapes */}
        <div className={`absolute inset-0 ${on ? 'ch-drift' : ''}`}>
          <div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-[#138A84]/60" />
          <div className="absolute bottom-[-3rem] right-[-2rem] h-48 w-48 rounded-full bg-[#3FB5AC]/40" />
        </div>
        <div className="absolute left-4 top-4 max-w-[70%]">
          <p className="font-serif text-xl font-semibold leading-tight text-white sm:text-2xl">{c.videoAd}</p>
          <p className="mt-1 text-[11px] text-white/75">Your Brand</p>
        </div>
        <span className="absolute bottom-10 left-3 rounded bg-[#F2C744] px-1.5 py-0.5 text-[10px] font-semibold text-[#10221F]">Ad</span>
        <span className="absolute bottom-10 right-0 bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-white">
          {left > 0 ? <>Skip in <span className="tabular-nums">{left}</span></> : <>Skip ad ›</>}
        </span>
        {/* playback bar */}
        <div className="absolute inset-x-3 bottom-4 h-1 rounded-full bg-white/25">
          <div className={`h-full rounded-full bg-[#F2C744] ${on ? 'ch-play' : 'w-0'}`} />
        </div>
      </div>
    </div>
  )
}

/* ---------- Social ---------- */

function Phone({ children, dark = true }) {
  return (
    <div className="mx-auto w-[11.5rem] shrink-0 rounded-[2rem] bg-[#10221F] p-[7px] sm:w-[12.5rem]">
      <div className={`relative aspect-[9/19] overflow-hidden rounded-[1.6rem] ${dark ? 'bg-[#0E1817]' : 'bg-white'}`}>
        <span className="absolute left-1/2 top-2 z-20 h-4 w-14 -translate-x-1/2 rounded-full bg-[#10221F]" />
        {children}
      </div>
    </div>
  )
}

function TikTok({ on }) {
  return (
    <Phone>
      <div className={`absolute inset-0 bg-gradient-to-b from-[#0B3B3C] via-[#138A84] to-[#0E1817] ${on ? 'ch-pulse' : ''}`} />
      <p className="absolute left-0 right-0 top-9 text-center text-[11px] font-semibold text-white/80">Following · <span className="text-white">For You</span></p>
      <div className="absolute bottom-24 right-2.5 flex flex-col items-center gap-3">
        {['heart', 'msg', 'share'].map((k) => <span key={k} className="h-8 w-8 rounded-full bg-white/20" />)}
      </div>
      <div className="absolute bottom-14 left-3 right-14 text-white">
        <p className="text-[12px] font-semibold">@yourbrand</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/85">{c.tiktok}</p>
        <Sponsored dark />
      </div>
      <div className={`absolute inset-x-3 bottom-4 rounded-md bg-[#F2705A] py-2 text-center text-[12px] font-semibold text-[#10221F] transition-transform duration-700 ${on ? 'translate-y-0' : 'translate-y-16'}`} style={{ transitionDelay: '1.2s' }}>
        Download now
      </div>
    </Phone>
  )
}

function Instagram({ on }) {
  return (
    <Phone>
      <div className="absolute inset-0 bg-gradient-to-br from-[#17403D] to-[#0B3B3C]" />
      {/* story progress */}
      <div className="absolute inset-x-3 top-8 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
            <span className={`block h-full bg-white ${on ? 'ch-story' : 'w-0'}`} style={{ animationDelay: `${i * 3}s` }} />
          </span>
        ))}
      </div>
      <div className="absolute left-3 top-12 flex items-center gap-2">
        <span className="h-6 w-6 rounded-full bg-[#3FB5AC]" />
        <span className="text-[11px] font-semibold text-white">yourbrand</span><Sponsored dark />
      </div>
      <p className="absolute inset-x-4 top-1/3 font-serif text-[22px] font-semibold leading-tight text-white">{c.instagram}</p>
      <div className={`absolute inset-x-0 bottom-5 flex flex-col items-center text-white ${on ? 'ch-bob' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 15l6-6 6 6" /></svg>
        <span className="mt-1 rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-[#10221F]">Learn more</span>
      </div>
    </Phone>
  )
}

function Facebook({ on }) {
  return (
    <Phone dark={false}>
      <div className="absolute inset-x-0 top-8 border-b border-[#D6DEDC] px-3 pb-2 text-[13px] font-bold text-[#1a4fd6]">feed</div>
      <div className={`absolute inset-x-0 top-[4.2rem] transition-transform duration-1000 ${on ? 'translate-y-0' : 'translate-y-6'}`}>
        <div className="flex items-center gap-2 px-3">
          <span className="h-7 w-7 rounded-full bg-[#0F5E5C]" />
          <div><p className="text-[11px] font-semibold text-[#10221F]">Your Brand</p><Sponsored /></div>
        </div>
        <p className="px-3 pt-2 text-[11px] leading-snug text-[#10221F]">{c.facebook}</p>
        <div className="mt-2 aspect-square bg-gradient-to-br from-[#D8EEEC] to-[#138A84]/60">
          <p className="p-3 font-serif text-lg font-semibold leading-tight text-[#0B3B3C]">From reach to revenue.</p>
        </div>
        <div className="flex items-center justify-between bg-[#F7F4EE] px-3 py-2">
          <span className="text-[10px] text-[#4C5F5C]">yourbrand.com</span>
          <span className="rounded bg-[#D6DEDC] px-2 py-1 text-[10px] font-semibold text-[#10221F]">Learn more</span>
        </div>
        <div className="flex justify-around px-3 py-2 text-[10px] font-semibold text-[#4C5F5C]"><span>Like</span><span>Comment</span><span>Share</span></div>
      </div>
    </Phone>
  )
}

/* ---------- Open web ---------- */

function Native({ on }) {
  return (
    <div className="w-full rounded-[12px] border border-[#D6DEDC] bg-white p-4">
      <Bar w="55%" className="!h-3 !bg-[#10221F]/80" /><div className="mt-2 space-y-1.5"><Bar /><Bar w="92%" /><Bar w="70%" /></div>
      <p className="mt-4 text-[10px] font-semibold text-[#4C5F5C]">Recommended for you</p>
      <div className="mt-2 grid grid-cols-[1fr_1.7fr_1fr] gap-2">
        {[0, 1, 2].map((i) => {
          const ad = i === 1
          return (
            <div key={i} className={`rounded-md p-1.5 transition-colors duration-700 ${ad && on ? 'bg-[#D8EEEC]' : ''}`}>
              <div className={`aspect-[4/3] rounded ${ad ? 'bg-gradient-to-br from-[#138A84] to-[#0B3B3C]' : 'bg-[#10221F]/10'}`} />
              {ad ? (
                <><p className="mt-1.5 text-[10px] font-semibold leading-tight text-[#10221F]">{c.native}</p><p className="mt-0.5 text-[9px] text-[#4C5F5C]">Sponsored · Your Brand</p></>
              ) : (
                <div className="mt-1.5 space-y-1"><Bar className="!h-1.5" /><Bar w="60%" className="!h-1.5" /></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Display({ on }) {
  return (
    <div className="w-full rounded-[12px] border border-[#D6DEDC] bg-white p-3">
      {/* leaderboard banner slot */}
      <div className="relative h-14 overflow-hidden rounded-md bg-[#0B3B3C]">
        <div className={`absolute inset-0 flex flex-col ${on ? 'ch-banner' : ''}`}>
          {c.display.map((t) => (
            <div key={t} className="flex h-14 shrink-0 items-center justify-between gap-2 px-3">
              <span className="font-serif text-[13px] font-semibold leading-tight text-white">{t}</span>
              <span className="shrink-0 rounded bg-[#F2705A] px-2 py-1 text-[9px] font-semibold text-[#10221F]">Open account</span>
            </div>
          ))}
        </div>
        <span className="absolute right-1 top-1 rounded-sm bg-white/80 px-1 text-[8px] text-[#10221F]">Ad</span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_5rem] gap-3">
        <div className="space-y-1.5"><Bar w="60%" className="!h-3 !bg-[#10221F]/70" /><Bar /><Bar w="94%" /><Bar w="80%" /><Bar w="88%" /></div>
        {/* medium rectangle */}
        <div className="flex aspect-[4/5] flex-col justify-between rounded-md bg-[#D8EEEC] p-2">
          <span className="font-serif text-[11px] font-semibold leading-tight text-[#0B3B3C]">Your Brand</span>
          <span className="rounded bg-[#0F5E5C] py-0.5 text-center text-[9px] font-semibold text-white">Learn more</span>
        </div>
      </div>
    </div>
  )
}

function Programmatic({ on }) {
  return (
    <div className="w-full rounded-[12px] bg-[#10221F] p-4 font-sans text-[11px] text-[#EAF2F0]">
      <p className="flex items-center gap-2 text-[#9FC9C4]"><span className={`h-1.5 w-1.5 rounded-full bg-[#3FB5AC] ${on ? 'animate-pulse' : ''}`} /> Impression available · in-market audience</p>
      <div className="mt-3 space-y-2">
        {['Audience match', 'Contextual', 'Your bid'].map((r, i) => {
          const win = i === 2
          return (
            <div key={r} className="flex items-center gap-3">
              <span className="w-1/2 truncate text-[10px] text-[#EAF2F0]/85">{r}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <span className={`block h-full rounded-full ${win ? 'bg-[#3FB5AC]' : 'bg-white/35'} ${on ? 'ch-bid' : 'w-0'}`}
                  style={{ '--w': win ? '92%' : i ? '58%' : '71%', animationDelay: `${0.2 + i * 0.25}s` }} />
              </span>
            </div>
          )
        })}
      </div>
      <p className={`mt-3 rounded-md border border-[#3FB5AC]/50 px-2.5 py-1.5 text-[#3FB5AC] transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1.6s' }}>
        Bid won · ad served to the right buyer
      </p>
    </div>
  )
}

/* ---------- Measurement ---------- */

function Analytics({ on }) {
  return (
    <div className="w-full rounded-[12px] border border-[#D6DEDC] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#10221F]">Reports · Acquisition</span>
        <span className="rounded bg-[#F7F4EE] px-2 py-0.5 text-[10px] text-[#4C5F5C]">Last 28 days</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {['Users', 'Key events', 'Revenue'].map((k, i) => (
          <div key={k} className={`rounded-md px-2 py-1.5 ${i === 2 ? 'bg-[#D8EEEC]' : 'bg-[#F7F4EE]'}`}>
            <p className="text-[10px] text-[#4C5F5C]">{k}</p>
            <Bar w={['70%', '50%', '62%'][i]} className="mt-1.5 !h-2.5 !bg-[#0F5E5C]/40" />
          </div>
        ))}
      </div>
      <svg viewBox="0 0 300 90" className="mt-3 w-full" aria-hidden>
        {[22, 45, 68].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#D6DEDC" strokeWidth="1" />)}
        <path d="M0 78 C 30 70, 50 72, 75 60 S 120 58, 150 44 S 210 40, 235 26 S 280 18, 300 10" fill="none" stroke="#138A84" strokeWidth="2.5"
          strokeDasharray="420" className={on ? 'ch-draw' : ''} style={{ strokeDashoffset: on ? undefined : 420 }} />
      </svg>
    </div>
  )
}

function CRM({ on }) {
  const cols = ['Lead', 'Qualified', 'Proposal', 'Won']
  return (
    <div className="w-full rounded-[12px] border border-[#D6DEDC] bg-white p-3">
      <p className="px-1 text-[11px] font-semibold text-[#10221F]">Pipeline</p>
      <div className="relative mt-2 grid grid-cols-4 gap-1.5">
        {cols.map((k, i) => (
          <div key={k} className={`rounded-md p-1.5 ${i === 3 ? 'bg-[#D8EEEC]' : 'bg-[#F7F4EE]'}`}>
            <p className="text-[9px] font-semibold text-[#4C5F5C]">{k}</p>
            <div className="mt-1.5 space-y-1">
              {Array.from({ length: 3 - Math.min(i, 2) }).map((_, j) => <span key={j} className="block h-5 rounded bg-white" />)}
            </div>
          </div>
        ))}
        {/* one deal travelling the pipeline */}
        <span className={`absolute top-[1.55rem] h-5 w-[calc(25%-0.6rem)] rounded border border-[#138A84] bg-white ${on ? 'ch-deal' : ''}`} style={{ left: '0.375rem' }}>
          <span className="block px-1 text-[8px] font-semibold leading-5 text-[#0F5E5C]">Ad lead</span>
        </span>
      </div>
      <p className="mt-2 px-1 text-[10px] text-[#4C5F5C]">Status sent back to the ad platforms</p>
    </div>
  )
}

function Semrush({ on }) {
  return (
    <div className="w-full rounded-[12px] border border-[#D6DEDC] bg-white p-3">
      <div className="grid grid-cols-[1fr_2.6rem_3rem] gap-2 border-b border-[#D6DEDC] px-1 pb-1.5 text-[9px] font-semibold text-[#4C5F5C]">
        <span>Keyword</span><span>Intent</span><span>Difficulty</span>
      </div>
      {c.keywords.map(([k, intent, kd], i) => (
        <div key={k} className={`grid grid-cols-[1fr_2.6rem_3rem] items-center gap-2 border-b border-[#D6DEDC]/60 px-1 py-1.5 transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: `${i * 0.15}s` }}>
          <span className="truncate text-[11px] text-[#10221F]">{k}</span>
          <span className={`w-fit rounded px-1.5 text-[9px] font-semibold ${intent === 'T' ? 'bg-[#D8EEEC] text-[#0F5E5C]' : 'bg-[#F7F4EE] text-[#4C5F5C]'}`}>{intent === 'T' ? 'Buy' : 'Learn'}</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-[#10221F]/10"><span className={`block h-full rounded-full bg-[#138A84] ${on ? 'ch-bid' : 'w-0'}`} style={{ '--w': kd, animationDelay: `${0.3 + i * 0.15}s` }} /></span>
        </div>
      ))}
    </div>
  )
}

const MOCKS = { GoogleSearch, YouTube, TikTok, Instagram, Facebook, Native, Display, Programmatic, Analytics, CRM, Semrush }

function Tile({ t, on, className = '' }) {
  const M = MOCKS[t.mock]
  return (
    <figure className={`flex flex-col ${className}`}>
      <div className="flex flex-1 items-center justify-center rounded-panel border border-hairline bg-teal-100/50 p-5 md:p-7">
        <M on={on} />
      </div>
      <figcaption className="mt-3 px-1">
        <p className="font-serif text-lg font-semibold text-ink">{t.name}</p>
        <p className="text-sm leading-6 text-muted">{t.line}</p>
      </figcaption>
    </figure>
  )
}

function Row({ row }) {
  const [ref, seen] = useSeen()
  return (
    <div ref={ref} className="mt-14 first:mt-0 md:mt-20">
      <div className="wrap flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline pb-3">
        <h3 className="font-serif text-xl font-semibold text-teal-700 md:text-2xl">{row.label}</h3>
        <span className="text-sm text-muted">{row.line}</span>
      </div>
      {/* phone: swipe through the row; desktop: the row's own grid */}
      <div className={`mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-8 md:mx-auto md:grid md:max-w-[1200px] md:overflow-visible md:px-8 lg:px-16 ${row.grid}`}>
        {row.items.map((t) => <Tile key={t.name} t={t} on={seen} className="w-[85%] shrink-0 snap-center md:w-auto" />)}
      </div>
    </div>
  )
}

export default function Channels() {
  return (
    <section id="channels" className="section overflow-x-clip">
      <div className="wrap">
        <SectionHead headline={c.headline} line={c.line} />
      </div>
      <div className="mt-12 md:mt-16">
        {c.rows.map((row) => <Row key={row.label} row={row} />)}
      </div>
      <p className="wrap mt-10 text-xs text-muted">{c.note}</p>
    </section>
  )
}
