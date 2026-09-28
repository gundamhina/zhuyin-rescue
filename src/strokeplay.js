// 照筆順一筆一筆畫出注音符號。資料是教育部筆順學習網的（strokes.js）。
// 做法跟網站一樣：每一筆沿著書寫軌跡畫一條很粗的線，再用這一筆的外框裁切，線慢慢長出來就像在寫。
// strokeSvg(symbol, opts) 回 { svg, duration }：svg 是字串，塞進去動畫就開始；duration 是整個寫完要幾毫秒。

import { STROKES } from './strokes.js'

let uid = 0

function trackLength (track) {
  let len = 0
  for (let i = 1; i < track.length; i++) len += Math.hypot(track[i][0] - track[i - 1][0], track[i][1] - track[i - 1][1])
  return len
}

// 每一筆寫多久：短的也至少 0.35 秒，長的照長度加
export function strokeTimes (symbol, { speed = 1 } = {}) {
  const strokes = STROKES[symbol] || []
  const GAP = 180
  let at = 0
  return strokes.map(s => {
    const dur = (350 + trackLength(s.track) / 2048 * 900) / speed
    const t = { delay: at, dur }
    at += dur + GAP / speed
    return t
  })
}

// opts：
//   color   寫出來的顏色
//   ghost   底下先放一層淡淡的整個字（null 不放）
//   animate false 就直接畫好（不動）
//   speed   動畫快慢，1 是正常
//   upto    只畫前幾筆（教學一筆一筆來時用）；其他筆只有淡影
export function strokeSvg (symbol, { color = '#E0955B', ghost = 'rgba(43,58,74,0.12)', animate = true, speed = 1, upto = null } = {}) {
  const strokes = STROKES[symbol]
  if (!strokes) return { svg: '', duration: 0 }
  const id = 'stk' + (++uid)
  const times = strokeTimes(symbol, { speed })
  const n = upto == null ? strokes.length : upto
  const defs = strokes.map((s, i) => `<clipPath id="${id}-${i}"><path d="${s.d}"/></clipPath>`).join('')
  const ghostSvg = ghost ? strokes.map(s => `<path d="${s.d}" fill="${ghost}"/>`).join('') : ''
  const ink = strokes.slice(0, n).map((s, i) => {
    if (!animate) return `<path d="${s.d}" fill="${color}"/>`
    const width = Math.max(...s.track.map(p => p[2])) * 1.6
    const pts = s.track.map(p => p[0] + ' ' + p[1]).join(' L')
    const { delay, dur } = times[i]
    return `<path d="M${pts}" clip-path="url(#${id}-${i})" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1" style="animation: strokeDraw ${Math.round(dur)}ms linear ${Math.round(delay)}ms forwards"/>`
  }).join('')
  const last = times[n - 1]
  const duration = animate && last ? last.delay + last.dur : 0
  return {
    svg: `<svg class="stroke-svg" viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${ghostSvg}${ink}</svg>`,
    duration,
  }
}

export function strokeCount (symbol) { return (STROKES[symbol] || []).length }
