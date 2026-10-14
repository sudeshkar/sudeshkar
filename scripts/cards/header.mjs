import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CRIMSON as C, fonts, MOTION, EASE, esc } from '../theme.mjs'

// GitHub renders this SVG through <img> in a sandbox that blocks every external
// fetch, so the portrait travels inside the file. If it is ever missing, the name
// simply runs the full width of the field on its own.
const PORTRAIT = (() => {
  try {
    const file = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'portrait-cutout.webp')
    return `data:image/webp;base64,${readFileSync(file).toString('base64')}`
  } catch {
    return null
  }
})()

const W = 1000
const H = 320
// The cut-out is 560 x 554; it stands on the bottom edge, flush right, so the
// shoulder the photo slices off on that side disappears into the frame edge.
const PH = 300
const PW = Math.round((560 / 554) * PH)
const PX = W - PW
const PY = H - PH

// The poster is the same in both themes: the crimson field is the identity, and it
// holds up against GitHub's white and its near-black alike.
export function header(_theme, data) {
  const surname = (data.name || 'Sathieskumar Sudeshkar').split(' ').pop().toUpperCase()
  const given = (data.name || 'Sathieskumar Sudeshkar').split(' ').slice(0, -1).join(' ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(data.name)}, full-stack software engineer in Sri Lanka">
<title>${esc(data.name)}, full-stack software engineer in Sri Lanka</title>
<defs>
  <clipPath id="field"><rect width="${W}" height="${H}"/></clipPath>
  <linearGradient id="edgeFade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.09" stop-color="#fff" stop-opacity="1"/>
  </linearGradient>
  <mask id="cutTop" maskUnits="userSpaceOnUse" x="${PX}" y="${PY}" width="${PW}" height="${PH}">
    <rect x="${PX}" y="${PY}" width="${PW}" height="${PH * 0.55 + 1}" fill="#fff"/>
    <rect x="${PX}" y="${PY + PH * 0.55}" width="${PW}" height="${PH * 0.45}" fill="url(#edgeFade)"/>
  </mask>
  <style>
    ${fonts('display', 'regular', 'semibold')}
    ${MOTION}
    .name { animation:up 1.1s ${EASE} .1s both; }
    .portrait { animation:in 1.2s ${EASE} .45s both; }
  </style>
</defs>
<g clip-path="url(#field)">
  <rect width="${W}" height="${H}" fill="${C.field}"/>

  <text class="semibold in" x="48" y="64" font-size="22" fill="${C.bone}" style="animation-delay:.05s">${esc(given)}</text>
  <text class="regular in" x="48" y="112" font-size="30" fill="${C.bone}" letter-spacing="-0.4" style="animation-delay:.2s">I build backends that</text>
  <text class="regular in" x="48" y="148" font-size="30" fill="${C.bone}" letter-spacing="-0.4" style="animation-delay:.2s">survive production.</text>
  <text class="regular in" x="48" y="184" font-size="15" fill="${C.cream}" fill-opacity="0.82" style="animation-delay:.35s">Full-stack engineer in Sri Lanka, working in Java, Spring Boot, C# and React.</text>

  <g>
    <text class="display name" x="40" y="${H + 6}" font-size="154" fill="${C.ink}" letter-spacing="-1">${esc(surname)}</text>
  </g>

  ${
    PORTRAIT
      ? `<g class="portrait"><image href="${PORTRAIT}" x="${PX}" y="${PY}" width="${PW}" height="${PH}" mask="url(#cutTop)" preserveAspectRatio="xMaxYMax meet"/></g>`
      : ''
  }
</g>
</svg>`
}
