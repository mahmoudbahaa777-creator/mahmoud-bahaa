import { logoStrip } from '../content'
import { asset } from '../hooks'

// One-colour logos (white cutouts, shown in ink on cream) as a slow-moving strip. Sponsor partners carry a teal dot.
function Logo({ l }) {
  return (
    <img src={asset(l.src)} alt={l.name} draggable="false" loading="lazy" decoding="async" style={{ height: l.h }}
      className="w-auto max-w-none select-none opacity-60 brightness-0 transition-opacity duration-300 hover:opacity-90" />
  )
}

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-14 pr-14 md:gap-20 md:pr-20">
      {logoStrip.logos.map((l) => <Logo key={l.name} l={l} />)}
      {logoStrip.partners.map((l) => (
        <span key={l.name} className="flex items-center gap-3">
          <Logo l={l} />
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        </span>
      ))}
    </div>
  )
}

export default function LogoStrip() {
  return (
    <section aria-label={logoStrip.label} className="relative border-y border-hairline py-10">
      <div className="wrap mb-7 flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow !text-muted">{logoStrip.label}</p>
        <p className="flex items-center gap-2 text-xs text-muted"><span className="h-1.5 w-1.5 rounded-full bg-teal-500" />marks {logoStrip.partnersLabel.toLowerCase()}</p>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee flex w-max items-center">
          <Row />
          <Row />
        </div>
      </div>
    </section>
  )
}
