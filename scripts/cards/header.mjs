import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIELD as C, fonts, MOTION, EASE, esc } from '../theme.mjs'

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

// The animated snake monogram (baked from the portfolio's hover animation) takes
// the place of the S that starts the surname. It is set inline rather than as an
// <image>: an SVG drawn as an image inside another SVG is frozen on its first
// frame, while inline its animation runs. Its ids get a prefix so they cannot
// collide with the header's own; an underscore, not a hyphen, because SMIL reads
// a hyphen inside a begin value such as "x-run.end" as a minus sign. If the file is missing, the name is set in
// full as before.
const SNAKE = (() => {
  try {
    const file = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'snake-logo.svg')
    const svg = readFileSync(file, 'utf8')
    const inner = svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'))
    return inner
      .replace(/<title>[\s\S]*?<\/title>/, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/id="([\w-]+)"/g, 'id="sn_$1"')
      .replace(/url\(#([\w-]+)\)/g, 'url(#sn_$1)')
      .replace(/href="#([\w-]+)"/g, 'href="#sn_$1"')
      .replace(/\brun\.(begin|end)/g, 'sn_run.$1')
  } catch {
    return null
  }
})()

const W = 1000
const H = 320
const BASELINE = H - 20
// Archivo display metrics, as fractions of the font size: capital height, and
// the side bearings of S (left) and U (left).
const CAP = 97 / 140
const S_BEARING = 3 / 140
const U_BEARING = 4 / 140
const MONOGRAM_RATIO = 256 / 250 // the monogram tile, width over height
const MONOGRAM_GAP = 8
// The cut-out is 560 x 554; it stands on the bottom edge, flush right, so the
// shoulder the photo slices off on that side disappears into the frame edge.
const PH = 300
const PW = Math.round((560 / 554) * PH)
const PX = W - PW
const PY = H - PH

// The surname along the bottom. With the monogram, its S is the snake tile, as
// tall as the capitals and standing on the same baseline, and the name is set a
// little smaller so it still ends where the full name did, clear of the portrait.
function surnameMark(surname) {
  if (!SNAKE || !surname.startsWith('S')) {
    return `<g>
    <text class="display name" x="44" y="${BASELINE}" font-size="140" fill="${C.peach}" letter-spacing="-1">${esc(surname)}</text>
  </g>`
  }
  const size = 130
  const cap = CAP * size
  const tileH = cap
  const tileW = tileH * MONOGRAM_RATIO
  const tileX = 44 + S_BEARING * size
  const restX = tileX + tileW + MONOGRAM_GAP - U_BEARING * size
  const f = (n) => Math.round(n * 10) / 10
  return `<g class="name">
    <svg x="${f(tileX)}" y="${f(BASELINE - tileH)}" width="${f(tileW)}" height="${f(tileH)}" viewBox="0 0 256 250">${SNAKE}</svg>
    <text class="display" x="${f(restX)}" y="${BASELINE}" font-size="${size}" fill="${C.peach}" letter-spacing="-1">${esc(surname.slice(1))}</text>
  </g>`
}

// The poster is the same in both themes: the warm dark field and peach name are the
// identity, and they hold up against GitHub's white and its near-black alike.
export function header(_theme, data) {
  const surname = (data.name || 'Sathieskumar Sudeshkar').split(' ').pop().toUpperCase()
  const given = (data.name || 'Sathieskumar Sudeshkar').split(' ').slice(0, -1).join(' ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(data.name)}, full-stack software engineer in Sri Lanka">
<title>${esc(data.name)}, full-stack software engineer in Sri Lanka</title>
<defs>
  <clipPath id="field"><rect width="${W}" height="${H}" rx="22" ry="22"/></clipPath>
  <radialGradient id="warm" cx="0.72" cy="0.45" r="0.75">
    <stop offset="0" stop-color="${C.glow}"/>
    <stop offset="0.55" stop-color="${C.mid}"/>
    <stop offset="1" stop-color="${C.edge}"/>
  </radialGradient>
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
  <rect width="${W}" height="${H}" fill="url(#warm)"/>

  <text class="semibold in" x="48" y="64" font-size="22" fill="${C.bone}" style="animation-delay:.05s">${esc(given)}</text>
  <text class="regular in" x="48" y="112" font-size="30" fill="${C.bone}" letter-spacing="-0.4" style="animation-delay:.2s">I build backends that</text>
  <text class="regular in" x="48" y="148" font-size="30" fill="${C.bone}" letter-spacing="-0.4" style="animation-delay:.2s">survive production.</text>
  <text class="regular in" x="48" y="184" font-size="15" fill="${C.paper}" fill-opacity="0.82" style="animation-delay:.35s">Full-stack engineer in Sri Lanka, working in Java, Spring Boot, C# and React.</text>

  ${surnameMark(surname)}

  ${
    PORTRAIT
      ? `<g class="portrait"><image href="${PORTRAIT}" x="${PX}" y="${PY}" width="${PW}" height="${PH}" mask="url(#cutTop)" preserveAspectRatio="xMaxYMax meet"/></g>`
      : ''
  }
</g>
</svg>`
}
