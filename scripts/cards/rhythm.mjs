import { THEMES, fonts, MOTION, EASE } from '../theme.mjs'

const W = 490
const H = 272
const PAD = 28
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Seven columns, Monday first. The busiest day is the only crimson one.
export function rhythm(theme, d) {
  const t = THEMES[theme]
  const totals = Array(7).fill(0)
  for (const day of d.days) totals[day.weekday] += day.count
  const order = [1, 2, 3, 4, 5, 6, 0]
  const max = Math.max(...totals, 1)
  const sum = totals.reduce((a, b) => a + b, 0)
  const peak = totals.indexOf(max)

  const base = H - 44
  const maxH = 118
  const slot = (W - PAD * 2) / 7
  const bw = slot - 22

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Contributions by weekday, busiest on ${FULL[peak]}">
<title>${sum} contributions in the last 12 months, busiest on ${FULL[peak]}</title>
<defs>
  <style>
    ${fonts('regular', 'semibold', 'condensed')}
    ${MOTION}
    .col { animation:rise .9s ${EASE} both; }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<text class="semibold" x="${PAD}" y="42" font-size="17" fill="${t.inkStrong}">Weekly rhythm</text>
<text class="regular" x="${PAD}" y="62" font-size="12.5" fill="${t.muted}">${sum} contributions in the last 12 months, most on ${FULL[peak]}s</text>
<rect x="${PAD}" y="${base}" width="${W - PAD * 2}" height="1" fill="${t.ruleStrong}"/>
${order
  .map((day, i) => {
    const v = totals[day]
    const h = Math.max((v / max) * maxH, 2)
    const x = PAD + i * slot + 11
    const hot = day === peak
    return `<g>
  <rect class="col" x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${hot ? t.accent : t.ink}" style="transform-origin:0 ${base}px; animation-delay:${(0.1 + i * 0.06).toFixed(2)}s"/>
  <text class="condensed in" x="${(x + bw / 2).toFixed(1)}" y="${(base - h - 8).toFixed(1)}" text-anchor="middle" font-size="13" fill="${hot ? t.accent : t.muted}" style="animation-delay:.7s">${v}</text>
  <text class="${hot ? 'semibold' : 'regular'}" x="${(x + bw / 2).toFixed(1)}" y="${base + 22}" text-anchor="middle" font-size="12.5" fill="${hot ? t.inkStrong : t.muted}">${DAYS[day]}</text>
</g>`
  })
  .join('\n')}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${t.rule}"/>
</svg>`
}
