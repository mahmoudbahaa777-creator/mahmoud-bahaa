import { useEffect, useRef, useState } from 'react'
import { performance as p } from '../content'

/*
 * Two redesigns of the "Tracking, in 4 steps" / "Scaling, in 4 moves" playbooks,
 * previewed with ?playbooks=a or ?playbooks=c (see Performance.jsx).
 *   A · a pipeline a lead travels through + a staircase of moves
 *   C · two product screens: a data-flow diagram + an ad-manager panel
 * Copy comes from content.js; no figures are invented. Motion is CSS (index.css,
 * "Playbooks"), started once the panel is on screen, and off with reduced motion.
 */

const track = p.tracking.items // [name, line]
const moves = p.scaling.items.map((line, i) => [p.scaling.short[i], line])
const pad = (i) => String(i + 1).padStart(2, '0')
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/** adds `in` once the element has scrolled into view */
function useIn() {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { rootMargin: '0px 0px -12% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, on]
}

function Title({ children, sub }) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 md:mb-8">
      <h3 className="font-serif text-2xl font-semibold text-ink md:text-[1.75rem]">{children}</h3>
      {sub && <span className="text-sm text-muted">{sub}</span>}
    </div>
  )
}

/* ========================= A · pipeline + staircase ========================= */

function Pipeline() {
  const [ref, on] = useIn()
  return (
    <div ref={ref} className={`pb-a ${on ? 'is-in' : ''}`}>
      <Title sub="A lead travels the whole pipe.">{p.tracking.title}</Title>
      {/* desktop: horizontal pipe; phone: vertical */}
      <div className="relative">
        <div aria-hidden className="absolute left-[11px] top-3 bottom-3 w-[3px] rounded-full bg-hairline md:left-3 md:right-3 md:top-[11px] md:bottom-auto md:h-[3px] md:w-auto" />
        <div aria-hidden className="pb-flow absolute left-[11px] top-3 bottom-3 w-[3px] origin-top rounded-full bg-teal-500 md:left-3 md:right-3 md:top-[11px] md:bottom-auto md:h-[3px] md:w-auto md:origin-left" />
        <span aria-hidden className="pb-lead pb-lead-v md:hidden" />
        <span aria-hidden className="pb-lead pb-lead-h hidden md:block" />
        <ol className="relative grid gap-7 md:grid-cols-4 md:gap-4">
          {track.map(([name, line], i) => (
            <li key={name} className="flex gap-4 md:block">
              <span className="pb-station relative z-10 grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border-2 border-teal-500 bg-ground" style={{ '--i': i }}>
                <span className="h-2 w-2 rounded-full bg-teal-500" />
              </span>
              <div className="md:mt-4 md:pr-3">
                <p className="font-serif text-lg font-semibold leading-tight text-ink md:text-xl"><span className="mr-2 text-sm tabular-nums text-teal-700">{pad(i)}</span>{name}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{cap(line)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {/* the loop back to the ad platforms */}
      <div className="mt-6 flex items-center gap-3 rounded-card border border-dashed border-teal-500/50 px-4 py-2.5 text-sm text-teal-700">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
        Revenue flows back to the ad platforms, so the next bid is smarter.
      </div>
    </div>
  )
}

function Staircase() {
  const [ref, on] = useIn()
  const heights = [34, 54, 76, 100]
  return (
    <div ref={ref} className={`pb-a ${on ? 'is-in' : ''}`}>
      <Title sub="Each step earns the next.">{p.scaling.title}</Title>
      {/* desktop: rising bars; phone: widening rows */}
      <ol className="grid gap-3 md:h-[17rem] md:grid-cols-4 md:items-end md:gap-3">
        {moves.map(([name, line], i) => (
          <li key={name} className="pb-step relative md:flex md:h-full md:flex-col md:justify-end" style={{ '--i': i, '--h': `${heights[i]}%`, '--w': `${64 + i * 12}%` }}>
            <div className="pb-bar flex flex-col justify-end rounded-card bg-teal-100 p-3 md:p-4">
              <p className="font-serif text-lg font-semibold text-teal-700"><span className="mr-1.5 text-sm tabular-nums">{pad(i)}</span>{name}</p>
              <p className="mt-0.5 text-sm leading-5 text-ink">{line}</p>
            </div>
          </li>
        ))}
      </ol>
      <div aria-hidden className="mt-3 hidden h-px bg-teal-500 md:block" />
    </div>
  )
}

export function PlaybooksA() {
  return (
    <div className="mt-[var(--space-head)] grid gap-14 border-t border-hairline pt-[var(--space-head)] lg:grid-cols-2 lg:gap-16">
      <Pipeline />
      <Staircase />
    </div>
  )
}

/* ========================= C · two product screens ========================= */

function Window({ title, children }) {
  return (
    <div className="overflow-hidden rounded-panel border border-hairline bg-card">
      <div className="flex items-center gap-2 border-b border-hairline bg-ground px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-hairline" /><span className="h-2.5 w-2.5 rounded-full bg-hairline" /><span className="h-2.5 w-2.5 rounded-full bg-hairline" />
        <span className="ml-2 text-xs font-semibold text-muted">{title}</span>
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  )
}

// each stage of the data flow, with the tracking step that happens there
const NODES = [
  { name: 'Ad platforms', note: 'Google · Meta · TikTok · YouTube', step: null },
  { name: 'Site + GTM', step: 1 },
  { name: 'Server-side API', step: 2 },
  { name: 'CRM', step: 3 },
]

function DataFlow() {
  const [ref, on] = useIn()
  return (
    <div ref={ref} className={`pb-c ${on ? 'is-in' : ''}`}>
      <Title sub="Where every step happens.">{p.tracking.title}</Title>
      <Window title="Tracking · data flow">
        {/* Plan frames everything */}
        <div className="rounded-card border border-dashed border-teal-500/50 p-3 md:p-4">
          <p className="mb-3 text-sm text-muted"><span className="font-semibold text-teal-700">01 {track[0][0]}</span> · {track[0][1]}</p>
          <ol>
            {NODES.map((n, i) => [
              <li key={n.name} className="pb-node flex items-start justify-between gap-3 rounded-card border border-hairline bg-ground px-3 py-2.5" style={{ '--i': i }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{n.name}</p>
                  <p className="text-xs leading-5 text-muted">{n.step ? cap(track[n.step][1]) : n.note}</p>
                </div>
                {n.step && <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-700">{pad(n.step)} {track[n.step][0]}</span>}
              </li>,
              i < NODES.length - 1 && (
                <li key={n.name + '-arrow'} aria-hidden className="relative mx-auto flex h-5 w-px justify-center bg-hairline">
                  <span className="pb-packet absolute h-1.5 w-1.5 rounded-full bg-teal-500" style={{ '--i': i }} />
                </li>
              ),
            ])}
          </ol>
          {/* the loop back */}
          <div className="relative mt-3 flex items-center gap-2 rounded-card bg-teal-100 px-3 py-2 text-xs font-semibold text-teal-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
            CRM → ad platforms: revenue sent back, bidding learns
          </div>
        </div>
      </Window>
    </div>
  )
}

function Toggle({ on }) {
  return (
    <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-500 ${on ? 'bg-teal-700' : 'bg-hairline'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow-[0_1px_2px_rgba(16,34,31,0.25)] transition-[left] duration-500 ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  )
}

function AdManager() {
  const [ref, on] = useIn()
  // the "Cut" row switches itself off once the panel is on screen
  const [cut, setCut] = useState(false)
  useEffect(() => {
    if (!on || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setCut(true), 2200)
    return () => clearTimeout(t)
  }, [on])
  const visual = [
    <span key="ab" className="flex gap-1 text-[11px] font-semibold"><span className="rounded bg-teal-700 px-1.5 py-0.5 text-card">A</span><span className="rounded border border-hairline px-1.5 py-0.5 text-muted">B</span></span>,
    <span key="goal" className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-ink">Goal: qualified lead</span>,
    <span key="budget" className="flex h-4 w-24 items-end gap-0.5" aria-hidden>
      {[25, 40, 55, 70, 85, 100].map((h, k) => <span key={k} className="pb-budget w-full rounded-sm bg-teal-500" style={{ '--h': `${h}%`, '--i': k }} />)}
    </span>,
    <span key="cut" className={`text-[11px] font-semibold transition-colors duration-500 ${cut ? 'text-muted line-through' : 'text-ink'}`}>Ad set 3</span>,
  ]
  return (
    <div ref={ref} className={`pb-c ${on ? 'is-in' : ''}`}>
      <Title sub="Budget follows proof.">{p.scaling.title}</Title>
      <Window title="Scaling · ad manager">
        <div className="mb-2 hidden grid-cols-[2.25rem_4.5rem_1fr_auto] gap-3 px-1 text-[11px] font-semibold text-muted md:grid">
          <span>On</span><span>Move</span><span>Rule</span><span />
        </div>
        <ol className="divide-y divide-hairline">
          {moves.map(([name, line], i) => {
            const off = i === 3 && cut
            return (
              <li key={name} className={`pb-row grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 py-3 transition-opacity duration-500 md:grid-cols-[2.25rem_4.5rem_1fr_auto] ${off ? 'opacity-50' : ''}`} style={{ '--i': i }}>
                <Toggle on={!off} />
                <span className="font-serif text-lg font-semibold text-teal-700 md:text-base">{name}</span>
                <span className="col-span-3 -mt-1 text-sm leading-5 text-ink md:col-span-1 md:mt-0">{line}</span>
                <span className="col-start-3 row-start-1 justify-self-end md:col-start-auto md:row-start-auto">{visual[i]}</span>
              </li>
            )
          })}
        </ol>
      </Window>
    </div>
  )
}

export function PlaybooksC() {
  return (
    <div className="mt-[var(--space-head)] grid gap-12 border-t border-hairline pt-[var(--space-head)] lg:grid-cols-2 lg:gap-10">
      <DataFlow />
      <AdManager />
    </div>
  )
}
