import { navSections } from '../../content'

/*
 * The Reach → Revenue route: one teal line running down the page in the left
 * gutter, drawn as you scroll, with a station at the start of each section.
 * Each section renders its own stretch (so it works with the stacked sheets);
 * together they read as one continuous route. Styles: index.css ("Route").
 *
 *   <Route id="performance" />            station named from navSections
 *   <Route id="services" kind="start" />  first station: "Reach · What I do"
 *   <Route kind="end" />                  last station: "Revenue"
 *   <Route kind="pass" />                 line only, no station
 */
export default function Route({ id, kind = 'stop' }) {
  const name = navSections.find((n) => n.id === id)?.label
  const label = kind === 'end' ? 'Revenue' : kind === 'start' ? `Reach · ${name}` : name
  return (
    <>
      <span aria-hidden className={`route-line ${kind === 'end' ? 'route-line-end' : ''}`} />
      {kind !== 'pass' && (
        <span aria-hidden className={`route-stop route-${kind}`}>
          <span className="route-dot" />
          <span className="route-tick" />
          <span className="route-label">{label}</span>
        </span>
      )}
    </>
  )
}
