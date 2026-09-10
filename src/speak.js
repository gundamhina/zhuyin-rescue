// 唸給狗狗聽。狗狗舉一張牌，她按麥克風唸出來，用瀏覽器的語音辨識判斷。
// 辨識小孩的單音不會很準，所以 main.js 只在唸對時記錄，沒聽出來不算她錯。
// 介面：show(symbol)、setListening(bool)、heard(text)、celebrate()、sad()、onMic(fn)、destroy。
// 另外匯出 speechAvailable()、listen()、matchesSymbol()。

import { dogSvg, homeBgSvg } from './art.js'
import { SPEAK_ACCEPT } from './data.js'

const MIC_SVG = `<svg viewBox="0 0 24 24" width="90" height="90" fill="#fff"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.9V22h2v-3.1A8 8 0 0 0 20 11h-2z"/></svg>`

export function speechAvailable () {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// 聽一次，回傳可能的字串列表（沒聽到就是空陣列）。最多等 5 秒。
export function listen () {
  return new Promise(resolve => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!R) return resolve([])
    const r = new R()
    r.lang = 'zh-TW'
    r.interimResults = false
    r.maxAlternatives = 5
    let done = false
    const finish = (list) => { if (!done) { done = true; try { r.stop() } catch (err) { /* 已停 */ } resolve(list) } }
    r.onresult = e => {
      const alts = []
      for (const res of e.results) for (const alt of res) alts.push(alt.transcript)
      finish(alts)
    }
    r.onerror = () => finish([])
    r.onend = () => finish([])
    setTimeout(() => finish([]), 5000)
    try { r.start() } catch (err) { finish([]) }
  })
}

// 辨識結果裡出現符號本身，或它的同音字任何一個，就算唸對
export function matchesSymbol (symbol, transcripts) {
  const accept = SPEAK_ACCEPT[symbol] || ''
  return transcripts.some(t => {
    const clean = String(t).replace(/[\s，。、？！,.?!]/g, '')
    if (clean.includes(symbol)) return true
    return [...clean].some(ch => accept.includes(ch))
  })
}

export function createSpeak (root, { color = 0 } = {}) {
  root.innerHTML = homeBgSvg() +
    '<div class="dog-wrap speak-dog">' + dogSvg(color) + '</div>' +
    '<div class="sign"><div class="sign-board"><span></span></div><div class="sign-post"></div></div>' +
    '<div class="heard"></div>' +
    `<button class="mic-btn" aria-label="唸給狗狗聽">${MIC_SVG}</button>`
  const dogWrap = root.querySelector('.speak-dog')
  const signEl = root.querySelector('.sign')
  const signText = root.querySelector('.sign-board span')
  const heardEl = root.querySelector('.heard')
  const micBtn = root.querySelector('.mic-btn')
  let handler = null

  micBtn.addEventListener('pointerdown', () => { if (handler) handler() })

  function show (symbol) {
    signText.textContent = symbol
    signEl.classList.remove('glow')
    heardEl.textContent = ''
    heardEl.classList.remove('show')
  }
  function setListening (on) {
    micBtn.classList.toggle('listening', on)
    dogWrap.classList.toggle('listening', on)
  }
  // 顯示辨識到的字，給旁邊的大人看，小孩不用看得懂
  function heard (text) {
    heardEl.textContent = text ? '「' + text + '」' : '…？'
    heardEl.classList.add('show')
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
  function onMic (fn) { handler = fn }
  function destroy () { root.innerHTML = ''; handler = null }

  return { show, setListening, heard, celebrate, sad, onMic, destroy }
}
