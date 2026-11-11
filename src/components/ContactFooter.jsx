import { motion, useMotionValue, useSpring } from 'framer-motion'
import { closing, contact } from '../content'
import { Reveal, SplitText } from './ui/Reveal'
import Icon from './ui/Icon'
import { onBook } from './Booking'

/** CTA that leans toward the cursor. */
function MagneticCta() {
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 14 }), sy = useSpring(y, { stiffness: 200, damping: 14 })
  return (
    <motion.a href={contact.callHref} onClick={onBook} style={{ x: sx, y: sy }}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.3); y.set((e.clientY - r.top - r.height / 2) * 0.4) }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
      className="btn-primary !px-8 !py-5 text-base">
      {closing.cta} <Icon name="arrowUR" size={20} />
    </motion.a>
  )
}

function ContactLink({ href, icon, children, external }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group flex items-center gap-3 rounded-card border border-hairline px-4 py-3 text-ink transition-colors hover:border-teal-500">
      <span className="text-teal-700 transition-transform duration-300 group-hover:-translate-y-0.5"><Icon name={icon} size={20} /></span>
      <span className="text-sm">{children}</span>
    </a>
  )
}

export default function ContactFooter() {
  return (
    <section id="contact" className="sheet sheet-cream section-top">
      <div className="wrap">
        <div className="relative mx-auto max-w-3xl text-center">
          <SplitText text={closing.headline} className="relative font-serif text-h1 font-semibold md:text-[3.5rem] md:leading-[1.05]" />
          <Reveal delay={0.2} className="relative mt-10"><MagneticCta /></Reveal>
          <Reveal delay={0.3} className="relative mt-8 flex flex-wrap justify-center gap-3">
            <ContactLink href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappText)}`} icon="whatsapp" external>
              Drop me a message on WhatsApp
            </ContactLink>
            <ContactLink href={contact.linkedin} icon="linkedin" external>Connect on LinkedIn</ContactLink>
          </Reveal>
        </div>
      </div>
      <footer className="mt-[var(--space-section)] border-t border-hairline">
        <div className="wrap flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm text-muted">{closing.footer}</span>
          </div>
        </div>
      </footer>
    </section>
  )
}
