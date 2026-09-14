// 寫給狗狗看。低階級是描寫（板子上有淡淡的範本），高階級是聽寫（空白板子）。
// 判定：描寫看蓋到範本多少；聽寫把筆跡跟這題的候選符號比，最像的當她寫的。
// 介面跟釣魚一樣：start、lock/unlock、hint、shake、celebrate、sad、onAnswer、destroy。

import { dogSvg, homeBgSvg } from './art.js'
import { normalizePoints, rasterize, coverage, bestMatch } from './ink.js'
import { SIMILAR_SHAPE } from './data.js'

const PAD = 560 // 板子邊長（舞台座標）
const GRID = 64 // 比對用小圖邊長
const INK_WIDTH = 24
// 聽寫判定：跟正確答案的距離要小於這個才算對；比對時把形似對也放進候選，亂畫不會剛好對
const ACCEPT_DISTANCE = 8
const KNOWN_DISTANCE = 12 // 最像的那個要夠像才算「她寫成別的」，否則算認不出來
const CHECK_SVG = `<svg viewBox="0 0 24 24" width="70" height="70" fill="#fff"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`
const UNDO_SVG = `<svg viewBox="0 0 24 24" width="44" height="44" fill="#fff"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>`

const glyphCache = {}
// 用遊戲字型把符號畫出來，轉成比對用的小圖。同一個符號只算一次。
function glyphBitmap (symbol) {
  if (glyphCache[symbol]) return glyphCache[symbol]
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.font = '900 190px "Microsoft JhengHei", "Noto Sans TC", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(symbol, 128, 136)
  const data = ctx.getImageData(0, 0, 256, 256).data
  const pts = []
  for (let y = 0; y < 256; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      if (data[(y * 256 + x) * 4 + 3] > 128) pts.push([x, y])
    }
  }
  const norm = normalizePoints([pts], GRID, 6)
  const bm = rasterize(norm[0].map(p => [p]), GRID, 2.2)
  glyphCache[symbol] = bm
  return bm
}

function inkBitmap (strokes) {
  const norm = normalizePoints(strokes, GRID, 6)
  return rasterize(norm, GRID, 3)
}

export function createWrite (root, { color = 0 } = {}) {
  root.innerHTML = homeBgSvg() +
    '<div class="dog-wrap write-dog">' + dogSvg(color) + '</div>' +
    `<div class="pad-wrap">
       <div class="pad-template"><span></span></div>
       <canvas class="pad" width="${PAD}" height="${PAD}"></canvas>
       <button class="pad-undo" aria-label="重寫">${UNDO_SVG}</button>
       <button class="pad-ok" aria-label="好了">${CHECK_SVG}</button>
     </div>`
  const dogWrap = root.querySelector('.write-dog')
  const padWrap = root.querySelector('.pad-wrap')
  const canvas = root.querySelector('.pad')
  const ctx = canvas.getContext('2d')
  const tplEl = root.querySelector('.pad-template')
  const tplText = tplEl.querySelector('span')
  let handler = null
  let locked = true
  let current = null
  let trace = false
  let strokes = []
  let drawing = null

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = INK_WIDTH
  ctx.strokeStyle = '#2B3A4A'

  function canvasPoint (e) {
    const r = canvas.getBoundingClientRect()
    return [(e.clientX - r.left) / r.width * PAD, (e.clientY - r.top) / r.height * PAD]
  }
  canvas.addEventListener('pointerdown', e => {
    if (locked) return
    drawing = [canvasPoint(e)]
    strokes.push(drawing)
    try { canvas.setPointerCapture(e.pointerId) } catch (err) { /* 不給鎖也能畫 */ }
  })
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return
    const p = canvasPoint(e)
    const last = drawing[drawing.length - 1]
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 2) return
    drawing.push(p)
    ctx.beginPath()
    ctx.moveTo(last[0], last[1])
    ctx.lineTo(p[0], p[1])
    ctx.stroke()
  })
  const endStroke = () => {
    if (!drawing) return
    if (drawing.length === 1) { // 點一下也留個點
      ctx.beginPath(); ctx.arc(drawing[0][0], drawing[0][1], INK_WIDTH / 2, 0, Math.PI * 2); ctx.fillStyle = '#2B3A4A'; ctx.fill()
    }
    drawing = null
  }
  canvas.addEventListener('pointerup', endStroke)
  canvas.addEventListener('pointercancel', endStroke)

  function clearInk () {
    strokes = []
    drawing = null
    ctx.clearRect(0, 0, PAD, PAD)
  }
  root.querySelector('.pad-undo').addEventListener('pointerdown', () => { if (!locked) clearInk() })

  // 「好了」：把筆跡判成某個符號交給 main.js
  root.querySelector('.pad-ok').addEventListener('pointerdown', () => {
    if (locked || !handler) return
    const inkPts = strokes.flat().length
    if (inkPts < 6) { shakePad(); return }
    const ink = inkBitmap(strokes)
    if (trace) {
      const { covered, stray } = coverage(glyphBitmap(current.target), ink, GRID, 3)
      const ok = covered >= 0.7 && stray <= 0.3
      reveal(ok)
      handler(ok ? current.target : '__miss__', null)
      return
    }
    // 候選：這題的選項，加上目標的形似對
    const cands = new Set(current.options)
    for (const [a, b] of SIMILAR_SHAPE) {
      if (a === current.target) cands.add(b)
      if (b === current.target) cands.add(a)
    }
    const templates = {}
    for (const s of cands) templates[s] = glyphBitmap(s)
    const ranked = bestMatch(ink, templates, GRID)
    const best = ranked[0]
    const targetScore = ranked.find(r => r.symbol === current.target).score
    let verdict
    if (best.symbol === current.target && targetScore < ACCEPT_DISTANCE) verdict = current.target
    else if (best.symbol !== current.target && best.score < KNOWN_DISTANCE) verdict = best.symbol
    else verdict = '__unknown__'
    reveal(verdict === current.target)
    handler(verdict, null)
  })

  // 對答案：把正確符號疊在她寫的字上，對的綠、錯的橘
  function reveal (ok) {
    tplEl.classList.remove('good', 'bad')
    tplEl.classList.add('show', ok ? 'good' : 'bad')
  }

  function shakePad () {
    padWrap.classList.remove('shake')
    void padWrap.offsetWidth
    padWrap.classList.add('shake')
  }

  // isTrace 由 main.js 依階級決定
  function start (question, { isTrace = false } = {}) {
    current = question
    trace = isTrace
    locked = true
    clearInk()
    tplText.textContent = question.target
    tplEl.classList.remove('good', 'bad', 'flash')
    tplEl.classList.toggle('show', trace)
    padWrap.classList.remove('shake', 'glow')
  }
  function unlock () { locked = false }
  function lock () { locked = true }
  // 提示：閃一下範本
  function hint () {
    tplEl.classList.add('show', 'flash')
    setTimeout(() => { tplEl.classList.remove('flash'); if (!trace) tplEl.classList.remove('show') }, 1500)
  }
  function shake () { shakePad() }
  function celebrate () {
    return new Promise(resolve => {
      padWrap.classList.add('glow')
      dogWrap.classList.remove('jump')
      void dogWrap.offsetWidth
      dogWrap.classList.add('jump')
      setTimeout(resolve, 700)
    })
  }
  function sad () {
    dogWrap.classList.remove('tilt')
    void dogWrap.offsetWidth
    dogWrap.classList.add('tilt')
  }
  function onAnswer (fn) { handler = fn }
  function destroy () { root.innerHTML = ''; handler = null }

  return { start, unlock, lock, hint, shake, celebrate, sad, onAnswer, destroy }
}
