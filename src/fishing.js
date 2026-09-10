// 釣魚玩法。負責畫泡泡、接點擊、播動畫；對錯的判斷與記錄交給 main.js。
// 介面（跟餵狗狗共用）：start(question)、lock/unlock、hint、shake、flashCorrect、celebrate(symbol)→Promise、sad、onAnswer(fn)、destroy。

import { dogSvg, sceneSvg } from './art.js'

// 各選項數的泡泡位置（1200×800 舞台座標）
const SLOTS = {
  2: [[620, 600], [960, 600]],
  3: [[560, 620], [800, 560], [1040, 640]],
  4: [[540, 560], [780, 640], [1000, 560], [820, 480]],
  5: [[520, 580], [720, 660], [900, 540], [1060, 660], [700, 490]],
  6: [[500, 560], [680, 650], [860, 540], [1040, 650], [640, 480], [960, 470]],
}

export function createFishing (root, { color = 0 } = {}) {
  root.innerHTML = sceneSvg() +
    '<div class="dog-wrap">' + dogSvg(color) + '</div>' +
    '<div class="bubbles"></div>'
  const bubblesEl = root.querySelector('.bubbles')
  const dogWrap = root.querySelector('.dog-wrap')
  let handler = null
  let locked = true
  let current = null

  bubblesEl.addEventListener('pointerdown', e => {
    const b = e.target.closest('.bubble')
    if (!b || locked || !handler) return
    handler(b.dataset.symbol, b)
  })

  function start (question) {
    current = question
    locked = true
    bubblesEl.innerHTML = ''
    const slots = SLOTS[question.options.length] || SLOTS[6]
    question.options.forEach((sym, i) => {
      const [x, y] = slots[i]
      const b = document.createElement('div')
      b.className = 'bubble'
      b.dataset.symbol = sym
      b.style.left = (x - 85) + 'px'
      b.style.top = (y - 85) + 'px'
      b.style.animationDelay = (i * 0.35) + 's'
      b.innerHTML = '<span>' + sym + '</span>'
      bubblesEl.appendChild(b)
    })
  }

  function bubbleOf (symbol) {
    return bubblesEl.querySelector('.bubble[data-symbol="' + symbol + '"]')
  }

  function unlock () { locked = false }
  function lock () { locked = true }

  // 提示：hint 2 一直晃、1 晃一次、0 不晃
  function hint (level) {
    const b = bubbleOf(current.target)
    if (!b) return
    b.classList.remove('hint-once', 'hint-loop')
    if (level >= 2) b.classList.add('hint-loop')
    else if (level === 1) b.classList.add('hint-once')
  }

  function shake (symbol) {
    const b = bubbleOf(symbol)
    if (!b) return
    b.classList.remove('shake')
    void b.offsetWidth
    b.classList.add('shake')
  }

  function flashCorrect () {
    const b = bubbleOf(current.target)
    if (b) { b.classList.remove('hint-once'); b.classList.add('hint-loop') }
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
      // 釣竿尖端大約在舞台 (426, 278)：dog-wrap 左上 (170, 226) 加上竿尖 (256, 52)
      b.style.transform = `translate(${426 - 88 - x}px, ${278 - 88 - y}px) scale(0.5)`
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
  function destroy () { root.innerHTML = ''; handler = null }

  return { start, unlock, lock, hint, shake, flashCorrect, celebrate, sad, onAnswer, destroy }
}
