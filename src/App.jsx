import { useEffect } from 'react'
import Lenis from 'lenis'
import Nav from './components/Nav'
import Hero from './components/Hero'
import LogoStrip from './components/LogoStrip'
import Performance from './components/Performance'
import FeatureCards from './components/FeatureCards'
import Method from './components/Method'
import SponsorshipShowcase from './components/SponsorshipShowcase'
import Experience from './components/Experience'
import ContactFooter from './components/ContactFooter'
import Reviews from './components/Reviews'
import Booking from './components/Booking'
import ScrollProgress from './components/ScrollProgress'

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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
        <Method />
        <SponsorshipShowcase />
        <Reviews />
        <LogoStrip />
        <ContactFooter />
      </main>
      <Booking />
    </>
  )
}
