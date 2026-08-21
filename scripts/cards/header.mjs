import { THEMES, FONT, MONO, BASE_MOTION, esc } from '../theme.mjs'

const ROLES = [
  'Spring Boot & Java 21',
  'C# / .NET & Blazor WASM',
  'React & TypeScript',
  'REST APIs that hold up',
  'OpenMRS contributor',
]

const W = 1000
const H = 300

function roleKeyframes(n, secondsEach = 2.8) {
  const total = n * secondsEach
  const slice = 100 / n
  const inAt = (slice * 0.06).toFixed(2)
  const holdAt = (slice * 0.84).toFixed(2)
  const outAt = (slice * 0.94).toFixed(2)
  return `
  @keyframes roleCycle {
    0% { opacity:0; transform:translateY(7px); }
    ${inAt}% { opacity:1; transform:translateY(0); }
    ${holdAt}% { opacity:1; transform:translateY(0); }
    ${outAt}% { opacity:0; transform:translateY(-7px); }
    100% { opacity:0; transform:translateY(-7px); }
  }
  .role { opacity:0; animation:roleCycle ${total}s linear infinite; }`
}

export function header(theme, data) {
  const t = THEMES[theme]
  const orbit = [
    { r: 74, dur: 26, dash: '3 9', color: t.cyan, op: 0.55 },
    { r: 58, dur: 18, dash: '2 7', color: t.violet, op: 0.5 },
    { r: 92, dur: 40, dash: '1 14', color: t.indigo, op: 0.35 },
  ]
  const cx = 838
  const cy = 150

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(data.name)} — Full-Stack Software Engineer">
<title>${esc(data.name)} — Full-Stack Software Engineer</title>
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${t.bg}"/><stop offset="100%" stop-color="${t.bgAlt}"/>
  </linearGradient>
  <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${t.textStrong}"/>
    <stop offset="62%" stop-color="${t.cyan}"/>
    <stop offset="100%" stop-color="${t.violet}"/>
  </linearGradient>
  <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${t.cyan}" stop-opacity="0"/>
    <stop offset="45%" stop-color="${t.cyan}"/>
    <stop offset="70%" stop-color="${t.violet}"/>
    <stop offset="100%" stop-color="${t.violet}" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="glowA"><stop offset="0%" stop-color="${t.cyan}" stop-opacity="${t.glowOpacity}"/><stop offset="100%" stop-color="${t.cyan}" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB"><stop offset="0%" stop-color="${t.violet}" stop-opacity="${t.glowOpacity}"/><stop offset="100%" stop-color="${t.violet}" stop-opacity="0"/></radialGradient>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
    <circle cx="1.4" cy="1.4" r="1.4" fill="${t.grid}" fill-opacity="${t.gridOpacity}"/>
  </pattern>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="14"/></clipPath>
  <style>
    ${BASE_MOTION}
    ${roleKeyframes(ROLES.length)}
    .t { font-family:${FONT}; }
    .m { font-family:${MONO}; }
    .glowA { animation:drift 15s ease-in-out infinite; }
    .glowB { animation:drift2 19s ease-in-out infinite; }
    .sweepline { animation:sweep 6.5s cubic-bezier(.4,0,.2,1) infinite; }
    .dot { animation:pulse 2.4s ease-in-out infinite; }
  </style>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse class="glowA" cx="140" cy="46" rx="330" ry="200" fill="url(#glowA)"/>
  <ellipse class="glowB" cx="880" cy="268" rx="340" ry="210" fill="url(#glowB)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <g opacity="0.9">
    ${orbit
      .map(
        (o, i) => `<circle cx="${cx}" cy="${cy}" r="${o.r}" fill="none"
      stroke="${o.color}" stroke-opacity="${o.op}" stroke-width="1.25" stroke-dasharray="${o.dash}"
      style="animation:${i % 2 ? 'spinBack' : 'spin'} ${o.dur}s linear infinite; transform-origin:${cx}px ${cy}px;"/>`,
      )
      .join('\n    ')}
    <g style="animation:spin 26s linear infinite; transform-origin:${cx}px ${cy}px;">
      <circle cx="${cx + 74}" cy="${cy}" r="4" fill="${t.cyan}"/>
    </g>
    <g style="animation:spinBack 18s linear infinite; transform-origin:${cx}px ${cy}px;">
      <circle cx="${cx - 58}" cy="${cy}" r="3.2" fill="${t.violet}"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="42" fill="${t.panelAlt}" fill-opacity="0.85" stroke="${t.border}"/>
    <text class="t" x="${cx}" y="${cy + 11}" text-anchor="middle" font-size="30" font-weight="700" fill="url(#name)" letter-spacing="1">SS</text>
  </g>

  <g class="rise" style="animation-delay:.05s">
    <text class="m" x="56" y="72" font-size="11.5" letter-spacing="3.4" fill="${t.muted}">FULL-STACK SOFTWARE ENGINEER — SRI LANKA</text>
  </g>
  <g class="rise" style="animation-delay:.16s">
    <text class="t" x="56" y="126" font-size="42" font-weight="800" fill="url(#name)" letter-spacing="-0.8">${esc(data.name)}</text>
  </g>
  <g class="rise" style="animation-delay:.28s">
    <text class="t" x="56" y="162" font-size="17" font-weight="500" fill="${t.text}">I build backends that survive production.</text>
  </g>

  <g transform="translate(56,200)">
    <rect x="0" y="-13" width="3" height="18" rx="1.5" fill="${t.cyan}"/>
    ${ROLES.map(
      (r, i) =>
        `<text class="t role" x="14" y="0" font-size="15" font-weight="600" fill="${t.cyan}" style="animation-delay:${(i * 2.8).toFixed(1)}s">${esc(r)}</text>`,
    ).join('\n    ')}
  </g>

  <g transform="translate(56,232)">
    <g class="rise" style="animation-delay:.44s">
      <rect width="238" height="30" rx="15" fill="${t.panelAlt}" fill-opacity="0.9" stroke="${t.border}"/>
      <circle class="dot" cx="18" cy="15" r="4.5" fill="${t.green}"/>
      <text class="t" x="32" y="19.5" font-size="12.5" font-weight="600" fill="${t.text}">Open to graduate &amp; junior SWE roles</text>
    </g>
  </g>

  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="${t.borderSoft}"/>
  <rect class="sweepline" x="0" y="${H - 3}" width="${W}" height="3" fill="url(#rule)"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${t.border}"/>
</g>
</svg>`
}
