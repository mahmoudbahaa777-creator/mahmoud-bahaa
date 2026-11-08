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

// Calendly takes hex colours without '#'; read them from the live theme tokens.
const tokenHex = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return /^#[0-9a-f]{6}$/i.test(v) ? v.slice(1) : fallback
}

const whatsappHref = () => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappText)}`

// How long the calendar may take before the fallback options are offered.
const SLOW_MS = 8000

function embedSrc(url) {
  try {
    const u = new URL(url)
    if (u.hostname.endsWith('calendly.com')) {
      u.searchParams.set('embed_domain', location.hostname)
      u.searchParams.set('embed_type', 'Inline')
      u.searchParams.set('hide_gdpr_banner', '1')
      u.searchParams.set('background_color', tokenHex('--surface-200', 'ffffff'))
      u.searchParams.set('text_color', tokenHex('--ink', '10221f'))
      u.searchParams.set('primary_color', tokenHex('--teal-700', '0f5e5c'))
    }
    if (u.hostname.endsWith('cal.com')) {
      u.searchParams.set('embed', 'true')
      u.searchParams.set('theme', 'light')
    }
    return u.toString()
  } catch {
    return url
  }
}

export default function Booking() {
  const [open, setOpen] = useState(false)
  // loading → ready (Calendly said it rendered) or slow (no word after SLOW_MS)
  const [status, setStatus] = useState('loading')
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
  const lastFocus = useRef(null)

  useEffect(() => {
    const on = () => { lastFocus.current = document.activeElement; setStatus('loading'); setOpen(true) }
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])

  useEffect(() => {
    if (!open) { lastFocus.current?.focus?.(); return }
    window.__lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    // Everything behind the dialog leaves the tab order and the accessibility tree.
    const behind = [...document.querySelectorAll('body > #root > :not([data-booking])')]
    behind.forEach((el) => { el.inert = true })
    closeRef.current?.focus()
    const keys = (e) => {
      if (e.key === 'Escape') return setOpen(false)
      if (e.key !== 'Tab' || !dialogRef.current) return
      // Keep Tab cycling inside the dialog.
      const f = [...dialogRef.current.querySelectorAll('a[href], button, iframe')]
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    // An iframe's load event fires even when the embed fails, so wait for Calendly's own message.
    const msg = (e) => {
      if (/^https:\/\/([a-z0-9-]+\.)*calendly\.com$/.test(e.origin) && String(e.data?.event || '').startsWith('calendly.')) setStatus('ready')
    }
    const slow = setTimeout(() => setStatus((st) => (st === 'ready' ? st : 'slow')), SLOW_MS)
    window.addEventListener('keydown', keys)
    window.addEventListener('message', msg)
    return () => {
      clearTimeout(slow)
      window.removeEventListener('keydown', keys)
      window.removeEventListener('message', msg)
      behind.forEach((el) => { el.inert = false })
      window.__lenis?.start()
      document.documentElement.style.overflow = ''
    }
  }, [open])
  const loaded = status === 'ready'

  if (!contact.bookingUrl) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div data-booking className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <button aria-label="Close booking" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="booking-title"
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            className="relative flex h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-panel border border-hairline bg-card sm:h-[min(88vh,760px)] sm:rounded-panel">
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 md:px-7">
              <div>
                <h2 id="booking-title" className="font-serif text-2xl font-semibold text-ink">Book a strategy call</h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted">{contact.callPitch}</p>
                <p className="mt-1 text-sm text-muted">Free, {contact.callMinutes} minutes. Pick a time and you'll get a calendar invite straight away.</p>
              </div>
              <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hairline text-muted transition-colors hover:border-teal-500 hover:text-ink">
                <Icon name="plus" size={18} className="rotate-45" />
              </button>
            </div>
            <div className="relative flex-1">
              {status === 'loading' && (
                <div className="absolute inset-0 grid place-items-center" role="status">
                  <div className="flex flex-col items-center gap-3 text-sm text-muted">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-teal-500" />
                    Loading calendar…
                  </div>
                </div>
              )}
              {status === 'slow' && (
                <div className="absolute inset-0 z-10 grid place-items-center bg-card p-6" role="status">
                  <div className="max-w-sm text-center">
                    <p className="font-serif text-xl font-semibold text-ink">The calendar is taking a while.</p>
                    <p className="mt-2 text-sm leading-6 text-muted">It may be blocked on this network. Open it in a new tab, or reach me directly and we'll find a time.</p>
                    <div className="mt-6 flex flex-col gap-3">
                      <a href={contact.bookingUrl} target="_blank" rel="noreferrer" className="btn-primary justify-center">Open the calendar <Icon name="arrowUR" size={18} /></a>
                      <a href={whatsappHref()} target="_blank" rel="noreferrer" className="btn-ghost justify-center"><Icon name="whatsapp" size={18} /> Message me on WhatsApp</a>
                      <a href={contact.callHref} className="btn-ghost justify-center"><Icon name="mail" size={18} /> Email {contact.email}</a>
                    </div>
                  </div>
                </div>
              )}
              <iframe title="Book a strategy call with Mahmoud Bahaa" src={embedSrc(contact.bookingUrl)}
                className={`h-full w-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                allow="payment" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-hairline px-5 py-3 text-sm text-muted md:px-7">
              <span className="flex flex-wrap gap-x-4 gap-y-1">
                <a href={whatsappHref()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:underline"><Icon name="whatsapp" size={16} /> WhatsApp</a>
                <a href={contact.callHref} className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:underline"><Icon name="mail" size={16} /> {contact.email}</a>
              </span>
              <a href={contact.bookingUrl} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">Open in a new tab ↗</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
