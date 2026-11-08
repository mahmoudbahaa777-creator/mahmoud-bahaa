// Bakes the rendered page into dist/index.html after `vite build`.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dist = resolve('dist/index.html')
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const html = readFileSync(dist, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error('root placeholder not found')
writeFileSync(dist, html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`))
rmSync(resolve('dist-ssr'), { recursive: true, force: true })
console.log('prerendered dist/index.html')
