import { useEffect, useRef } from 'react'
import { contact } from '../content'
import { onBook } from './Booking'
import './hero-reel.css'

/*
 * Hero reel (ported from hero-reel.html): an 18s brand reel in a 16:10 box.
 * This component renders the static markup (so it ships in the pre-rendered HTML);
 * GSAP + Three.js and the timeline live in ./heroReelEngine.js, which is loaded
 * as its own chunk as soon as the page mounts; Three.js is fetched later, mid-reel.
 * The whole reel is a link to the booking calendar (opens the booking pop-up).
 */

const CROSSES = [[200, 200], [1000, 200], [200, 600], [1000, 600]]

export default function HeroReel() {
  const root = useRef(null)

  useEffect(() => {
    let stop = () => {}
    let cancelled = false
    const start = () => import('./heroReelEngine').then(({ default: run }) => {
      if (!cancelled) stop = run(root.current, { ctaHref: contact.bookingUrl || contact.callHref, callMinutes: contact.callMinutes })
    })
    // the reel is the opening view, so start fetching it straight away (Three.js still waits until 5.5s into the reel)
    start()
    return () => { cancelled = true; stop() }
  }, [])

  return (
    <div ref={root} className="hero-reel">
      <div className="hr-grid" aria-hidden />
      <div className="panel" id="pDeep" aria-hidden />
      <div className="panel" id="pTeal" aria-hidden />

      {/* decorative motion; the link below carries the meaning for screen readers */}
      <div className="stage" aria-hidden>
        {CROSSES.map(([x, y]) => <span key={`${x}-${y}`} className="cross" style={{ left: x, top: y }} />)}

        {/* 1 From reach to revenue */}
        <div className="scene" id="s1">
          <div id="s1line" /><div id="s1dot" />
          <div className="center display" id="s1a"><span className="mask" data-split>From reach</span></div>
          <div className="center display" id="s1b"><span className="mask" data-split>to <em>revenue</em>.</span><span id="s1bar" /></div>
        </div>

        {/* 2 Positioning */}
        <div className="scene" id="s2">
          <i className="brk a" /><i className="brk b" /><i className="brk c" /><i className="brk d" />
          <div className="center display" id="pos"><span className="mask" data-split>Position<em>ing</em></span></div>
          <div className="sub" id="posSub">Own one clear idea in your buyer&apos;s mind.</div>
        </div>

        {/* 3 Differentiate your brand */}
        <div className="scene" id="s3">
          <div className="center display" id="dif1"><span className="mask" data-split>Differentiate</span></div>
          <div className="center display" id="dif2"><span className="mask" data-split>your <em>brand</em></span></div>
          <div id="dots">{Array.from({ length: 11 }).map((_, i) => <i key={i} className={i === 7 ? 'hero' : undefined} />)}</div>
        </div>

        {/* 4 Be where your audience is */}
        <div className="scene" id="s4">
          <i className="ripple" /><i className="ripple" /><i className="ripple" />
          <div className="center display" id="aud1"><span className="mask" data-split>Be where your</span></div>
          <div className="center display" id="aud2"><span className="mask" data-split><em>audience</em> is.</span></div>
        </div>

        {/* 5 Revenue */}
        <div className="scene" id="s5">
          <div className="center display" id="rev"><span className="mask" data-split>Revenue</span></div>
          <svg id="revArrow" viewBox="0 0 96 96"><path id="aLine" d="M8 88 L86 10" /><path id="aHead" d="M34 10 H86 V62" /></svg>
          <div className="sub quote" id="revSub">Reach is rented. Revenue is owned.</div>
        </div>

        {/* 6 Every stage measured (3D funnel) */}
        <div className="scene" id="s6">
          <canvas id="gl" />
          <div id="s6copy">
            <div className="hr-eyebrow">Performance funnel</div>
            <h2>Every stage,<br /><em>measured.</em></h2>
          </div>
          <div className="flabel" id="fl0"><b data-n="2" data-s="B">0B<i>+</i></b><span>Brand reach</span></div>
          <div className="flabel" id="fl1"><b data-n="750" data-s="">0<i>+</i></b><span>Campaigns</span></div>
          <div className="flabel" id="fl2"><b data-n="150" data-s="K">0K<i>+</i></b><span>Qualified leads</span></div>
          <div className="flabel rev" id="fl3"><b>Revenue <svg viewBox="0 0 24 24" fill="none" stroke="#F2705A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M9 6h9v9" /></svg></b></div>
        </div>

        {/* 7 Scaling */}
        <div className="scene" id="s7">
          <div id="bars">{[60, 95, 135, 180, 235, 300, 380].map((h) => <i key={h} style={{ height: h }} />)}</div>
          <div id="sclBase" />
          <div className="center display" id="scl"><span className="mask" data-split>Scal<em>ing</em></span></div>
          <div className="sub" id="sclSub">Scale what the data proves.</div>
        </div>

        {/* 8 3D calendar */}
        <div className="scene" id="s8">
          <div id="cal">
            <div className="sheet s2" /><div className="sheet s1" />
            <div className="page" id="back" />
            <div className="page" id="front" />
          </div>
          <div id="calChip"><svg viewBox="0 0 16 16" fill="none" stroke="#0F5E5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3L13 4.5" /></svg><span id="chipTxt" /></div>
        </div>

        {/* 9 Book your call */}
        <div className="scene" id="s9">
          <div className="display" id="s9line">
            <span className="w" id="w1"><span className="mask" data-split>Book</span></span><span className="gap" />
            <span className="w" id="w2"><span className="mask" data-split><em>your</em></span></span><span className="gap" />
            <span className="w" id="w3"><span className="mask" data-split>call</span></span><span id="s9dot" />
          </div>
        </div>
      </div>

      {/* the whole reel books a call: Calendly link, opened in the booking pop-up */}
      <a className="hit" href={contact.bookingUrl || contact.callHref} onClick={onBook}
        aria-label="From reach to revenue: positioning, differentiation, audience, revenue, measurement, scaling. Book your strategy call." />
    </div>
  )
}
