# Mahmoud Bahaa — Portfolio landing page

Vite + React 18 · Tailwind 3 · React Three Fiber / drei · Framer Motion · Lenis.
Brand: Ocean Teal dark mode, Fraunces + Inter, Reach → Revenue mark (tokens in `src/tokens.css`).

Live site: https://mahmoudbahaa.com (also https://www.mahmoudbahaa.com)

## Deploy
Hosted free on **Cloudflare Pages** (project `mahmoud-bahaa`), connected to this repo.
Every push to `main` rebuilds and publishes automatically — usually live within a minute.
Build settings: `npm run build` → `dist`, `NODE_VERSION=20`.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

## Where things live
| What | File |
|---|---|
| All copy (from the content doc) | `src/content.js` |
| Hero + typing growth board (words in `heroBoard`) | `src/components/Hero.jsx`, `TypingBoard.jsx` |
| Tilt cards (Who I help, What I do) | `ui/TiltCard.jsx`, `WhoIHelp.jsx`, `FeatureCards.jsx` |
| Performance pipeline, Method, Measurement, Experience | matching files in `src/components/` |
| Sponsorship showcase (scroll-pinned, 3 zones) | `SponsorshipShowcase.jsx`, `three/CarCanvas.jsx` |
| Procedural fallback meshes (unused race car, GT, trophy) | `three/Models.jsx` |
| Side progress timeline | `ScrollProgress.jsx` |

## Real cars (photo cutouts)
Zones 1 and 2 use the real car photos, background removed: `public/models/redbull-car.png`
and `public/models/aston-car.png` (rendered by `three/PhotoCar.jsx`; wheel positions and
ground line per photo live in its `CARS` table). Motion is a drive-in on scroll, motion-blur ghosts,
spinning wheel blur on the two near wheels, speed streaks and body pitch/shake.
To replace either with a true 3D model, swap `<PhotoCar>` for `<ModelSlot id="redbull">` in `CarCanvas.jsx`.

## UAE Pro League goal animation
`three/GoalScene.jsx`: a stylised player in brand-teal kit (no club colours) runs up, strikes
into the top corner, the net bulges, confetti bursts and the stadium lights flare, then the
player celebrates and jogs back. The ~6 s loop restarts each time the zone comes on stage.
Timing lives in the `T` table; positions in `START`, `SPOT`, `TARGET`.

## 3D assets (GLB / GLTF)
1. Put licensed files in `public/models/` (e.g. `public/models/race-car.glb`).
2. Set the path in `src/components/three/assets.js` (`MODELS.redbull.path = '/models/race-car.glb'`).
3. Tune `scale`, `rotation`, `yOffset`: model sits on y = 0, ~4–5 units long.
   Race car nose → −x, GT car nose → +x, trophy upright.
4. Compress first: `npx @gltf-transform/cli optimize in.glb out.glb`.

If a path is `null` or the file fails to load, the procedural mesh is used.
Team / league logos on models need written permission (brand rule).

## Performance
- Both canvases stop rendering when scrolled out of view.
- Phones / ≤4-core / no-WebGL2: fewer particles and streaks, no shadows, lower DPR.
- `prefers-reduced-motion`: Lenis off, CSS animations cut.
