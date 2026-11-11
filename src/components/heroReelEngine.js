import { gsap } from 'gsap'

/*
 * Timeline + 3D funnel for the hero reel (ported from hero-reel.html).
 * Loaded as its own chunk by HeroReel.jsx. Three.js (the 3D funnel, scene 6 at 8.3s)
 * is fetched separately a moment after the reel starts, so it never competes with
 * the page becoming interactive. Every selector is scoped to `root`
 * (gsap.context), so ids/classes here never touch the rest of the page.
 * Returns a cleanup function.
 */
export default function run(root, opts = {}) {
  if (!root) return () => {}
  const CONFIG = { loop: true, pauseOffscreen: true, randomDate: true, ...opts }
  const DUR = 18
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)]
  const stage = $('.stage')
  const cleanups = []

  /* ---- calendar pages ---- */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let seed = 11; const srand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const rnd = CONFIG.randomDate ? Math.random : srand

  let calY = 2026, calM = 11, selDay = 9
  if (CONFIG.randomDate) {
    // a random upcoming weekday, this month (or next, late in the month)
    const now = new Date(); calY = now.getFullYear(); calM = now.getMonth()
    if (now.getDate() > 20) { calM++; if (calM > 11) { calM = 0; calY++ } }
    const last = new Date(calY, calM + 1, 0).getDate(), from = (calM === now.getMonth()) ? now.getDate() + 1 : 1
    const optsD = []; for (let d = from; d <= last; d++) { const w = new Date(calY, calM, d).getDay(); if (w > 0 && w < 6) optsD.push(d) }
    selDay = optsD[Math.floor(Math.random() * optsD.length)] || from
  }
  const cellPos = (y, m, d) => { const off = (new Date(y, m, 1).getDay() + 6) % 7, i = off + d - 1; return { x: (i % 7) * 63, y: Math.floor(i / 7) * 56 } }
  function pageHTML(y, m, withSel) {
    const last = new Date(y, m + 1, 0).getDate()
    let cells = ''
    for (let d = 1; d <= last; d++) {
      const p = cellPos(y, m, d), w = new Date(y, m, d).getDay()
      cells += `<div class="cell${w === 0 || w === 6 ? ' we' : ''}" data-d="${d}" style="left:${p.x}px;top:${p.y}px"><span>${d}</span></div>`
    }
    if (withSel) cells += '<i id="hl"></i><i id="selRing"></i><i id="selDot"></i>'
    return `<div class="band"><div><div class="hr-eyebrow">Strategy call</div><h3>${MONTHS[m]} ${y}</h3></div><div class="nav"><b>&lsaquo;</b><b>&rsaquo;</b></div></div>
      <div class="wk">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="cells">${cells}</div>`
  }
  const prevY = calM === 0 ? calY - 1 : calY, prevM = (calM + 11) % 12
  $('#back').innerHTML = pageHTML(calY, calM, true)
  $('#front').innerHTML = pageHTML(prevY, prevM, false)
  $('#chipTxt').textContent = `${DAYS[new Date(calY, calM, selDay).getDay()]} ${selDay} ${MONTHS[calM].slice(0, 3)} · ${CONFIG.callMinutes || 15}-min strategy call`
  // "searching" hops before landing on the selected date
  const lastDay = new Date(calY, calM + 1, 0).getDate()
  const hops = []; while (hops.length < 3) { const d = 1 + Math.floor(rnd() * lastDay); if (d !== selDay && !hops.includes(d)) hops.push(d) }
  hops.push(selDay)
  const hopXY = (d) => { const p = cellPos(calY, calM, d); return { x: p.x + 9.5, y: p.y + 6 } }

  /* ---- split text into characters (once; safe if run twice) ---- */
  $$('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return
    el.dataset.splitDone = '1'
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment()
        ;[...n.textContent].forEach((c) => {
          const s = document.createElement('span')
          s.className = c === ' ' ? 'ch sp' : 'ch'; s.textContent = c === ' ' ? ' ' : c; f.appendChild(s)
        })
        n.replaceWith(f)
      } else walk(n)
    })
    walk(el)
  })

  /* ============================================================
     3D FUNNEL (Three.js) — driven by timeline time (deterministic)
     ============================================================ */
  const F0 = 8.3, F1 = 11.6, FD = F1 - F0
  const RINGS = [{ y: 1.7, r: 2.0 }, { y: 0.65, r: 1.5 }, { y: -0.35, r: 1.0 }, { y: -1.3, r: 0.5 }]
  const TOP = { y: 2.35, r: 2.2 }, CORE = { y: -2.15, r: 0.02 }
  const canvas = $('#gl')
  const labels = [0, 1, 2, 3].map((i) => $('#fl' + i))
  let gl = null // the 3D funnel, once Three.js has loaded
  let glVisible = false
  const render3D = (T) => gl && gl.render(T)
  // until the 3D funnel takes over, the labels sit in a tidy column on the right
  labels.forEach((el, i) => { el.style.transform = `translate(700px, ${250 + i * 82}px)` })

  function build3D(THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    const scene3 = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1.5, 0.1, 100)
    camera.setViewOffset(1200, 800, -120, 0, 1200, 800)
    const funnel = new THREE.Group(); scene3.add(funnel)
    const C = { t500: 0x138A84, t700: 0x0F5E5C, t100: 0xD8EEEC, muted: 0x4C5F5C, coral: 0xF2705A }
    const circle = (r, seg = 160) => { const p = []; for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2; p.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)) } return new THREE.BufferGeometry().setFromPoints(p) }
    const ringObjs = RINGS.map((R, i) => {
      const g = new THREE.Group(); g.position.y = R.y
      const line = new THREE.Line(circle(R.r), new THREE.LineBasicMaterial({ color: i === 3 ? C.t700 : C.t500, transparent: true }))
      const disk = new THREE.Mesh(new THREE.CircleGeometry(R.r, 96), new THREE.MeshBasicMaterial({ color: C.t100, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }))
      disk.rotation.x = -Math.PI / 2; g.add(disk, line); funnel.add(g); return g
    })
    const profile = [TOP, ...RINGS, CORE]
    const shellMat = new THREE.LineBasicMaterial({ color: C.muted, transparent: true, opacity: 0.22 })
    for (let m = 0; m < 28; m++) {
      const a = m / 28 * Math.PI * 2
      funnel.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(profile.slice(0, 5).map((p) => new THREE.Vector3(Math.cos(a) * p.r, p.y, Math.sin(a) * p.r))), shellMat))
    }
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 16), new THREE.MeshBasicMaterial({ color: C.coral, transparent: true }))
    core.position.y = CORE.y; funnel.add(core)
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.26, 0.29, 64), new THREE.MeshBasicMaterial({ color: C.coral, transparent: true, side: THREE.DoubleSide }))
    halo.rotation.x = -Math.PI / 2; halo.position.y = CORE.y; funnel.add(halo)

    const N = 1100; let ps = 7; const prand = () => (ps = (ps * 16807) % 2147483647) / 2147483647
    const P = []; for (let i = 0; i < N; i++) { const q = prand(); P.push({ ph: prand(), a: prand() * Math.PI * 2, rr: 0.35 + 0.6 * Math.sqrt(prand()), L: q < 0.42 ? 1 : q < 0.68 ? 2 : q < 0.87 ? 3 : 4, sp: 0.9 + prand() * 0.25 }) }
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), alp = new Float32Array(N)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alp, 1))
    const pMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uSize: { value: 46 }, uPR: { value: 1 }, uFade: { value: 1 } },
      vertexShader: `attribute vec3 aColor; attribute float aAlpha; varying vec3 vC; varying float vA; uniform float uSize, uPR;
        void main(){ vC=aColor; vA=aAlpha; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=uSize*uPR/-mv.z; }`,
      fragmentShader: `varying vec3 vC; varying float vA; uniform float uFade;
        void main(){ vec2 d=gl_PointCoord-.5; float r=length(d); if(r>.5) discard; gl_FragColor=vec4(pow(vC, vec3(.4545)), vA*uFade*smoothstep(.5,.38,r)); }`,
    })
    funnel.add(new THREE.Points(geo, pMat))
    const tealC = new THREE.Color(C.t500), coralC = new THREE.Color(C.coral), tmp = new THREE.Color()
    const radiusAt = (y) => { for (let k = 0; k < profile.length - 1; k++) { const A = profile[k], B = profile[k + 1]; if (y <= A.y && y >= B.y) return A.r + (B.r - A.r) * (A.y - y) / (A.y - B.y) } return 0.02 }
    const ease = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t))
    const v3 = new THREE.Vector3()

    function render(T) {
      const t = T - F0, on = t > -0.05 && t < FD + 0.05
      if (on !== glVisible) { glVisible = on; canvas.style.visibility = on ? 'visible' : 'hidden' }
      if (!on) return
      const inA = ease(t / 0.6), outA = 1 - ease((t - (FD - 0.4)) / 0.4), A = inA * outA
      const th = -0.55 + ease(t / FD) * 0.95, R = 14, h = 4.4 + ease(t / FD) * 0.6
      camera.position.set(Math.sin(th) * R, h, Math.cos(th) * R); camera.lookAt(0, 0.05, 0)
      funnel.scale.setScalar(0.9 + 0.1 * inA - 0.06 * (1 - outA))
      funnel.position.y = (1 - inA) * -0.4
      ringObjs.forEach((g, i) => { const k = ease((t - 0.05 - i * 0.1) / 0.5); g.scale.setScalar(Math.max(k, 0.001)); g.children.forEach((m) => { m.material.opacity = (m.type === 'Mesh' ? 0.45 : 1) * k * outA }) })
      shellMat.opacity = 0.22 * A
      core.scale.setScalar(ease((t - 0.7) / 0.45) * (1 + 0.12 * Math.sin(t * 6))); core.material.opacity = outA
      const hk = (t * 0.9) % 1; halo.scale.setScalar(1 + hk * 2.2); halo.material.opacity = (1 - hk) * 0.8 * ease((t - 0.8) / 0.4) * outA
      const flow = t + 6
      for (let i = 0; i < N; i++) {
        const p = P[i], u = (flow * 0.2 * p.sp + p.ph) % 1
        let y = TOP.y - u * (TOP.y - CORE.y), r = radiusAt(y) * p.rr, al = Math.min(1, u * 12) * 0.9, c = tealC
        const a = p.a + u * 5.5
        if (p.L < 4) { const ry = RINGS[p.L].y; if (y < ry) { const d = ry - y; r = RINGS[p.L].r * p.rr + d * 1.9; y = ry - d * 0.45; al *= Math.max(0, 1 - d * 2.4) } }
        else if (y < RINGS[3].y) { const k = (RINGS[3].y - y) / (RINGS[3].y - CORE.y); tmp.copy(tealC).lerp(coralC, ease(k * 1.6)); c = tmp; al *= 1 - ease((k - 0.8) / 0.2) }
        pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(a) * r
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; alp[i] = al
      }
      geo.attributes.position.needsUpdate = geo.attributes.aColor.needsUpdate = geo.attributes.aAlpha.needsUpdate = true
      pMat.uniforms.uFade.value = ease((t - 0.15) / 0.5) * outA
      renderer.render(scene3, camera)
      const right = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th))
      labels.forEach((el, i) => {
        const s = funnel.scale.x
        v3.copy(right).multiplyScalar((RINGS[i].r + 0.12) * s); v3.y = (i === 3 ? CORE.y : RINGS[i].y) * s + funnel.position.y
        v3.project(camera)
        el.style.transform = `translate(${((v3.x + 1) / 2 * 1200).toFixed(1)}px, ${((1 - v3.y) / 2 * 800 - 17).toFixed(1)}px)`
      })
    }


    const fitGL = (s) => { const pr = s * Math.min(window.devicePixelRatio || 1, 2); renderer.setPixelRatio(pr); renderer.setSize(1200, 800, false); pMat.uniforms.uPR.value = pr }
    const dispose = () => { scene3.traverse((o) => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose() }); renderer.dispose() }
    return { render, fitGL, dispose }
  }

  /* ---- responsive fit: the 1200×800 stage scaled into the 16:10 box ---- */
  function fit() {
    const W = root.clientWidth, H = root.clientHeight, s = Math.min(W / 1200, H / 800)
    stage.style.transform = `translate(${(W - 1200 * s) / 2}px, ${(H - 800 * s) / 2}px) scale(${s})`
    lastScale = s
    gl && gl.fitGL(s)
  }
  let lastScale = 1
  const ro = new ResizeObserver(fit); ro.observe(root); fit()
  cleanups.push(() => ro.disconnect())

  /* ============================================================
     TIMELINE (18.0s) — inside a gsap.context scoped to the reel
     ============================================================ */
  let tl
  const line9 = $('#s9line'), off = { a: 0, b: 0 }
  const ctx = gsap.context(() => {
    gsap.defaults({ ease: 'expo.out', duration: 0.7 })
    const CH = ['#s1a', '#s1b', '#pos', '#dif1', '#dif2', '#aud1', '#aud2', '#rev'].map((s) => s + ' .ch')
    gsap.set(CH, { yPercent: 150 })
    gsap.set('#scl .ch', { scaleY: 0 })
    gsap.set(['#posSub', '#revSub', '#sclSub', '#s6copy > *'], { autoAlpha: 0, y: 12 })
    gsap.set('.brk', { autoAlpha: 0, scale: 1.4 })
    gsap.set('#dots i', { scale: 0 })
    gsap.set(['#aLine', '#aHead'], { strokeDasharray: 120, strokeDashoffset: 120 })
    gsap.set('#bars i', { scaleY: 0 })
    gsap.set('#sclBase', { scaleX: 0 })
    gsap.set(labels, { autoAlpha: 0 })
    gsap.set('#s1dot', { scale: 0 })
    gsap.set('#cal', { autoAlpha: 0, rotateX: 62, rotateZ: -6, y: 150, scale: 0.82 })
    gsap.set('#calChip', { autoAlpha: 0, y: 12 })
    gsap.set(['#w1 .ch', '#w2 .ch'], { yPercent: 150 })
    gsap.set('#w3 .ch', { yPercent: -150 })

    tl = gsap.timeline({ paused: true, repeat: CONFIG.loop ? -1 : 0 })
    const charsOut = (sel, at, d = 0.32) => tl.to(`${sel} .ch`, { yPercent: -175, stagger: 0.01, duration: d, ease: 'power3.in' }, at)
    const slam = (sel, at, st = 0.025) => tl
      .fromTo(sel, { scale: 1.3, filter: 'blur(12px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.8 }, at)
      .to(`${sel} .ch`, { yPercent: 0, stagger: st, duration: 0.7 }, at)

    /* 1 · From reach to revenue  0.0–2.7 */
    tl.to('#s1dot', { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 0.05)
      .to('#s1line', { scaleX: 1, duration: 0.45, ease: 'power3.inOut' }, 0.2)
      .to('#s1line', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.3, ease: 'power3.in' }, 0.62)
      .to('#s1dot', { scale: 0, duration: 0.22, ease: 'power2.in' }, 0.7)
    slam('#s1a', 0.78, 0.028)
    tl.to('#s1a', { y: -110, scale: 0.46, color: '#4C5F5C', duration: 0.65, ease: 'expo.inOut' }, 1.5)
      .fromTo('#s1b', { y: 0 }, { y: -70, duration: 0.65, ease: 'expo.inOut' }, 1.5)
      .to('#s1b .ch', { yPercent: 0, stagger: 0.03, duration: 0.7 }, 1.62)
      .fromTo('#s1bar', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'expo.inOut' }, 1.95)
    charsOut('#s1a', 2.38); charsOut('#s1b', 2.4)
    tl.to('#s1bar', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.3, ease: 'power3.in' }, 2.38)

    /* 2 · Positioning  2.7–4.1 */
    slam('#pos', 2.72)
    tl.to('.brk', { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'expo.out' }, 2.85)
      .to('.brk.a', { x: 40, y: 14, duration: 0.5, ease: 'back.out(2)' }, 3.25).to('.brk.b', { x: -40, y: 14, duration: 0.5, ease: 'back.out(2)' }, 3.25)
      .to('.brk.c', { x: 40, y: -14, duration: 0.5, ease: 'back.out(2)' }, 3.25).to('.brk.d', { x: -40, y: -14, duration: 0.5, ease: 'back.out(2)' }, 3.25)
      .to('#posSub', { autoAlpha: 1, y: 0, duration: 0.5 }, 3.1)
    charsOut('#pos', 3.88)
    tl.to(['.brk', '#posSub'], { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 3.88)

    /* 3 · Differentiate your brand  4.0–5.6 */
    tl.to('#pDeep', { clipPath: 'inset(0% 0 0 0)', duration: 0.55, ease: 'expo.inOut' }, 3.95)
    slam('#dif1', 4.25, 0.018); slam('#dif2', 4.36, 0.03)
    tl.to('#dots i', { scale: 1, stagger: 0.03, duration: 0.4, ease: 'back.out(2)' }, 4.6)
      .to('#dots i.hero', { scale: 1.7, y: -10, duration: 0.5, ease: 'back.out(3)' }, 5.0)
    charsOut('#dif1', 5.4); charsOut('#dif2', 5.42)
    tl.to('#dots i', { scale: 0, stagger: 0.015, duration: 0.25, ease: 'power2.in' }, 5.4)

    /* 4 · Be where your audience is  5.6–7.0 */
    tl.to('#pTeal', { clipPath: 'inset(0 0 0 0%)', duration: 0.55, ease: 'expo.inOut' }, 5.5)
    slam('#aud1', 5.78, 0.02); slam('#aud2', 5.9, 0.025)
    $$('.ripple').forEach((r, i) => tl.fromTo(r, { scale: 0.4, opacity: 0.9 }, { scale: 3.4, opacity: 0, duration: 1.3, ease: 'power2.out', immediateRender: false }, 5.85 + i * 0.3))
    charsOut('#aud1', 6.8); charsOut('#aud2', 6.82)

    /* 5 · Revenue  7.0–8.3 */
    tl.to(['#pDeep', '#pTeal'], { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut' }, 6.92)
    slam('#rev', 7.15, 0.03)
    tl.to('#aLine', { strokeDashoffset: 0, duration: 0.4, ease: 'power3.out' }, 7.5)
      .to('#aHead', { strokeDashoffset: 0, duration: 0.35, ease: 'power3.out' }, 7.65)
      .fromTo('#revArrow', { x: -20, y: 20 }, { x: 0, y: 0, duration: 0.6 }, 7.5)
      .to('#revSub', { autoAlpha: 1, y: 0, duration: 0.5 }, 7.62)
    charsOut('#rev', 8.05)
    tl.to('#revArrow', { x: 160, y: -160, autoAlpha: 0, duration: 0.35, ease: 'power3.in' }, 8.05)
      .to('#revSub', { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 8.05)

    /* 6 · Every stage measured — 3D funnel  8.3–11.6 (canvas driven in render3D) */
    tl.to('#s6copy > *', { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.7 }, 8.4)
      .to(labels, { autoAlpha: 1, stagger: 0.18, duration: 0.45, ease: 'power2.out' }, 8.75)
    labels.slice(0, 3).forEach((el, i) => {
      const b = el.querySelector('b'), n = +b.dataset.n, suf = b.dataset.s, o = { v: 0 }
      tl.to(o, { v: n, duration: 0.9, ease: 'power2.out', onUpdate: () => { b.innerHTML = Math.round(o.v) + suf + '<i>+</i>' } }, 8.75 + i * 0.18)
    })
    tl.to(['#s6copy > *', ...labels], { autoAlpha: 0, y: -10, stagger: 0.03, duration: 0.3, ease: 'power2.in' }, 11.15)

    /* 7 · Scaling  11.6–13.0 */
    tl.to('#bars i', { scaleY: 1, stagger: 0.06, duration: 0.7, ease: 'expo.out' }, 11.62)
      .to('#sclBase', { scaleX: 1, duration: 0.6, ease: 'expo.inOut' }, 11.6)
      .to('#scl .ch', { scaleY: 1, stagger: 0.05, duration: 0.6, ease: 'back.out(1.8)' }, 11.7)
      .to('#scl .ch', { y: (i) => -i * 9, stagger: 0.03, duration: 0.5, ease: 'expo.out' }, 12.0)
      .to('#sclSub', { autoAlpha: 1, y: 0, duration: 0.45 }, 12.05)
      .to('#scl .ch', { scaleY: 0, stagger: 0.02, duration: 0.25, ease: 'power3.in' }, 12.75)
      .to('#bars i', { scaleY: 0, stagger: 0.02, duration: 0.25, ease: 'power3.in' }, 12.75)
      .to(['#sclBase', '#sclSub'], { autoAlpha: 0, duration: 0.25 }, 12.75)

    /* 8 · 3D calendar with a date selected  13.0–15.8 */
    tl.to('#cal', { autoAlpha: 1, rotateX: 16, rotateY: -16, rotateZ: 0, y: 0, scale: 1, duration: 1.0, ease: 'expo.out' }, 13.0)
      .to('#front', { rotateX: 105, autoAlpha: 0, duration: 0.75, ease: 'power2.inOut' }, 13.3)
      .to('#cal', { rotateX: 8, rotateY: -6, duration: 2.2, ease: 'sine.inOut' }, 13.9)
    hops.forEach((d, i) => {
      const p = hopXY(d), at = 13.85 + i * 0.22
      if (i === 0) tl.set('#hl', { x: p.x, y: p.y }, at).to('#hl', { opacity: 1, duration: 0.15 }, at)
      else tl.to('#hl', { x: p.x, y: p.y, duration: 0.2, ease: 'power3.out' }, at)
    })
    const fin = hopXY(selDay)
    tl.set(['#selDot', '#selRing'], { x: fin.x, y: fin.y }, 14.5)
      .to('#selDot', { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, 14.58)
      .to('#hl', { opacity: 0, duration: 0.2 }, 14.6)
      .to($(`#back .cell[data-d="${selDay}"]`), { color: '#FFFFFF', duration: 0.2 }, 14.62)
      .fromTo('#selRing', { scale: 1, opacity: 0.7 }, { scale: 1.9, opacity: 0, duration: 0.8, ease: 'power2.out', immediateRender: false }, 14.7)
      .to('#calChip', { autoAlpha: 1, y: 0, duration: 0.5 }, 14.8)
      .to(['#cal', '#calChip'], { autoAlpha: 0, y: -24, scale: 0.94, duration: 0.4, ease: 'power3.in' }, 15.5)

    /* 9 · Book → your → call  15.8–18.0 (line re-centres as each word lands) */
    tl.set(line9, { x: () => off.a }, 15.8)
    slam('#w1', 15.85, 0.04)
    tl.to(line9, { x: () => off.b, duration: 0.55, ease: 'expo.inOut' }, 16.35)
      .to('#w2 .ch', { yPercent: 0, stagger: 0.04, duration: 0.65 }, 16.45)
      .to(line9, { x: 0, duration: 0.55, ease: 'expo.inOut' }, 16.85)
      .to('#w3 .ch', { yPercent: 0, stagger: 0.04, duration: 0.65 }, 16.95)
      .to('#s9dot', { scale: 1, duration: 0.45, ease: 'back.out(3)' }, 17.2)
      .addLabel('hold', 17.4)
      .to('#s9line .ch', { yPercent: -175, stagger: 0.012, duration: 0.28, ease: 'power3.in' }, 17.55)
      .to('#s9dot', { scale: 0, duration: 0.2, ease: 'power2.in' }, 17.6)
      .fromTo('#s1dot', { scale: 0 }, { scale: 1, duration: 0.18, ease: 'back.out(3)', immediateRender: false }, 17.72)
      .to('#s1dot', { scale: 0, duration: 0.15, ease: 'power2.in' }, 17.85)
      .set({}, {}, DUR)

    tl.eventCallback('onUpdate', () => render3D(tl.time()))
    tl.eventCallback('onRepeat', () => gsap.set('#s1a', { y: 0, scale: 1, color: '#0B3B3C' }))
  }, root)
  root.classList.add('is-ready')

  /* ============================================================
     PLAYBACK
     ============================================================ */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let alive = true
  ;(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    if (!alive) return
    const em = $('#s1b em'), b = $('#s1bar'), hostEl = $('#s1b'), host = hostEl.getBoundingClientRect(), r = em.getBoundingClientRect(), k = host.width / hostEl.offsetWidth
    Object.assign(b.style, { left: (r.left - host.left) / k + 'px', top: (r.bottom - host.top) / k - 6 + 'px', width: r.width / k + 'px' })
    // horizontal offsets so "Book" and "Book your" sit centred before the full line lands
    const L = line9.getBoundingClientRect(), mid = L.left + L.width / 2, k2 = L.width / line9.offsetWidth
    const r1 = $('#w1').getBoundingClientRect(), r2 = $('#w2').getBoundingClientRect()
    off.a = (mid - (r1.left + r1.right) / 2) / k2
    off.b = (mid - (r1.left + r2.right) / 2) / k2
    tl.invalidate()
    render3D(0)
    if (reduce) { tl.time(17.4).pause(); return } // hold on "Book your call."
    CONFIG.loop ? tl.play() : tl.tweenTo('hold')
    // fetch the 3D engine 5.5s into the reel: well after the page is interactive,
    // ~3s before scene 6 (8.3s) needs it. Until then the labels use their fallback column.
    let asked = false
    tl.call(() => {
      if (asked) return
      asked = true
      import('three').then((THREE) => {
        if (!alive) return
        gl = build3D(THREE); gl.fitGL(lastScale); render3D(tl.time())
      })
    }, null, 5.5)
    if (CONFIG.pauseOffscreen && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!CONFIG.loop && tl.time() >= 17.4) return
        e.isIntersecting ? (CONFIG.loop ? tl.play() : tl.tweenTo('hold')) : tl.pause()
      })
      io.observe(root)
      cleanups.push(() => io.disconnect())
    }
  })

  return () => {
    alive = false
    cleanups.forEach((f) => f())
    tl && tl.kill()
    ctx.revert()
    root.classList.remove('is-ready')
    gl && gl.dispose()
  }
}
