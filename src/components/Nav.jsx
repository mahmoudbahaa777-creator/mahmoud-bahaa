import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { contact } from '../content'
import { scrollToId } from '../hooks'
import { onBook } from './Booking'

const ease = [0.22, 1, 0.36, 1]
const LINKS = [['services', 'What I do'], ['performance', 'Performance'], ['method', 'Method'], ['sponsorships', 'Sponsorships'], ['reviews', 'Recommendations']]

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const go = (id) => { setOpen(false); setTimeout(() => scrollToId(id), 50) }

  return (
    <header
      className={`nav-in fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${solid || open ? 'glass border-x-0 border-t-0' : 'border-b border-transparent'}`}>
      <div className="wrap flex h-16 items-center justify-between">
        <button onClick={() => go('top')} className="flex items-center gap-3" aria-label="Mahmoud Bahaa — back to top">
          <span className="text-left leading-tight">
            <span className="block font-serif text-[17px] font-semibold text-ink">Mahmoud Bahaa</span>
            <span className="block font-serif text-[12px] italic text-muted">From reach to revenue.</span>
          </span>
        </button>
        <nav className="hidden items-center gap-7 text-sm text-muted lg:flex">
          {LINKS.map(([id, l]) => (
            <button key={id} onClick={() => go(id)} className="transition-colors hover:text-ink">{l}</button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={contact.callHref} onClick={onBook} className="btn-ghost !px-4 !py-2 text-sm">Book a call</a>
          {/* Phone/tablet: the same section links, in a drop-down */}
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-10 w-10 place-items-center rounded-card border border-hairline text-ink lg:hidden">
            <span className="relative block h-3 w-4">
              <motion.span className="absolute left-0 top-0 h-[2px] w-4 rounded bg-current" animate={open ? { y: 5, rotate: 45 } : { y: 0, rotate: 0 }} />
              <motion.span className="absolute left-0 top-[5px] h-[2px] w-4 rounded bg-current" animate={{ opacity: open ? 0 : 1 }} />
              <motion.span className="absolute left-0 top-[10px] h-[2px] w-4 rounded bg-current" animate={open ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav id="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }} className="overflow-hidden border-t border-hairline lg:hidden">
            <ol className="wrap py-3">
              {LINKS.map(([id, l], i) => (
                <motion.li key={id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}>
                  <button onClick={() => go(id)} className="flex w-full items-center gap-4 border-b border-hairline py-4 text-left last:border-0">
                    <span className="font-serif text-sm text-teal-500">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-serif text-2xl font-semibold text-ink">{l}</span>
                  </button>
                </motion.li>
              ))}
            </ol>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
