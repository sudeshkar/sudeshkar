import { THEMES, FONT, MONO, BASE_MOTION, esc } from '../theme.mjs'

const W = 480
const H = 238
const PAD = 22
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function rhythm(theme, d) {
  const t = THEMES[theme]
  const totals = Array(7).fill(0)
  for (const day of d.days) totals[day.weekday] += day.count
  const max = Math.max(...totals, 1)
  const sum = totals.reduce((a, b) => a + b, 0)
  const peak = totals.indexOf(max)

  const cx = 116
  const cy = 138
  const r0 = 26
  const rMax = 74
  const ramp = [t.cyan, t.indigo, t.violet]
  // Rank-based rather than share-based: with seven values clustered near the top,
  // a straight v/max split would paint five of them the same colour.
  const rank = new Map(
    [...totals.keys()].sort((a, b) => totals[a] - totals[b]).map((day, i) => [day, i]),
  )
  const colorFor = (v, i) => ramp[Math.min(2, Math.floor((rank.get(i) ?? 0) / 7 * 3))]

  const spokes = totals.map((v, i) => {
    const a = ((-90 + i * (360 / 7)) * Math.PI) / 180
    const len = r0 + Math.max((v / max) * (rMax - r0), 3)
    return {
      i,
      v,
      color: colorFor(v, i),
      x1: cx + Math.cos(a) * r0,
      y1: cy + Math.sin(a) * r0,
      x2: cx + Math.cos(a) * len,
      y2: cy + Math.sin(a) * len,
      len: len - r0,
      lx: cx + Math.cos(a) * (rMax + 14),
      ly: cy + Math.sin(a) * (rMax + 14) + 3.5,
    }
  })

  const listX = 232
  const listW = W - PAD - listX

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Contributions by weekday">
<title>Contribution rhythm — busiest on ${DAYS[peak]}</title>
<defs>
  <linearGradient id="rbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.bg}"/><stop offset="100%" stop-color="${t.bgAlt}"/></linearGradient>
  <radialGradient id="rglow"><stop offset="0%" stop-color="${t.indigo}" stop-opacity="${t.glowOpacity * 0.5}"/><stop offset="100%" stop-color="${t.indigo}" stop-opacity="0"/></radialGradient>
  <pattern id="rdots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r="1.2" fill="${t.grid}" fill-opacity="${t.gridOpacity}"/></pattern>
  <clipPath id="rframe"><rect width="${W}" height="${H}" rx="14"/></clipPath>
  <style>
    ${BASE_MOTION}
    @keyframes growLine { to { stroke-dashoffset:0; } }
    @keyframes growX { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    .t { font-family:${FONT}; } .m { font-family:${MONO}; }
    .spoke { animation:growLine .95s cubic-bezier(.22,.8,.3,1) forwards; }
    .rglow { animation:drift 16s ease-in-out infinite; }
    .guide { animation:spin 60s linear infinite; transform-origin:${cx}px ${cy}px; }
  </style>
</defs>
<g clip-path="url(#rframe)">
  <rect width="${W}" height="${H}" fill="url(#rbg)"/>
  <ellipse class="rglow" cx="${cx}" cy="${cy}" rx="190" ry="150" fill="url(#rglow)"/>
  <rect width="${W}" height="${H}" fill="url(#rdots)"/>

  <text class="t" x="${PAD}" y="34" font-size="14" font-weight="700" fill="${t.text}">Weekly rhythm</text>
  <text class="m" x="${W - PAD}" y="34" text-anchor="end" font-size="10" letter-spacing="1.2" fill="${t.faint}">LAST 12 MONTHS</text>
  <rect x="${PAD}" y="46" width="${W - PAD * 2}" height="1" fill="${t.borderSoft}"/>

  <g class="guide" opacity="0.6">
    ${[38, 54, 70]
      .map(
        (r) =>
          `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.border}" stroke-width="1" stroke-dasharray="2 6"/>`,
      )
      .join('\n    ')}
  </g>
  ${spokes
    .map(
      (s, i) =>
        `<line class="spoke" x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}" x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}"
    stroke="${s.color}" stroke-width="15" stroke-linecap="round"
    stroke-dasharray="${s.len.toFixed(1)}" stroke-dashoffset="${s.len.toFixed(1)}" style="animation-delay:${(0.12 + i * 0.07).toFixed(2)}s"/>`,
    )
    .join('\n  ')}
  ${spokes
    .map(
      (s) =>
        `<text class="m fade" x="${s.lx.toFixed(1)}" y="${s.ly.toFixed(1)}" text-anchor="middle" font-size="9" fill="${t.muted}" style="animation-delay:.8s">${DAYS[s.i][0]}</text>`,
    )
    .join('\n  ')}
  <circle cx="${cx}" cy="${cy}" r="19" fill="${t.panelAlt}" stroke="${t.border}"/>
  <text class="t fade" x="${cx}" y="${cy + 1}" text-anchor="middle" font-size="13" font-weight="800" fill="${t.textStrong}" style="animation-delay:.9s">${sum}</text>
  <text class="m fade" x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="7.5" letter-spacing="0.6" fill="${t.muted}" style="animation-delay:.9s">TOTAL</text>

  ${totals
    .map((v, i) => {
      const y = 72 + i * 22
      const bw = Math.max((v / max) * (listW - 46), 2)
      return `<g class="rise" style="animation-delay:${(0.2 + i * 0.05).toFixed(2)}s">
    <text class="m" x="${listX}" y="${y + 4}" font-size="10.5" font-weight="${i === peak ? 700 : 400}" fill="${i === peak ? t.text : t.muted}">${DAYS[i]}</text>
    <rect x="${listX + 32}" y="${y - 4}" width="${(listW - 46).toFixed(1)}" height="7" rx="3.5" fill="${t.cellEmpty}"/>
    <rect x="${listX + 32}" y="${y - 4}" width="${bw.toFixed(1)}" height="7" rx="3.5" fill="${colorFor(v, i)}"
      style="transform-origin:${listX + 32}px 0; transform:scaleX(0); animation:growX .8s cubic-bezier(.22,.8,.3,1) forwards; animation-delay:${(0.28 + i * 0.05).toFixed(2)}s"/>
    <text class="m" x="${W - PAD}" y="${y + 4}" text-anchor="end" font-size="10" fill="${t.faint}">${v}</text>
  </g>`
    })
    .join('\n  ')}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${t.border}"/>
</g>
</svg>`
}
