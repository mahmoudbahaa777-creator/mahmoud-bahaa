/*
 * Scroll reveals: one IntersectionObserver for the whole page.
 *
 *   data-reveal            the element fades and lifts in when it reaches the viewport
 *   data-reveal="left"     …or slides in from the left ("right": from the right)
 *   data-reveal-stagger    its children do, one after another
 *
 * Only elements still below the fold when the page loads are hidden first, so nothing
 * the visitor can already see ever blinks out. Opacity + transform only (GPU), each
 * element is unobserved once shown, and nothing runs with reduced motion.
 * Styles live in index.css ("Scroll reveals").
 */
export function initReveal() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return () => {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const targets = []
  document.querySelectorAll('[data-reveal]').forEach((el) => targets.push(el))
  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    ;[...group.children].forEach((el, i) => {
      el.style.setProperty('--reveal-i', i)
      targets.push(el)
    })
  })

  const fold = window.innerHeight * 0.92
  const pending = targets.filter((el) => el.getBoundingClientRect().top > fold)
  pending.forEach((el) => {
    const from = el.getAttribute('data-reveal')
    if (from === 'left' || from === 'right') el.classList.add(`reveal-from-${from}`)
    el.classList.add('reveal-wait')
  })

  const left = new Set(pending)
  const show = (el) => {
    if (!left.delete(el)) return
    el.classList.add('reveal-in')
    el.classList.remove('reveal-wait')
    io.unobserve(el)
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.isIntersecting && show(e.target))
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  pending.forEach((el) => io.observe(el))

  // Safety net: a fast flick on a busy phone can carry a block in and out of view
  // between two observer checks. Anything that has reached the screen or gone past it
  // is shown (one rAF-throttled check per scroll, over only the blocks still hidden).
  let ticking = false
  const sweep = () => {
    ticking = false
    const bottom = window.innerHeight
    left.forEach((el) => { if (el.getBoundingClientRect().top < bottom) show(el) })
    if (!left.size) window.removeEventListener('scroll', onScroll)
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(sweep) } }
  window.addEventListener('scroll', onScroll, { passive: true })

  return () => { io.disconnect(); window.removeEventListener('scroll', onScroll) }
}
