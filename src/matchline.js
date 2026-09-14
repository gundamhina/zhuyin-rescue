// 連連看。左邊 4 個詞的注音，右邊 4 張圖打亂，從詞拉線到圖。對了線留著，錯了線消失。
// 介面：start(words)、onPair(fn(word, pickedWord))、onPicTap(fn(word))、markCorrect(word, pickedWord)、markWrong(word, pickedWord)、onDone(fn)、destroy。
// 沒選詞的時候點圖，會呼叫 onPicTap（主流程拿去唸這個詞）。

import { dogSvg, homeBgSvg, symbolMarkup, wordPicMarkup } from './art.js'
import { stagePoint } from './ui.js'

const LEFT_X = 330 // 詞卡右緣（線的起點）
const RIGHT_X = 740 // 圖卡左緣（線的終點）
const ROW_Y = [120, 290, 460, 630]

function shuffleWords (arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function createMatchLine (root, { color = 0 } = {}) {
  root.innerHTML = homeBgSvg() +
    '<div class="dog-wrap match-dog">' + dogSvg(color) + '</div>' +
    '<svg class="lines" viewBox="0 0 1200 800" width="1200" height="800" xmlns="http://www.w3.org/2000/svg"><g class="done"></g><line class="live" x1="0" y1="0" x2="0" y2="0"/></svg>' +
    '<div class="match-words"></div><div class="match-pics"></div>'
  const dogWrap = root.querySelector('.match-dog')
  const wordsEl = root.querySelector('.match-words')
  const picsEl = root.querySelector('.match-pics')
  const doneG = root.querySelector('.lines .done')
  const live = root.querySelector('.lines .live')
  let pairFn = null
  let doneFn = null
  let picTapFn = null
  let remaining = 0
  let drag = null // { word, x0, y0 }
  let selected = null // 點一下詞再點一下圖也可以

  function anchorOfWord (word) {
    const i = [...wordsEl.children].findIndex(c => c.dataset.symbol === word)
    return [LEFT_X, ROW_Y[i]]
  }
  function anchorOfPic (word) {
    const i = [...picsEl.children].findIndex(c => c.dataset.symbol === word)
    return [RIGHT_X, ROW_Y[i]]
  }

  wordsEl.addEventListener('pointerdown', e => {
    const card = e.target.closest('.mword')
    if (!card || card.classList.contains('matched')) return
    wordsEl.querySelectorAll('.mword').forEach(c => c.classList.remove('picked'))
    card.classList.add('picked')
    selected = card.dataset.symbol
    const [x0, y0] = anchorOfWord(selected)
    drag = { word: selected, x0, y0 }
    live.setAttribute('x1', x0); live.setAttribute('y1', y0)
    live.setAttribute('x2', x0); live.setAttribute('y2', y0)
    live.classList.add('show')
    try { card.setPointerCapture(e.pointerId) } catch (err) { /* 不給鎖也能拉 */ }
  })
  root.addEventListener('pointermove', e => {
    if (!drag) return
    const [x, y] = stagePoint(e)
    live.setAttribute('x2', x); live.setAttribute('y2', y)
  })
  function endDrag (e) {
    if (!drag) return
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const pic = el && el.closest('.mpic')
    live.classList.remove('show')
    const word = drag.word
    drag = null
    if (pic && !pic.classList.contains('matched') && pairFn) {
      selected = null
      wordsEl.querySelectorAll('.mword').forEach(c => c.classList.remove('picked'))
      pairFn(word, pic.dataset.symbol)
    }
    // 沒拉到圖：保留選取，讓她點圖也行
  }
  root.addEventListener('pointerup', endDrag)
  root.addEventListener('pointercancel', endDrag)
  picsEl.addEventListener('pointerdown', e => {
    const pic = e.target.closest('.mpic')
    if (!pic || drag) return
    if (!selected) { if (picTapFn) picTapFn(pic.dataset.symbol); return }
    if (pic.classList.contains('matched') || !pairFn) return
    const word = selected
    selected = null
    wordsEl.querySelectorAll('.mword').forEach(c => c.classList.remove('picked'))
    pairFn(word, pic.dataset.symbol)
  })

  function start (words) {
    remaining = words.length
    selected = null
    drag = null
    doneG.innerHTML = ''
    wordsEl.innerHTML = words.map((w, i) => `
      <div class="mword" data-symbol="${w}" style="top:${ROW_Y[i] - 80}px"><span>${symbolMarkup(w)}</span></div>`).join('')
    picsEl.innerHTML = shuffleWords(words).map((w, i) => `
      <div class="mpic" data-symbol="${w}" style="top:${ROW_Y[i] - 80}px">${wordPicMarkup(w)}</div>`).join('')
  }

  function drawLine (word, pickedWord, cls) {
    const [x1, y1] = anchorOfWord(word)
    const [x2, y2] = anchorOfPic(pickedWord)
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2)
    l.setAttribute('class', cls)
    doneG.appendChild(l)
    return l
  }
  function markCorrect (word, pickedWord) {
    drawLine(word, pickedWord, 'ok')
    const w = wordsEl.querySelector(`.mword[data-symbol="${word}"]`)
    const p = picsEl.querySelector(`.mpic[data-symbol="${pickedWord}"]`)
    if (w) w.classList.add('matched')
    if (p) p.classList.add('matched')
    dogWrap.classList.remove('jump')
    void dogWrap.offsetWidth
    dogWrap.classList.add('jump')
    remaining--
    if (remaining === 0 && doneFn) setTimeout(doneFn, 900)
  }
  function markWrong (word, pickedWord) {
    const l = drawLine(word, pickedWord, 'bad')
    setTimeout(() => l.remove(), 700)
    const p = picsEl.querySelector(`.mpic[data-symbol="${pickedWord}"]`)
    if (p) { p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake') }
    dogWrap.classList.remove('tilt')
    void dogWrap.offsetWidth
    dogWrap.classList.add('tilt')
  }

  return {
    start,
    onPair (fn) { pairFn = fn },
    onDone (fn) { doneFn = fn },
    onPicTap (fn) { picTapFn = fn },
    markCorrect,
    markWrong,
    destroy () { root.innerHTML = ''; pairFn = doneFn = picTapFn = null },
  }
}
