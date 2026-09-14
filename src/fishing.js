// 釣魚玩法。負責畫泡泡、接點擊、播動畫；對錯的判斷與記錄交給 main.js。
// 介面（跟打地鼠共用）：start(question)、lock/unlock、hint、shake、celebrate(symbol)→Promise、sad、onAnswer(fn)、layout、destroy。
// 狗狗跟碼頭一起放在背景層裡（會跟著背景縮放），泡泡放在 frame 裡。

import { dogSvg, bgHtml, symbolMarkup } from './art.js'
import { STAGE, mountBgs } from './ui.js'

// 橫的：各選項數的泡泡位置（1200×800 frame 座標）
const SLOTS = {
  2: [[620, 600], [960, 600]],
  3: [[560, 620], [800, 560], [1040, 640]],
  4: [[540, 560], [780, 640], [1000, 560], [820, 480]],
  5: [[520, 580], [720, 660], [900, 540], [1060, 660], [700, 490]],
  6: [[500, 560], [680, 650], [860, 540], [1040, 650], [640, 480], [960, 470]],
}

// 直的：泡泡排成格子，貼在海面和狗狗上方，每列置中
function bubbleSlots (n) {
  if (!STAGE.portrait) return SLOTS[n] || SLOTS[6]
  const cols = n <= 4 ? 2 : 3
  const rows = Math.ceil(n / cols)
  const cell = 215
  const y0 = STAGE.h - 650 - (rows - 1) * cell
  const out = []
  for (let r = 0; r < rows; r++) {
    const inRow = Math.min(cols, n - r * cols)
    const x0 = STAGE.w / 2 - (inRow - 1) * cell / 2
    for (let c = 0; c < inRow; c++) out.push([x0 + c * cell, y0 + r * cell])
  }
  return out
}

export function createFishing (root, { color = 0 } = {}) {
  root.innerHTML = bgHtml('scene', '<div class="dog-wrap fish-dog">' + dogSvg(color) + '</div>') +
    '<div class="frame"><div class="bubbles"></div></div>'
  mountBgs(root)
  const bubblesEl = root.querySelector('.bubbles')
  const dogWrap = root.querySelector('.fish-dog')
  const art = root.querySelector('.bg-art')
  const frame = root.querySelector('.frame')
  let handler = null
  let locked = true
  let current = null

  bubblesEl.addEventListener('pointerdown', e => {
    const b = e.target.closest('.bubble')
    if (!b || locked || !handler) return
    handler(b.dataset.symbol, b)
  })

  function place () {
    const bubbles = [...bubblesEl.children]
    const slots = bubbleSlots(bubbles.length)
    bubbles.forEach((b, i) => {
      if (b.classList.contains('caught')) return
      b.style.left = (slots[i][0] - 85) + 'px'
      b.style.top = (slots[i][1] - 85) + 'px'
    })
  }

  function start (question) {
    current = question
    locked = true
    bubblesEl.innerHTML = ''
    question.options.forEach((sym, i) => {
      const b = document.createElement('div')
      b.className = 'bubble'
      b.dataset.symbol = sym
      b.style.animationDelay = (i * 0.35) + 's'
      b.innerHTML = '<span>' + symbolMarkup(sym) + '</span>'
      bubblesEl.appendChild(b)
    })
    place()
  }

  function bubbleOf (symbol) {
    return bubblesEl.querySelector('.bubble[data-symbol="' + symbol + '"]')
  }

  function unlock () { locked = false }
  function lock () { locked = true }

  // 提示：正確的泡泡晃一下就停
  function hint () {
    const b = bubbleOf(current.target)
    if (!b) return
    b.classList.remove('hint-once')
    void b.offsetWidth
    b.classList.add('hint-once')
  }

  function shake (symbol) {
    const b = bubbleOf(symbol)
    if (!b) return
    b.classList.remove('shake')
    void b.offsetWidth
    b.classList.add('shake')
  }

  // 釣起來：泡泡飛向釣竿尖端，狗狗跳一下
  function celebrate (symbol) {
    return new Promise(resolve => {
      const b = bubbleOf(symbol)
      if (!b) return resolve()
      b.classList.remove('hint-loop', 'hint-once', 'shake')
      b.classList.add('caught')
      const x = parseFloat(b.style.left)
      const y = parseFloat(b.style.top)
      // 釣竿尖端在場景座標 (426, 278)：dog-wrap 左上 (170, 226) 加上竿尖 (256, 52)。場景層有縮放位移，換成 frame 座標
      const s = parseFloat(art.dataset.s || 1)
      const tipX = parseFloat(art.dataset.x || 0) + 426 * s - frame.offsetLeft
      const tipY = parseFloat(art.dataset.y || 0) + 278 * s - frame.offsetTop
      b.style.transform = `translate(${tipX - 88 - x}px, ${tipY - 88 - y}px) scale(0.5)`
      dogWrap.classList.remove('jump')
      void dogWrap.offsetWidth
      dogWrap.classList.add('jump')
      setTimeout(() => {
        b.classList.add('gone')
        resolve()
      }, 700)
    })
  }

  function sad () {
    dogWrap.classList.remove('tilt')
    void dogWrap.offsetWidth
    dogWrap.classList.add('tilt')
  }

  function onAnswer (fn) { handler = fn }
  function layout () { place() }
  function destroy () { root.innerHTML = ''; handler = null }

  return { start, unlock, lock, hint, shake, celebrate, sad, onAnswer, layout, destroy }
}
