// 餵狗狗玩法。骨頭餅乾印著符號，拖到狗狗嘴邊才算答；對錯判斷交給 main.js。
// 介面跟釣魚一樣：start、lock/unlock、hint、shake、flashCorrect、celebrate、sad、onAnswer、destroy。

import { dogSvg, homeBgSvg } from './art.js'

// 狗狗嘴巴附近的落點（舞台座標）
const MOUTH = { x: 300, y: 400, r: 150 }
// 各選項數的餅乾位置（中心點）
const BONE_SLOTS = {
  2: [[700, 640], [980, 640]],
  3: [[620, 640], [840, 640], [1060, 640]],
  4: [[620, 560], [860, 560], [740, 700], [980, 700]],
  5: [[600, 560], [840, 560], [1080, 560], [720, 700], [960, 700]],
  6: [[600, 560], [840, 560], [1080, 560], [600, 700], [840, 700], [1080, 700]],
}

function boneHtml (symbol) {
  return `
<svg class="bone-art" viewBox="0 0 180 96" width="180" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect x="34" y="30" width="112" height="36" rx="18" fill="#F6E7C8"/>
  <circle cx="36" cy="30" r="22" fill="#F6E7C8"/><circle cx="36" cy="66" r="22" fill="#F6E7C8"/>
  <circle cx="144" cy="30" r="22" fill="#F6E7C8"/><circle cx="144" cy="66" r="22" fill="#F6E7C8"/>
  <path d="M34 30 h112 M34 66 h112" stroke="#E2C89A" stroke-width="3" fill="none"/>
</svg>
<span>${symbol}</span>`
}

export function createFeeding (root, { color = 0 } = {}) {
  root.innerHTML = homeBgSvg() +
    `<svg class="bowl" viewBox="0 0 260 90" width="260" height="90" xmlns="http://www.w3.org/2000/svg">
       <ellipse cx="130" cy="60" rx="120" ry="28" fill="#C8553D"/>
       <ellipse cx="130" cy="52" rx="96" ry="18" fill="#96402D"/>
       <ellipse cx="130" cy="76" rx="120" ry="12" fill="#3E6A34" opacity="0.35"/>
     </svg>` +
    '<div class="dog-wrap feed-dog">' + dogSvg(color) + '</div>' +
    '<div class="biscuits"></div>'
  // 碗畫在狗狗前面
  root.appendChild(root.querySelector('.bowl'))
  const biscuitsEl = root.querySelector('.biscuits')
  const dogWrap = root.querySelector('.feed-dog')
  let handler = null
  let locked = true
  let current = null
  let drag = null

  function stageScale () {
    const stage = document.getElementById('stage')
    return stage.getBoundingClientRect().width / 1200
  }

  biscuitsEl.addEventListener('pointerdown', e => {
    const b = e.target.closest('.biscuit')
    if (!b || locked) return
    drag = { b, startX: e.clientX, startY: e.clientY, ox: parseFloat(b.style.left), oy: parseFloat(b.style.top), moved: false }
    b.classList.add('dragging')
    try { b.setPointerCapture(e.pointerId) } catch (err) { /* 有些裝置不給鎖指標，靠 biscuits 容器接 move 也能拖 */ }
  })
  biscuitsEl.addEventListener('pointermove', e => {
    if (!drag) return
    const s = stageScale()
    const dx = (e.clientX - drag.startX) / s
    const dy = (e.clientY - drag.startY) / s
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true
    drag.b.style.left = (drag.ox + dx) + 'px'
    drag.b.style.top = (drag.oy + dy) + 'px'
  })
  function endDrag (e) {
    if (!drag) return
    const { b, ox, oy } = drag
    drag = null
    b.classList.remove('dragging')
    const cx = parseFloat(b.style.left) + 90
    const cy = parseFloat(b.style.top) + 48
    const inMouth = Math.hypot(cx - MOUTH.x, cy - MOUTH.y) < MOUTH.r
    if (inMouth && handler) {
      handler(b.dataset.symbol, b)
      return
    }
    // 沒放到嘴邊：滑回原位
    b.classList.add('returning')
    b.style.left = ox + 'px'
    b.style.top = oy + 'px'
    setTimeout(() => b.classList.remove('returning'), 350)
  }
  biscuitsEl.addEventListener('pointerup', endDrag)
  biscuitsEl.addEventListener('pointercancel', endDrag)

  function start (question) {
    current = question
    locked = true
    biscuitsEl.innerHTML = ''
    const slots = BONE_SLOTS[question.options.length] || BONE_SLOTS[6]
    question.options.forEach((sym, i) => {
      const [x, y] = slots[i]
      const b = document.createElement('div')
      b.className = 'biscuit'
      b.dataset.symbol = sym
      b.style.left = (x - 90) + 'px'
      b.style.top = (y - 48) + 'px'
      b.style.animationDelay = (i * 0.3) + 's'
      b.innerHTML = boneHtml(sym)
      biscuitsEl.appendChild(b)
    })
  }

  function biscuitOf (symbol) {
    return biscuitsEl.querySelector('.biscuit[data-symbol="' + symbol + '"]')
  }
  function unlock () { locked = false }
  function lock () { locked = true }
  function hint (level) {
    const b = biscuitOf(current.target)
    if (!b) return
    b.classList.remove('hint-once', 'hint-loop')
    if (level >= 2) b.classList.add('hint-loop')
    else if (level === 1) b.classList.add('hint-once')
  }
  function shake (symbol) {
    const b = biscuitOf(symbol)
    if (!b) return
    // 放錯的餅乾先彈回原位再晃
    const [x, y] = (BONE_SLOTS[current.options.length] || BONE_SLOTS[6])[current.options.indexOf(symbol)]
    b.classList.add('returning')
    b.style.left = (x - 90) + 'px'
    b.style.top = (y - 48) + 'px'
    setTimeout(() => { b.classList.remove('returning'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake') }, 300)
  }
  function flashCorrect () {
    const b = biscuitOf(current.target)
    if (b) { b.classList.remove('hint-once'); b.classList.add('hint-loop') }
  }
  // 吃掉：餅乾飛到嘴邊縮小消失，狗狗跳一下
  function celebrate (symbol) {
    return new Promise(resolve => {
      const b = biscuitOf(symbol)
      if (!b) return resolve()
      b.classList.remove('hint-loop', 'hint-once', 'shake')
      b.classList.add('eaten')
      b.style.left = (MOUTH.x - 90) + 'px'
      b.style.top = (MOUTH.y - 48) + 'px'
      dogWrap.classList.remove('jump')
      void dogWrap.offsetWidth
      dogWrap.classList.add('chomp')
      setTimeout(() => { b.classList.add('gone'); dogWrap.classList.remove('chomp'); resolve() }, 600)
    })
  }
  function sad () {
    dogWrap.classList.remove('tilt')
    void dogWrap.offsetWidth
    dogWrap.classList.add('tilt')
  }
  function onAnswer (fn) { handler = fn }
  function destroy () { root.innerHTML = ''; handler = null }

  return { start, unlock, lock, hint, shake, flashCorrect, celebrate, sad, onAnswer, destroy }
}
