// 特效：答對時星星爆開、骨頭一根根飛進計數器、手機輕輕震動。
// 全部畫在舞台最上層的 #fx，不擋點擊。座標一律換成舞台座標，直版橫版都對。

import { stagePoint } from './ui.js'
import { boneSvg } from './art.js'

const SPARK_COLORS = ['#E8C86A', '#E39AA8', '#6B9E6B', '#4A6FA5', '#E0955B']

function fxLayer () {
  let el = document.getElementById('fx')
  if (!el) {
    el = document.createElement('div')
    el.id = 'fx'
    document.getElementById('stage').appendChild(el)
  }
  return el
}

function centerOf (el) {
  const r = el.getBoundingClientRect()
  return stagePoint({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 })
}

// 在某個元素的中心爆出一圈星星和彩色小點
export function burstAt (el, { count = 14, spread = 1 } = {}) {
  if (!el || !el.isConnected) return
  const [x, y] = centerOf(el)
  const layer = fxLayer()
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span')
    const star = i % 3 === 0
    p.className = star ? 'fx-spark star' : 'fx-spark'
    if (star) { p.textContent = '★'; p.style.color = SPARK_COLORS[i % SPARK_COLORS.length] } else p.style.background = SPARK_COLORS[i % SPARK_COLORS.length]
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const d = (80 + Math.random() * 90) * spread
    p.style.left = x + 'px'
    p.style.top = y + 'px'
    p.style.setProperty('--dx', Math.cos(a) * d + 'px')
    p.style.setProperty('--dy', Math.sin(a) * d + 'px')
    layer.appendChild(p)
    setTimeout(() => p.remove(), 900)
  }
}

// 骨頭從 fromEl 飛到 toEl，一根一根（最多 8 根），每根到了呼叫 onEach(i, last)。
// 找不到起點或終點就直接呼叫，數字照樣會更新。
export function flyBones (fromEl, toEl, n, onEach = () => {}) {
  const k = Math.max(1, Math.min(n, 8))
  if (!fromEl || !toEl || !fromEl.isConnected || !toEl.isConnected) {
    for (let i = 0; i < k; i++) onEach(i, i === k - 1)
    return
  }
  const [x0, y0] = centerOf(fromEl)
  const [x1, y1] = centerOf(toEl)
  const layer = fxLayer()
  for (let i = 0; i < k; i++) {
    const b = document.createElement('span')
    b.className = 'fx-bone'
    b.innerHTML = boneSvg()
    layer.appendChild(b)
    // 走一條往上拱的弧線，每根高低左右都不太一樣
    const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 220
    const my = Math.min(y0, y1) - 70 - Math.random() * 90
    const anim = b.animate([
      { left: x0 + 'px', top: y0 + 'px', transform: 'translate(-50%, -50%) scale(0.5) rotate(0deg)', opacity: 0.2 },
      { left: mx + 'px', top: my + 'px', transform: 'translate(-50%, -50%) scale(1.15) rotate(200deg)', opacity: 1, offset: 0.45 },
      { left: x1 + 'px', top: y1 + 'px', transform: 'translate(-50%, -50%) scale(0.7) rotate(360deg)', opacity: 1 },
    ], { duration: 700, delay: i * 110, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'both' })
    // 動畫被瀏覽器暫停（分頁在背景、省電模式）也要讓數字更新：時間到還沒飛完就直接算到了
    let done = false
    const arrive = () => { if (done) return; done = true; b.remove(); onEach(i, i === k - 1) }
    anim.onfinish = arrive
    setTimeout(arrive, 700 + i * 110 + 500)
  }
}

// 讓元素彈一下（計數器收到骨頭、腳印蓋上去）
export function bump (el) {
  if (!el) return
  el.classList.remove('bump')
  void el.offsetWidth
  el.classList.add('bump')
}

// 手機震動：答對短短一下、答錯兩下。不支援的裝置什麼都不做
export function buzz (pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern) } catch (err) { /* 不支援就算了 */ }
}
