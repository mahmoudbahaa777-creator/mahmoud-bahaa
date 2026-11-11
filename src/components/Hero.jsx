import { hero } from '../content'
import HeroReel from './HeroReel'

/*
 * Opening section: the 16:10 brand reel on its own, as large as the screen allows
 * under the nav. The page heading stays in the HTML for search engines and screen
 * readers; visually the reel carries the message ("From reach to revenue." →
 * "Book your call."), and the whole reel opens the booking pop-up.
 */
export default function Hero() {
  return (
    <section id="top" className="relative pb-10 pt-20 md:pb-14 md:pt-24">
      <h1 className="sr-only">Mahmoud Bahaa: {hero.headline} {hero.subline}</h1>
      <div className="wrap">
        {/* width capped so the 16:10 reel always fits the viewport height under the nav */}
        <div className="board-in mx-auto w-full md:max-w-[min(100%,calc((100svh-9rem)*1.6))]">
          <HeroReel />
        </div>
      </div>
    </section>
  )
}
