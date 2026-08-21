import { THEMES, FONT, MONO, BASE_MOTION, esc } from '../theme.mjs'

const W = 1000
const PAD = 24
const CELL = 14
const STEP = 17.3
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const RAMP = {
  dark: ['#0c3644', '#0e7490', '#22d3ee', '#a78bfa'],
  light: ['#cdeef6', '#6cc7db', '#0e7490', '#6d28d9'],
}

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
  const ramp = RAMP[theme]

  // Rebuild the calendar grid: column = week, row = weekday.
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
  const originX = PAD + 30
  const originY = 92
  const H = originY + 7 * STEP + 56

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
  const busiest = byWeekday.indexOf(Math.max(...byWeekday))
  const DAYNAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const facts = [
    [`${d.year.total}`, 'contributions this year'],
    [`${d.current}`, 'day current streak'],
    [`${d.longest}`, 'day longest streak'],
    [DAYNAMES[busiest], 'busiest day'],
  ]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Contribution calendar: ${d.year.total} contributions in the last year">
<title>${d.year.total} contributions in the last year — current streak ${d.current} days, longest ${d.longest}</title>
<defs>
  <linearGradient id="abg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.bg}"/><stop offset="100%" stop-color="${t.bgAlt}"/></linearGradient>
  <radialGradient id="aglow"><stop offset="0%" stop-color="${t.cyan}" stop-opacity="${t.glowOpacity * 0.45}"/><stop offset="100%" stop-color="${t.cyan}" stop-opacity="0"/></radialGradient>
  <pattern id="adots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r="1.2" fill="${t.grid}" fill-opacity="${t.gridOpacity}"/></pattern>
  <clipPath id="aframe"><rect width="${W}" height="${H}" rx="14"/></clipPath>
  <style>
    ${BASE_MOTION}
    @keyframes pop { 0% { opacity:0; transform:scale(.2); } 60% { opacity:1; transform:scale(1.12); } 100% { opacity:1; transform:scale(1); } }
    @keyframes breathe { 0%,100% { opacity:1; } 50% { opacity:.62; } }
    .t { font-family:${FONT}; } .m { font-family:${MONO}; }
    .cell { opacity:0; transform-box:fill-box; transform-origin:center; animation:pop .5s cubic-bezier(.22,1.2,.4,1) forwards; }
    .hot { animation:pop .5s cubic-bezier(.22,1.2,.4,1) forwards, breathe 3.4s ease-in-out infinite 1.6s; }
    .aglow { animation:drift 17s ease-in-out infinite; }
  </style>
</defs>
<g clip-path="url(#aframe)">
  <rect width="${W}" height="${H}" fill="url(#abg)"/>
  <ellipse class="aglow" cx="200" cy="${H}" rx="360" ry="180" fill="url(#aglow)"/>
  <rect width="${W}" height="${H}" fill="url(#adots)"/>

  <text class="t" x="${PAD}" y="36" font-size="15" font-weight="700" fill="${t.text}">Contribution calendar</text>
  <text class="m" x="${W - PAD}" y="36" text-anchor="end" font-size="10.5" letter-spacing="1.4" fill="${t.faint}">GENERATED IN-REPO · NO EXTERNAL API</text>
  <rect x="${PAD}" y="50" width="${W - PAD * 2}" height="1" fill="${t.borderSoft}"/>

  ${monthLabels
    .map(
      (m) =>
        `<text class="m fade" x="${m.x.toFixed(1)}" y="80" font-size="10.5" fill="${t.muted}" style="animation-delay:.2s">${m.label}</text>`,
    )
    .join('\n  ')}
  ${[1, 3, 5]
    .map(
      (wd) =>
        `<text class="m fade" x="${PAD + 22}" y="${(originY + wd * STEP + CELL - 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="${t.muted}" style="animation-delay:.2s">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][wd]}</text>`,
    )
    .join('\n  ')}

  <g>
  ${weeks
    .map((wk, wi) =>
      wk.days
        .map((day, di) => {
          if (!day) return ''
          const lv = level(day.count, max)
          const fill = lv === 0 ? t.cellEmpty : ramp[lv - 1]
          const delay = 0.24 + (wi * 7 + di) * 0.0022
          const cls = lv === 4 ? 'cell hot' : 'cell'
          return `<rect class="${cls}" x="${(originX + wi * STEP).toFixed(1)}" y="${(originY + di * STEP).toFixed(1)}" width="${CELL}" height="${CELL}" rx="3.2" fill="${fill}" style="animation-delay:${delay.toFixed(3)}s"><title>${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}</title></rect>`
        })
        .join(''),
    )
    .join('\n  ')}
  </g>

  <g class="fade" style="animation-delay:1.4s">
    <text class="m" x="${originX}" y="${(originY + 7 * STEP + 24).toFixed(1)}" font-size="10.5" fill="${t.muted}">Less</text>
    ${[t.cellEmpty, ...ramp]
      .map(
        (c, i) =>
          `<rect x="${(originX + 34 + i * 17).toFixed(1)}" y="${(originY + 7 * STEP + 14).toFixed(1)}" width="12" height="12" rx="3" fill="${c}"/>`,
      )
      .join('\n    ')}
    <text class="m" x="${(originX + 34 + 5 * 17 + 4).toFixed(1)}" y="${(originY + 7 * STEP + 24).toFixed(1)}" font-size="10.5" fill="${t.muted}">More</text>
  </g>

  <g class="fade" style="animation-delay:1.5s">
  ${facts
    .map((f, i) => {
      // Right-align the strip to the grid: the last fact's right edge is the last column.
      const x = originX + gridW - 140 - (facts.length - 1 - i) * 148
      return `<g transform="translate(${x.toFixed(1)},${(originY + 7 * STEP + 8).toFixed(1)})">
      <text class="t" x="140" y="12" text-anchor="end" font-size="13" font-weight="700" fill="${t.textStrong}">${esc(f[0])}</text>
      <text class="m" x="140" y="26" text-anchor="end" font-size="9.5" fill="${t.muted}">${esc(f[1])}</text>
    </g>`
    })
    .join('\n  ')}
  </g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${t.border}"/>
</g>
</svg>`
}
