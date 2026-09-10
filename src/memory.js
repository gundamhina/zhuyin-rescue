// 翻牌配對。幾對相同的符號蓋著，翻開唸音；找到一樣的兩張就配對成功。
// 介面：start(symbols)、onFlip(fn)、onPair(fn)、onDone(fn)、destroy。配對邏輯在這裡，main.js 只管聲音和星星。

import { homeBgSvg } from './art.js'

// 卡片位置：依張數排格子（中心點）
function layout (count) {
  const cols = count <= 6 ? 3 : count <= 8 ? 4 : 5
  const rows = Math.ceil(count / cols)
  const cw = 190
  const ch = 230
  const gapX = 30
  const gapY = 30
  const totalW = cols * cw + (cols - 1) * gapX
  const totalH = rows * ch + (rows - 1) * gapY
  const x0 = (1200 - totalW) / 2
  const y0 = 120 + (560 - totalH) / 2
  const out = []
  for (let i = 0; i < count; i++) {
    const c = i % cols
    const r = Math.floor(i / cols)
    out.push([x0 + c * (cw + gapX), y0 + r * (ch + gapY)])
  }
  return out
}

function shuffleCards (arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const PAW = `<svg viewBox="0 0 100 100" width="90" height="90" xmlns="http://www.w3.org/2000/svg" fill="#F6E7C8" opacity="0.9">
  <ellipse cx="50" cy="66" rx="24" ry="20"/><circle cx="24" cy="44" r="10"/><circle cx="42" cy="30" r="10"/><circle cx="60" cy="30" r="10"/><circle cx="77" cy="44" r="10"/></svg>`

export function createMemory (root) {
  root.innerHTML = homeBgSvg() + '<div class="cards-grid"></div>'
  const grid = root.querySelector('.cards-grid')
  let onFlipFn = null
  let onPairFn = null
  let onDoneFn = null
  let open = [] // 目前翻開、還沒配對的卡
  let locked = false
  let remaining = 0

  grid.addEventListener('pointerdown', e => {
    const card = e.target.closest('.mcard')
    if (!card || locked || card.classList.contains('open') || card.classList.contains('matched')) return
    card.classList.add('open')
    open.push(card)
    if (onFlipFn) onFlipFn(card.dataset.symbol)
    if (open.length < 2) return
    locked = true
    const [a, b] = open
    open = []
    if (a.dataset.symbol === b.dataset.symbol) {
      setTimeout(() => {
        a.classList.add('matched'); b.classList.add('matched')
        remaining--
        locked = false
        if (onPairFn) onPairFn(a.dataset.symbol)
        if (remaining === 0 && onDoneFn) setTimeout(onDoneFn, 600)
      }, 500)
    } else {
      setTimeout(() => {
        a.classList.remove('open'); b.classList.remove('open')
        locked = false
      }, 1100)
    }
  })

  function start (symbols) {
    grid.innerHTML = ''
    open = []
    locked = false
    remaining = symbols.length
    const cards = shuffleCards(symbols.flatMap(s => [s, s]))
    const pos = layout(cards.length)
    cards.forEach((sym, i) => {
      const el = document.createElement('div')
      el.className = 'mcard'
      el.dataset.symbol = sym
      el.style.left = pos[i][0] + 'px'
      el.style.top = pos[i][1] + 'px'
      el.style.animationDelay = (i * 0.06) + 's'
      el.innerHTML = `<div class="mcard-inner"><div class="mcard-back">${PAW}</div><div class="mcard-front"><span>${sym}</span></div></div>`
      grid.appendChild(el)
    })
  }

  return {
    start,
    onFlip (fn) { onFlipFn = fn },
    onPair (fn) { onPairFn = fn },
    onDone (fn) { onDoneFn = fn },
    destroy () { root.innerHTML = ''; onFlipFn = onPairFn = onDoneFn = null },
  }
}
