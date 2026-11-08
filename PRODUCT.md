# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- **Prospective clients:** founders, CMOs and brand owners in MENA looking for a consultant or partner to grow a brand and bring in qualified leads.
- **Prospective employers:** recruiters and executives hiring for a senior marketing leadership role.

Both arrive mostly from LinkedIn or a shared link, often on a phone, and decide within a short visit whether Mahmoud is worth a conversation.

## Product Purpose

mahmoudbahaa.com is the personal site of Mahmoud Bahaa, a growth strategist and marketing leader with 11+ years across performance, brand and sponsorship marketing in MENA. It exists to turn a visit into a conversation. Success is a booked 15-minute strategy call (Calendly), a WhatsApp message or a LinkedIn connection.

## Positioning

Brand and performance in one person. Mahmoud builds the trust (positioning, 360° campaigns, sponsorship activation) and the performance engine (paid media tracked from impression to revenue). Most marketers do one side; the site has to show that he does both and connects them, summed up in the tagline *From reach to revenue.*

## Operating Context

- Visitors evaluate quickly, on phone and desktop; mobile load speed matters (the page is pre-rendered for that reason).
- Conversion paths: "Book a strategy call" opens a Calendly pop-up (15 minutes, email fallback in the pop-up); WhatsApp to +971 52 955 6906 with a pre-filled message; LinkedIn profile.
- Hosted on Cloudflare Pages at mahmoudbahaa.com, auto-deployed from GitHub (mahmoudbahaa777-creator/mahmoud-bahaa, main branch).

## Capabilities and Constraints

- Single landing page. Sections in order: hero with typing "Growth board", experience stats band, What I do (8 services in two groups: Brand and Performance), Performance & method (funnel with the Reach → Revenue method stages laid over it), Sponsorships (3D car and goal showcase on a dark band), Recommendations (twin marquee), brands bar, closing CTA.
- Light (cream) theme by default, per the brand book; the sponsorship stage is a local dark band.
- All copy lives in `src/content.js`.
- Stack: Vite, React 18, Tailwind, React Three Fiber/drei, Framer Motion, Lenis.
- The performance funnel stage names are a working draft from Mahmoud's content doc ("6 stages, impression to revenue"); they await his confirmation.
- No email button or city tag in the closing section (his decision); the email stays only inside the booking pop-up.

## Brand Commitments

- Follows the user-level `mahmoud-bahaa` brand skill: Ocean Teal palette, Fraunces + Inter, the mentor voice (lead with the lesson, then the proof; frameworks over adjectives; no hype words, emoji or ALL CAPS; credit the team with "we").
- Tagline: *From reach to revenue.* (serif, sentence case).
- The brand mark is removed from the page by Mahmoud's choice.
- English only on the site for now.

## Evidence on Hand

- Career totals (approved): 11+ years, $50M+ budget managed, 260K+ leads, 4x ROAS, 2B+ brand reach.
- Seven LinkedIn recommendations, lightly edited for length (`src/content.js`, `reviews`).
- Sponsorships activated: Oracle Red Bull Racing, Aston Martin F1, UAE Pro League. Their logos and car photos are used by Mahmoud's choice; written permission is not confirmed.
- Brands worked with: AvaTrade, Capex.com, CPT Markets, Migaloz, Dimofinf (logos in `public/logos`).
- Absent and not to be invented: per-campaign figures, client case studies, pricing, press.

## Product Principles

1. Every section earns its place by proving one side of "brand + performance", or the link between them.
2. Numbers are evidence with context: only the approved career totals, never invented campaign results.
3. One clear next step everywhere: book the call. WhatsApp and LinkedIn are the lighter alternatives.
4. It has to work just as well, and load just as fast, on a phone.
5. Credibility over spectacle: motion and 3D support the story and never block reading or the CTA.

## Accessibility & Inclusion

Respect reduced-motion preferences (already wired), keep text contrast to the brand's verified pairs, and keep decorative motion (marquees, typing board) mirrored by readable text for screen readers.
