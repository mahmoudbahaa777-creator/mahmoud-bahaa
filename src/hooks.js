import { useEffect, useLayoutEffect, useState } from 'react'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/* The page is pre-rendered, so the first render must match the server's (no media info).
 * The real value is applied before the browser paints the hydrated page. */
export function useMedia(query, initial = false) {
  const [match, setMatch] = useState(initial)
  useIsoLayoutEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

export const useIsMobile = () => useMedia('(max-width: 767px)')
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')

/** true while the element is within `margin` of the viewport — used to pause WebGL loops. */
export function useInView(ref, margin = '200px') {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [ref, margin])
  return inView
}

/** Low-end check: mobile, few cores, or no WebGL2. */
export function useLowPower() {
  const isMobile = useIsMobile()
  const [low, setLow] = useState(false)
  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4
    let gl2 = true
    try { gl2 = !!document.createElement('canvas').getContext('webgl2') } catch { gl2 = false }
    setLow(isMobile || cores <= 4 || !gl2)
  }, [isMobile])
  return low
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  // Pass an exact pixel target: Lenis' own element lookup can go stale on long
  // pages with pinned sections and send the scroll to the wrong place.
  const y = el.getBoundingClientRect().top + window.scrollY
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4, force: true })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

/** Public-folder path that also works when the site is served from a sub-path (GitHub Pages). */
export const asset = (p) => (p ? import.meta.env.BASE_URL + String(p).replace(/^\//, '') : p)
