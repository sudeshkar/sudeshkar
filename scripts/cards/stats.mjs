import { THEMES, fonts, MOTION, EASE, esc, fmt } from '../theme.mjs'

const W = 1000
const H = 176
const PAD = 32

// A ledger, not a dashboard: five figures set in the condensed display face, divided
// by hairlines. Merged pull requests carry the accent because they are the figures
// that went somewhere else and were accepted.
export function stats(theme, d) {
  const t = THEMES[theme]
  const owners = new Set((d.externalPRs || []).map((p) => p.repository.owner.login))
  const upstream =
    owners.size === 1 ? `all upstream, to ${[...owners][0] === 'openmrs' ? 'OpenMRS' : [...owners][0]}` : `${d.externalMergedPRs} upstream`
  const cols = [
    { v: fmt(d.lifetime), label: 'contributions', sub: 'since joining GitHub' },
    { v: String(d.mergedPRs), label: 'merged pull requests', sub: upstream, accent: true },
    { v: fmt(d.year.commits), label: 'commits', sub: 'in the last 12 months' },
    { v: String(d.activeWeeks), label: 'active weeks', sub: `out of the last ${d.weekCount}` },
    { v: String(d.repoCount), label: 'public repositories', sub: `${d.languages.length} languages between them` },
  ]
  const cw = (W - PAD * 2) / cols.length

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub activity for ${esc(d.login)}">
<title>${d.lifetime} contributions, ${d.mergedPRs} merged pull requests, ${d.year.commits} commits in the last year</title>
<defs>
  <style>
    ${fonts('display', 'regular', 'semibold')}
    ${MOTION}
    .bar { transform-origin:0 0; animation:grow 1.1s ${EASE} both; }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<rect class="bar" width="${W}" height="4" fill="${t.accent}"/>
${cols
  .map((c, i) => {
    const x = PAD + i * cw
    return `<g class="in" style="animation-delay:${(0.12 + i * 0.08).toFixed(2)}s">
  ${i ? `<rect x="${(x - 1).toFixed(1)}" y="40" width="1" height="${H - 72}" fill="${t.rule}"/>` : ''}
  <text class="display" x="${(x + (i ? 22 : 0)).toFixed(1)}" y="98" font-size="62" letter-spacing="-1" fill="${c.accent ? t.accent : t.inkStrong}">${esc(c.v)}</text>
  <text class="semibold" x="${(x + (i ? 22 : 0)).toFixed(1)}" y="122" font-size="14" fill="${t.ink}">${esc(c.label)}</text>
  <text class="regular" x="${(x + (i ? 22 : 0)).toFixed(1)}" y="141" font-size="12.5" fill="${t.muted}">${esc(c.sub)}</text>
</g>`
  })
  .join('\n')}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${t.rule}"/>
</svg>`
}
