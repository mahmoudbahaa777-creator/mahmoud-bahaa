import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { contact } from '../content'
import Icon from './ui/Icon'

/*
 * "Book a strategy call" pop-up with the scheduling calendar inside.
 *
 * Set contact.bookingUrl in src/content.js to your public booking link:
 *   Calendly         https://calendly.com/<you>/30min
 *   Cal.com          https://cal.com/<you>/30min
 *   Google Calendar  https://calendar.app.google/<id>   (appointment schedule)
 * While it's empty, every "Book" button falls back to the email link (contact.callHref).
 */

const EVENT = 'open-booking'
const ease = [0.22, 1, 0.36, 1]

/** onClick for any booking button/link. Opens the pop-up when a booking link exists. */
export function onBook(e) {
  if (!contact.bookingUrl) return // no calendar yet: let the mailto href work
  e.preventDefault()
  window.dispatchEvent(new Event(EVENT))
}

function embedSrc(url) {
  try {
    const u = new URL(url)
    if (u.hostname.endsWith('calendly.com')) {
      u.searchParams.set('embed_domain', location.hostname)
      u.searchParams.set('embed_type', 'Inline')
      u.searchParams.set('hide_gdpr_banner', '1')
      u.searchParams.set('background_color', '0e1817')
      u.searchParams.set('text_color', 'eaf2f0')
      u.searchParams.set('primary_color', '3fb5ac')
    }
    if (u.hostname.endsWith('cal.com')) {
      u.searchParams.set('embed', 'true')
      u.searchParams.set('theme', 'dark')
    }
    return u.toString()
  } catch {
    return url
  }
}

export default function Booking() {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const closeRef = useRef(null)
  const lastFocus = useRef(null)

  useEffect(() => {
    const on = () => { lastFocus.current = document.activeElement; setLoaded(false); setOpen(true) }
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])

  useEffect(() => {
    if (!open) { lastFocus.current?.focus?.(); return }
    window.__lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('keydown', esc)
      window.__lenis?.start()
      document.documentElement.style.overflow = ''
    }
  }, [open])

  if (!contact.bookingUrl) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <button aria-label="Close booking" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div role="dialog" aria-modal="true" aria-labelledby="booking-title"
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            className="relative flex h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-panel border border-hairline bg-card sm:h-[min(88vh,760px)] sm:rounded-panel">
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 md:px-7">
              <div>
                <p className="eyebrow">Free · {contact.callMinutes} minutes</p>
                <h2 id="booking-title" className="mt-1 font-serif text-2xl font-semibold text-ink">Book a strategy call</h2>
                <p className="mt-1 text-sm text-muted">Pick a time that suits you. You'll get a calendar invite straight away.</p>
              </div>
              <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hairline text-muted transition-colors hover:border-teal-500 hover:text-ink">
                <Icon name="plus" size={18} className="rotate-45" />
              </button>
            </div>
            <div className="relative flex-1">
              {!loaded && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-3 text-sm text-muted">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-teal-500" />
                    Loading calendar…
                  </div>
                </div>
              )}
              <iframe title="Book a strategy call with Mahmoud Bahaa" src={embedSrc(contact.bookingUrl)}
                onLoad={() => setLoaded(true)} className={`h-full w-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                allow="payment" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline px-5 py-3 text-xs text-muted md:px-7">
              <span>Prefer email? <a href={contact.callHref} className="font-semibold text-teal-700 hover:underline">{contact.email}</a></span>
              <a href={contact.bookingUrl} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">Open in a new tab ↗</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
