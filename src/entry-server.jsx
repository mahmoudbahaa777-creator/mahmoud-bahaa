import { renderToString } from 'react-dom/server'
import App from './App.jsx'

/** Used at build time only (scripts/prerender.mjs): the page's HTML, so phones see it before any JS runs. */
export const render = () => renderToString(<App />)
