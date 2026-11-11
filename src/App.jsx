import { useEffect } from 'react'
import { initReveal } from './reveal'
import Lenis from 'lenis'
import Nav from './components/Nav'
import Hero from './components/Hero'
import LogoStrip from './components/LogoStrip'
import Performance from './components/Performance'
import Channels from './components/Channels'
import FeatureCards from './components/FeatureCards'
import SponsorshipShowcase from './components/SponsorshipShowcase'
import Experience from './components/Experience'
import ContactFooter from './components/ContactFooter'
import Reviews from './components/Reviews'
import Booking from './components/Booking'
import ScrollProgress from './components/ScrollProgress'

export default function App() {
  // Scroll reveals: run after the first render so every section is in the DOM
  useEffect(() => initReveal(), [])

  useEffect(() => {
    // Desktop: once the page has fully loaded, quietly fetch the 3D chunk so it's ready when needed.
    // Phones, data-saver and slow connections skip this; there it loads only when scrolled near,
    // so it never competes with the first screen.
    if (window.matchMedia('(max-width: 767px), (hover: none)').matches) return
    const c = navigator.connection
    if (c && (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || ''))) return
    let t
    const warm = () => { t = setTimeout(() => import('./components/three/CarCanvas'), 2500) }
    if (document.readyState === 'complete') warm()
    else window.addEventListener('load', warm, { once: true })
    return () => { clearTimeout(t); window.removeEventListener('load', warm) }
  }, [])

  useEffect(() => {
    // Smooth wheel scrolling is a desktop nicety; touch screens already scroll natively.
    if (window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    window.__lenis = lenis
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy(); window.__lenis = undefined }
  }, [])

  return (
    <>
      <Nav />
      <ScrollProgress />
      <main>
        <Hero />
        <Experience />
        <FeatureCards />
        <Performance />
        <Channels />
        <SponsorshipShowcase />
        <Reviews />
        <LogoStrip />
        <ContactFooter />
      </main>
      <Booking />
    </>
  )
}
