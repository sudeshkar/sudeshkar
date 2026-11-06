import { THEMES, fonts, EASE, esc } from '../theme.mjs'

const W = 1000
const PAD = 8
const FS = 21
const BUBBLE_H = 46
const GAP = 12
const TOP = 10
const PAD_X = 22

// Archivo Regular averages about 0.46em per character; a slightly generous
// estimate keeps text inside its bubble without needing a font-metrics dependency.
const textWidth = (s) => Math.ceil(s.length * FS * 0.47)

/**
 * An intro written as a chat. Each message is preceded by a typing indicator in the
 * slot it is about to occupy; the indicator fades as the bubble arrives. It plays once
 * and stays put. Reduced motion shows the finished conversation.
 */
export function chat(theme, d) {
  const t = THEMES[theme]

  const messages = [
    { text: "Hi, I'm Sudeshkar" },
    { text: 'Full-stack engineer in Sri Lanka' },
    { text: 'I build backends in Java 21 and Spring Boot, with C# and React on top' },
    { text: `${d.mergedPRs} pull requests merged into OpenMRS so far` },
    { text: 'Right now I am building SkyHub, DocBot and FreshLink' },
    { text: 'Open to backend and full-stack roles: sudeshkar008sk@gmail.com', accent: true },
  ]

  // Sequential timeline: a short "typing" beat that grows with message length.
  let clock = 0.5
  const rows = messages.map((m, i) => {
    const typing = 0.7 + Math.min(m.text.length, 60) * 0.012
    const row = {
      ...m,
      y: TOP + i * (BUBBLE_H + GAP),
      w: textWidth(m.text) + PAD_X * 2,
      typeAt: clock,
      typeFor: typing,
      showAt: clock + typing,
    }
    clock = row.showAt + 0.35
    return row
  })
  const H = TOP + rows.length * (BUBBLE_H + GAP)
  const ink = t.ink
  const bubble = t.empty

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(messages.map((m) => m.text).join('. '))}">
<title>${esc(messages.map((m) => m.text).join('. '))}</title>
<defs>
  <style>
    ${fonts('regular')}
    .msg { font-size:${FS}px; }
    .typing { opacity:0; }
    .dot { animation:hop .6s ease-in-out 2 both; }
    @keyframes typing { 0% { opacity:0; } 12% { opacity:1; } 88% { opacity:1; } 100% { opacity:0; } }
    @keyframes hop { 0%, 100% { transform:translateY(0); opacity:.45; } 40% { transform:translateY(-4px); opacity:1; } }
    @keyframes pop {
      from { opacity:0; transform:translateY(8px) scale(.96); }
      to { opacity:1; transform:translateY(0) scale(1); }
    }
    .bubble { transform-box:fill-box; transform-origin:0 100%; }
    @media (prefers-reduced-motion: reduce) {
      * { animation:none !important; }
    }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
${rows
  .map((r) => {
    const fill = r.accent ? t.accent : bubble
    const color = r.accent ? '#ffffff' : ink
    const cy = r.y + BUBBLE_H / 2
    return `<g class="typing" style="animation:typing ${r.typeFor.toFixed(2)}s linear ${r.typeAt.toFixed(2)}s both">
  <rect x="${PAD}" y="${r.y}" width="76" height="${BUBBLE_H}" rx="${BUBBLE_H / 2}" fill="${bubble}"/>
  ${[0, 1, 2]
    .map(
      (k) =>
        `<circle class="dot" cx="${PAD + 24 + k * 14}" cy="${cy}" r="4" fill="${t.muted}" style="animation-delay:${(r.typeAt + k * 0.15).toFixed(2)}s"/>`,
    )
    .join('\n  ')}
</g>
<g class="bubble" style="animation:pop .5s ${EASE} ${r.showAt.toFixed(2)}s both">
  <rect x="${PAD}" y="${r.y}" width="${r.w}" height="${BUBBLE_H}" rx="${BUBBLE_H / 2}" fill="${fill}"/>
  <text class="regular msg" x="${PAD + PAD_X}" y="${(cy + FS * 0.35).toFixed(1)}" fill="${color}">${esc(r.text)}</text>
</g>`
  })
  .join('\n')}
</svg>`
}
