import { THEMES, FONT, MONO, BASE_MOTION, esc } from '../theme.mjs'

const W = 480
const H = 238
const PAD = 22
const TOP = 8

// GitHub's own language colours are used when the API supplies one; these are the
// fallbacks for the handful that come back null.
const FALLBACK = ['#22d3ee', '#a78bfa', '#818cf8', '#3fb950', '#d29922', '#f778ba', '#79c0ff', '#ff7b72']

export function languages(theme, d) {
  const t = THEMES[theme]
  const top = d.languages.slice(0, TOP)
  const rest = d.languages.slice(TOP)
  const restPct = rest.reduce((a, l) => a + l.pct, 0)
  const rows = top.map((l, i) => ({ ...l, color: l.color || FALLBACK[i % FALLBACK.length] }))
  if (restPct > 0.05) rows.push({ name: 'Other', pct: restPct, color: t.faint })

  const cols = 2
  const lines = Math.ceil(rows.length / cols)
  const listTop = 104
  const rowH = Math.min(30, Math.max(22, (H - listTop - PAD + 8) / lines))
  const barW = W - PAD * 2
  const colW = barW / cols

  let cursor = 0
  const segments = rows.map((l) => {
    const w = Math.max((l.pct / 100) * barW, 1.5)
    const seg = { x: cursor, w, color: l.color }
    cursor += w
    return seg
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Most used languages">
<title>Language mix across ${d.repoCount} public repositories</title>
<defs>
  <linearGradient id="lbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.bg}"/><stop offset="100%" stop-color="${t.bgAlt}"/></linearGradient>
  <clipPath id="lframe"><rect width="${W}" height="${H}" rx="14"/></clipPath>
  <clipPath id="barclip"><rect x="${PAD}" y="66" width="${barW}" height="12" rx="6"/></clipPath>
  <pattern id="ldots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r="1.2" fill="${t.grid}" fill-opacity="${t.gridOpacity}"/></pattern>
  <style>
    ${BASE_MOTION}
    @keyframes growX { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    .t { font-family:${FONT}; } .m { font-family:${MONO}; }
    .seg { transform-origin:${PAD}px 0; transform:scaleX(0); animation:growX 1.1s cubic-bezier(.22,.8,.3,1) forwards; }
    .shine { animation:sweep 4.5s cubic-bezier(.4,0,.2,1) 1.2s infinite; }
  </style>
</defs>
<g clip-path="url(#lframe)">
  <rect width="${W}" height="${H}" fill="url(#lbg)"/>
  <rect width="${W}" height="${H}" fill="url(#ldots)"/>
  <text class="t" x="${PAD}" y="34" font-size="14" font-weight="700" fill="${t.text}">Language mix</text>
  <text class="m" x="${W - PAD}" y="34" text-anchor="end" font-size="10" letter-spacing="1.2" fill="${t.faint}">BY BYTES · ${d.repoCount} REPOS · EXCL. NOTEBOOKS</text>
  <rect x="${PAD}" y="46" width="${barW}" height="1" fill="${t.borderSoft}"/>

  <rect x="${PAD}" y="66" width="${barW}" height="12" rx="6" fill="${t.cellEmpty}"/>
  <g clip-path="url(#barclip)">
    ${segments
      .map(
        (s, i) =>
          `<rect class="seg" x="${(PAD + s.x).toFixed(2)}" y="66" width="${s.w.toFixed(2)}" height="12" fill="${s.color}" style="transform-origin:${(PAD + s.x).toFixed(2)}px 0; animation-delay:${(0.1 + i * 0.06).toFixed(2)}s"/>`,
      )
      .join('\n    ')}
    <rect class="shine" x="${PAD}" y="66" width="70" height="12" fill="#ffffff" fill-opacity="0.16"/>
  </g>

  ${rows
    .map((l, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = PAD + col * colW
      const y = listTop + row * rowH
      return `<g class="rise" style="animation-delay:${(0.24 + i * 0.05).toFixed(2)}s">
    <circle cx="${x + 5}" cy="${y - 4}" r="5" fill="${l.color}"/>
    <text class="t" x="${x + 18}" y="${y}" font-size="12" font-weight="600" fill="${t.text}">${esc(l.name)}</text>
    <text class="m" x="${x + colW - 26}" y="${y}" text-anchor="end" font-size="11" fill="${t.muted}">${l.pct.toFixed(1)}%</text>
  </g>`
    })
    .join('\n  ')}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${t.border}"/>
</g>
</svg>`
}
