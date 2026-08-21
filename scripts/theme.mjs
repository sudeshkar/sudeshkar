// Two palettes so the README can serve a real light and dark asset through <picture>,
// instead of relying on prefers-color-scheme inside a camo-proxied image.
export const THEMES = {
  dark: {
    id: 'dark',
    bg: '#0d1117',
    bgAlt: '#010409',
    panel: '#0f141b',
    panelAlt: '#161b22',
    border: '#26303b',
    borderSoft: '#1c242d',
    text: '#e6edf3',
    textStrong: '#ffffff',
    muted: '#8b949e',
    faint: '#586069',
    cyan: '#22d3ee',
    violet: '#a78bfa',
    indigo: '#818cf8',
    green: '#3fb950',
    amber: '#d29922',
    grid: '#ffffff',
    gridOpacity: 0.045,
    glowOpacity: 0.5,
    cellEmpty: '#161b22',
  },
  light: {
    id: 'light',
    bg: '#ffffff',
    bgAlt: '#f6f8fa',
    panel: '#ffffff',
    panelAlt: '#f6f8fa',
    border: '#d0d7de',
    borderSoft: '#e4e8ed',
    text: '#1f2328',
    textStrong: '#0b0d10',
    muted: '#59636e',
    faint: '#818b98',
    cyan: '#0e7490',
    violet: '#6d28d9',
    indigo: '#4338ca',
    green: '#1a7f37',
    amber: '#9a6700',
    grid: '#1f2328',
    gridOpacity: 0.05,
    glowOpacity: 0.16,
    cellEmpty: '#eaeef2',
  },
}

export const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif"
export const MONO =
  "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace"

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Shared keyframes every card pulls from, so motion feels like one system.
export const BASE_MOTION = `
  @keyframes rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fade { from { opacity:0; } to { opacity:1; } }
  @keyframes drift { 0%,100% { transform:translate(0,0); } 50% { transform:translate(18px,-12px); } }
  @keyframes drift2 { 0%,100% { transform:translate(0,0); } 50% { transform:translate(-22px,14px); } }
  @keyframes sweep { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
  @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes spinBack { from { transform:rotate(360deg); } to { transform:rotate(0deg); } }
  @keyframes pulse { 0%,100% { opacity:.35; r:4; } 50% { opacity:1; r:5.5; } }
  @keyframes dash { to { stroke-dashoffset:0; } }
  .rise { opacity:0; animation:rise .7s cubic-bezier(.22,.8,.3,1) forwards; }
  .fade { opacity:0; animation:fade .8s ease forwards; }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration:.001s !important; animation-delay:0s !important; }
    .rise, .fade { opacity:1; }
  }
`
