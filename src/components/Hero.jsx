import { hero } from '../content'
import HeroReel from './HeroReel'

/*
 * Opening section: the brand reel, edge to edge like every other section.
 * Desktop: full width × full screen height, the nav floating over its top.
 * Phone: full width under the nav. The page heading stays in the HTML for
 * search engines and screen readers; the whole reel opens the booking pop-up.
 */
export default function Hero() {
  return (
    <section id="top" className="relative pt-16 md:pt-0">
      <h1 className="sr-only">Mahmoud Bahaa: {hero.headline} {hero.subline}</h1>
      {/* -mb-px: the next band overlaps by a pixel, so no hairline seam at fractional heights */}
      <div className="-mb-px aspect-[4/3] w-full sm:aspect-[16/10] md:aspect-auto md:h-[100svh] md:min-h-[600px]">
        <HeroReel />
      </div>
    </section>
  )
}
