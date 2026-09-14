// 填空。左邊一張圖，牌子上詞的注音少一個音節（空格），下面幾塊音節，拖對的進空格（點一下也行）。
// 介面：start(q, { blankIndex, tiles })、lock/unlock、onAnswer(fn(syllable))、onPicTap(fn(word))、fill()、bounce(syllable)、celebrate、sad、destroy。

import { dogSvg, homeBgSvg, symbolMarkup, wordPicMarkup } from './art.js'
import { stagePoint } from './ui.js'

const TILE_SLOTS = { 2: [[480, 620], [760, 620]], 3: [[380, 620], [620, 620], [860, 620]], 4: [[300, 620], [500, 620], [700, 620], [900, 620]] }

export function createFillBlank (root, { color = 0 } = {}) {
  root.innerHTML = homeBgSvg() +
    '<div class="dog-wrap fill-dog">' + dogSvg(color) + '</div>' +
    '<div class="fill-pic"></div>' +
    '<div class="sign fill-sign"><div class="sign-board"><span class="fill-word"></span></div><div class="sign-post"></div></div>' +
    '<div class="tiles"></div>'
  const dogWrap = root.querySelector('.fill-dog')
  const picEl = root.querySelector('.fill-pic')
  const signEl = root.querySelector('.fill-sign')
  const wordEl = root.querySelector('.fill-word')
  const tilesEl = root.querySelector('.tiles')
  let handler = null
  let picTapFn = null
  let locked = true
  let current = null
  let blankIndex = 0
  let drag = null

  function renderWord (filled = null) {
    const syls = current.target.split(' ')
    wordEl.innerHTML = `<span class="word w${syls.length}">${syls.map((s, i) => i === blankIndex
      ? (filled ? symbolMarkup(filled) : '<span class="blank"></span>')
      : symbolMarkup(s)).join('')}</span>`
  }

  picEl.addEventListener('pointerdown', () => { if (current && picTapFn) picTapFn(current.target) })

  tilesEl.addEventListener('pointerdown', e => {
    const t = e.target.closest('.tile')
    if (!t || locked) return
    const [sx, sy] = stagePoint(e)
    drag = { t, startX: sx, startY: sy, ox: parseFloat(t.style.left), oy: parseFloat(t.style.top), moved: false }
    t.classList.add('dragging')
    try { t.setPointerCapture(e.pointerId) } catch (err) { /* 不給鎖也能拖 */ }
  })
  tilesEl.addEventListener('pointermove', e => {
    if (!drag) return
    const [sx, sy] = stagePoint(e)
    const dx = sx - drag.startX
    const dy = sy - drag.startY
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true
    drag.t.style.left = (drag.ox + dx) + 'px'
    drag.t.style.top = (drag.oy + dy) + 'px'
  })
  function endDrag (e) {
    if (!drag) return
    const { t, ox, oy, moved } = drag
    drag = null
    t.classList.remove('dragging')
    // 放到空格上（或沒拖動、點一下）都算選這塊
    const blank = wordEl.querySelector('.blank')
    let hit = !moved
    if (moved && blank) {
      // 空格中心換成舞台座標，放手的點離它 130 以內就算放進去
      const b = blank.getBoundingClientRect()
      const [bx, by] = stagePoint({ clientX: (b.left + b.right) / 2, clientY: (b.top + b.bottom) / 2 })
      const [px, py] = stagePoint(e)
      hit = Math.abs(px - bx) < 130 && Math.abs(py - by) < 160
    }
    if (hit && handler) { handler(t.dataset.syllable, t); return }
    t.classList.add('returning')
    t.style.left = ox + 'px'
    t.style.top = oy + 'px'
    setTimeout(() => t.classList.remove('returning'), 350)
  }
  tilesEl.addEventListener('pointerup', endDrag)
  tilesEl.addEventListener('pointercancel', endDrag)

  function start (question, { blankIndex: bi, tiles }) {
    current = question
    blankIndex = bi
    locked = true
    picEl.className = 'fill-pic'
    picEl.innerHTML = wordPicMarkup(question.target)
    signEl.classList.remove('glow')
    renderWord()
    const slots = TILE_SLOTS[tiles.length] || TILE_SLOTS[3]
    tilesEl.innerHTML = ''
    tiles.forEach((syl, i) => {
      const [x, y] = slots[i]
      const t = document.createElement('div')
      t.className = 'tile'
      t.dataset.syllable = syl
      t.style.left = (x - 80) + 'px'
      t.style.top = (y - 80) + 'px'
      t.innerHTML = `<span>${symbolMarkup(syl)}</span>`
      tilesEl.appendChild(t)
    })
  }
  function tileOf (syl) { return tilesEl.querySelector(`.tile[data-syllable="${syl}"]`) }
  function unlock () { locked = false }
  function lock () { locked = true }
  // 對了：音節填進空格，那塊磁磚消失
  function fill (syl) {
    renderWord(syl)
    const t = tileOf(syl)
    if (t) t.classList.add('gone')
  }
  // 錯了：彈回原位晃一下
  function bounce (syl) {
    const t = tileOf(syl)
    if (!t) return
    const i = [...tilesEl.children].indexOf(t)
    const slots = TILE_SLOTS[tilesEl.children.length] || TILE_SLOTS[3]
    t.classList.add('returning')
    t.style.left = (slots[i][0] - 80) + 'px'
    t.style.top = (slots[i][1] - 80) + 'px'
    setTimeout(() => { t.classList.remove('returning', 'shake'); void t.offsetWidth; t.classList.add('shake') }, 300)
  }
  function celebrate () {
    return new Promise(resolve => {
      signEl.classList.add('glow')
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
  function onPicTap (fn) { picTapFn = fn }
  function destroy () { root.innerHTML = ''; handler = picTapFn = null }

  return { start, unlock, lock, fill, bounce, celebrate, sad, onAnswer, onPicTap, destroy }
}
