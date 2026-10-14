import { THEMES, fonts, MOTION, EASE, esc } from '../theme.mjs'

const W = 490
const H = 272
const PAD = 28
const TOP = 6

// One measure per language: a hairline track with the share drawn over it. Only the
// leading language is in crimson; the rest stay in ink so the order reads at a glance.
export function languages(theme, d) {
  const t = THEMES[theme]
  const rows = d.languages.slice(0, TOP).map((l) => ({ name: l.name, pct: l.pct }))
  const restPct = d.languages.slice(TOP).reduce((a, l) => a + l.pct, 0)
  if (restPct > 0.05) rows.push({ name: 'Everything else', pct: restPct, rest: true })

  const trackW = W - PAD * 2
  const max = Math.max(...rows.map((r) => r.pct), 1)
  const top = 84
  const rowH = (H - top - 18) / rows.length

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Languages by bytes across ${d.repoCount} public repositories">
<title>Languages: ${rows.map((r) => `${r.name} ${r.pct.toFixed(1)}%`).join(', ')}</title>
<defs>
  <style>
    ${fonts('regular', 'semibold', 'condensed')}
    ${MOTION}
    .share { animation:grow 1s ${EASE} both; }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<text class="semibold" x="${PAD}" y="42" font-size="17" fill="${t.inkStrong}">Languages</text>
<text class="regular" x="${PAD}" y="62" font-size="12.5" fill="${t.muted}">Share of code by bytes, ${d.repoCount} public repositories</text>
${rows
  .map((r, i) => {
    const y = top + i * rowH
    const w = Math.max((r.pct / max) * trackW, 2)
    const fill = i === 0 ? t.accent : r.rest ? t.ruleStrong : t.ink
    return `<g class="in" style="animation-delay:${(0.1 + i * 0.06).toFixed(2)}s">
  <text class="regular" x="${PAD}" y="${(y + 14).toFixed(1)}" font-size="13.5" fill="${r.rest ? t.muted : t.ink}">${esc(r.name)}</text>
  <text class="condensed" x="${W - PAD}" y="${(y + 14).toFixed(1)}" text-anchor="end" font-size="14" fill="${i === 0 ? t.accent : t.ink}">${r.pct.toFixed(1)}%</text>
  <rect x="${PAD}" y="${(y + 21).toFixed(1)}" width="${trackW}" height="1" fill="${t.rule}"/>
  <rect class="share" x="${PAD}" y="${(y + 20).toFixed(1)}" width="${w.toFixed(1)}" height="3" fill="${fill}" style="transform-origin:${PAD}px 0; animation-delay:${(0.2 + i * 0.06).toFixed(2)}s"/>
</g>`
  })
  .join('\n')}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${t.rule}"/>
</svg>`
}
