import { THEMES, fonts, MOTION, EASE, esc } from '../theme.mjs'

const W = 1000
const PAD = 32
const CELL = 13
const STEP = 16.6
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYNAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function level(count, max) {
  if (count <= 0) return 0
  const q = count / Math.max(max, 1)
  if (q > 0.66) return 4
  if (q > 0.33) return 3
  if (q > 0.12) return 2
  return 1
}

export function activity(theme, d) {
  const t = THEMES[theme]

  // Column = week, row = weekday.
  const weeks = []
  let col = null
  for (const day of d.days) {
    if (day.weekday === 0 || col === null) {
      col = { days: Array(7).fill(null), date: day.date }
      weeks.push(col)
    }
    col.days[day.weekday] = day
  }
  const max = d.days.reduce((a, x) => Math.max(a, x.count), 0)
  const gridW = weeks.length * STEP
  const originX = W - PAD - gridW + (STEP - CELL)
  const originY = 104
  const H = Math.round(originY + 7 * STEP + 40)

  const monthLabels = []
  let lastMonth = -1
  weeks.forEach((wk, i) => {
    const m = new Date(wk.date + 'T00:00:00Z').getUTCMonth()
    if (m !== lastMonth && i < weeks.length - 2) {
      monthLabels.push({ x: originX + i * STEP, label: MONTHS[m] })
      lastMonth = m
    }
  })

  const byWeekday = Array(7).fill(0)
  for (const day of d.days) byWeekday[day.weekday] += day.count
  const busiest = DAYNAMES[byWeekday.indexOf(Math.max(...byWeekday))]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Contribution calendar: ${d.year.total} contributions in the last year">
<title>${d.year.total} contributions in the last year, current streak ${d.current} days, longest ${d.longest}</title>
<defs>
  <style>
    ${fonts('regular', 'semibold', 'display')}
    ${MOTION}
    .sweep { animation:in .5s ${EASE} both; }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<text class="semibold" x="${PAD}" y="42" font-size="17" fill="${t.inkStrong}">Contribution calendar</text>
<text class="regular" x="${PAD}" y="62" font-size="12.5" fill="${t.muted}">The last 12 months, busiest on ${busiest}s</text>

<g class="in" style="animation-delay:.2s">
  <text class="display" x="${W - PAD}" y="58" text-anchor="end" font-size="40" fill="${t.accent}">${d.year.total}</text>
  <text class="regular" x="${W - PAD}" y="76" text-anchor="end" font-size="12.5" fill="${t.muted}">contributions, longest streak ${d.longest} days</text>
</g>

${monthLabels
  .map((m) => `<text class="regular" x="${m.x.toFixed(1)}" y="${originY - 10}" font-size="11" fill="${t.muted}">${m.label}</text>`)
  .join('\n')}
${[1, 3, 5]
  .map(
    (wd) =>
      `<text class="regular" x="${originX - 8}" y="${(originY + wd * STEP + CELL - 2.5).toFixed(1)}" text-anchor="end" font-size="11" fill="${t.muted}">${DAYNAMES[wd].slice(0, 3)}</text>`,
  )
  .join('\n')}
${weeks
  .map((wk, wi) => {
    // Each week column fades in left to right: the year reads as it fills.
    const cells = wk.days
      .map((day, di) => {
        if (!day) return ''
        const lv = level(day.count, max)
        const fill = lv === 0 ? t.empty : t.ramp[lv - 1]
        return `<rect x="${(originX + wi * STEP).toFixed(1)}" y="${(originY + di * STEP).toFixed(1)}" width="${CELL}" height="${CELL}" fill="${fill}"><title>${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}</title></rect>`
      })
      .join('')
    return `<g class="sweep" style="animation-delay:${(0.15 + wi * 0.012).toFixed(3)}s">${cells}</g>`
  })
  .join('\n')}

<g transform="translate(${(originX - 4).toFixed(1)},${(originY + 7 * STEP + 22).toFixed(1)})">
  <text class="regular" x="0" y="0" font-size="11" fill="${t.muted}">Fewer</text>
  ${[t.empty, ...t.ramp]
    .map((c, i) => `<rect x="${38 + i * 15}" y="-10" width="11" height="11" fill="${c}"/>`)
    .join('')}
  <text class="regular" x="${38 + 5 * 15 + 4}" y="0" font-size="11" fill="${t.muted}">More</text>
</g>
<text class="regular" x="${W - PAD}" y="${(originY + 7 * STEP + 22).toFixed(1)}" text-anchor="end" font-size="11" fill="${t.muted}">Current streak ${esc(d.current)} days</text>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${t.rule}"/>
</svg>`
}
