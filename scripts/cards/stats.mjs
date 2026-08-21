import { THEMES, FONT, MONO, BASE_MOTION, esc } from '../theme.mjs'

const W = 1000
const H = 236
const PAD = 24
const GAP = 14

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n))

export function stats(theme, d) {
  const t = THEMES[theme]
  const tiles = [
    { v: fmt(d.lifetime), label: 'Contributions', sub: 'all time', c: t.cyan },
    { v: fmt(d.year.commits), label: 'Commits', sub: 'last 12 months', c: t.indigo },
    { v: String(d.mergedPRs), label: 'Merged PRs', sub: `${d.externalMergedPRs} upstream`, c: t.violet },
    { v: String(d.repoCount), label: 'Repositories', sub: `${d.contributedRepos} active`, c: t.cyan },
    { v: String(d.activeWeeks), label: 'Active weeks', sub: `of ${d.weekCount}`, c: t.green },
    {
      v: String(d.languages.length),
      label: 'Languages',
      sub: d.languages[0] ? `${d.languages[0].name} ${d.languages[0].pct.toFixed(0)}%` : 'in use',
      c: t.amber,
    },
  ]
  const inner = W - PAD * 2
  const tw = (inner - GAP * (tiles.length - 1)) / tiles.length

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub activity summary for ${esc(d.login)}">
<title>GitHub activity — ${d.lifetime} contributions, ${d.mergedPRs} merged pull requests</title>
<defs>
  <linearGradient id="sbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.bg}"/><stop offset="100%" stop-color="${t.bgAlt}"/></linearGradient>
  <radialGradient id="sglow"><stop offset="0%" stop-color="${t.violet}" stop-opacity="${t.glowOpacity * 0.55}"/><stop offset="100%" stop-color="${t.violet}" stop-opacity="0"/></radialGradient>
  <pattern id="sdots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r="1.2" fill="${t.grid}" fill-opacity="${t.gridOpacity}"/></pattern>
  <clipPath id="sframe"><rect width="${W}" height="${H}" rx="14"/></clipPath>
  <style>
    ${BASE_MOTION}
    @keyframes grow { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    .t { font-family:${FONT}; } .m { font-family:${MONO}; }
    .bar { transform-origin:left center; animation:grow .9s cubic-bezier(.22,.8,.3,1) forwards; transform:scaleX(0); }
    .sglow { animation:drift2 21s ease-in-out infinite; }
  </style>
</defs>
<g clip-path="url(#sframe)">
  <rect width="${W}" height="${H}" fill="url(#sbg)"/>
  <ellipse class="sglow" cx="${W - 60}" cy="20" rx="300" ry="170" fill="url(#sglow)"/>
  <rect width="${W}" height="${H}" fill="url(#sdots)"/>

  <text class="t" x="${PAD}" y="38" font-size="15" font-weight="700" fill="${t.text}">Engineering activity</text>
  <text class="m" x="${W - PAD}" y="38" text-anchor="end" font-size="10.5" letter-spacing="1.4" fill="${t.faint}">SELF-HOSTED · ${esc(d.generatedAt.slice(0, 10))}</text>
  <rect x="${PAD}" y="52" width="${inner}" height="1" fill="${t.borderSoft}"/>

  ${tiles
    .map((tile, i) => {
      const x = PAD + i * (tw + GAP)
      const delay = 0.08 + i * 0.07
      // The translate lives on an outer <g>: a CSS transform on the same element
      // would override the attribute and stack every tile at the origin.
      return `<g transform="translate(${x.toFixed(1)},72)"><g class="rise" style="animation-delay:${delay.toFixed(2)}s">
    <rect width="${tw.toFixed(1)}" height="132" rx="11" fill="${t.panel}" stroke="${t.border}"/>
    <rect class="bar" x="0" y="0" width="${tw.toFixed(1)}" height="2.5" rx="1.25" fill="${tile.c}" style="animation-delay:${(delay + 0.15).toFixed(2)}s"/>
    <text class="t" x="16" y="62" font-size="34" font-weight="800" fill="${t.textStrong}" letter-spacing="-1">${esc(tile.v)}</text>
    <text class="t" x="16" y="88" font-size="12.5" font-weight="600" fill="${tile.c}">${esc(tile.label)}</text>
    <text class="m" x="16" y="108" font-size="10.5" fill="${t.muted}">${esc(tile.sub)}</text>
  </g></g>`
    })
    .join('\n  ')}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${t.border}"/>
</g>
</svg>`
}
