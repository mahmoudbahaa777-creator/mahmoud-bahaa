/*
 * Giant scrolling text band: a full-width line of huge Fraunces words drifting
 * sideways, used as a divider between sections. Decorative (aria-hidden); the
 * motion is a CSS marquee that stops with reduced motion. Styles: index.css ("Text bands").
 *
 *   <TextBand words={['Brand', 'Performance', 'Sponsorships']} />            light band
 *   <TextBand words={['From reach to revenue']} tone="dark" reverse />        dark band
 */
export default function TextBand({ words, tone = 'light', reverse = false }) {
  const run = (
    <span className="text-band-run">
      {[...words, ...words, ...words].map((w, i) => (
        <span key={i} className="flex items-center">
          <span>{w}</span>
          <span className="text-band-mark" />
        </span>
      ))}
    </span>
  )
  return (
    <div aria-hidden className={`text-band ${tone === 'dark' ? 'theme-dark bg-deep' : 'bg-ground'}`}>
      <div className={`text-band-track ${reverse ? 'text-band-reverse' : ''}`}>
        {run}
        {run}
      </div>
    </div>
  )
}
