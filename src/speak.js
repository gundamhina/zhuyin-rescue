// 唸給狗狗聽。狗狗舉一張牌，她按麥克風唸出來，用瀏覽器的語音辨識判斷。
// 辨識小孩的單音不會很準，所以 main.js 只在唸對時記錄，沒聽出來不算她錯。
// 介面：show(symbol)、setListening(bool)、heard(text)、celebrate()、sad()、onMic(fn)、destroy。
// 另外匯出 speechAvailable()、createListener()、matchesSymbol()。

import { dogSvg, homeBgSvg, symbolMarkup } from './art.js'
import { SPEAK_ACCEPT } from './data.js'

const MIC_SVG = `<svg viewBox="0 0 24 24" width="90" height="90" fill="#fff"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.9V22h2v-3.1A8 8 0 0 0 20 11h-2z"/></svg>`

export function speechAvailable () {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// 一條連續的辨識：整局只開一次，瀏覽器就只問一次麥克風。
// next(ms) 回 { status, transcripts }：
//   heard 有聽到字、silent 時間到沒聲音、denied 麥克風被擋、network 辨識服務連不上、unavailable 瀏覽器沒這功能
export function createListener () {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition
  let r = null
  let active = false
  let waiter = null // { resolve, timer }
  let fault = null // 'denied' | 'network' | null

  function deliver (status, transcripts = []) {
    if (!waiter) return
    clearTimeout(waiter.timer)
    const { resolve } = waiter
    waiter = null
    resolve({ status, transcripts })
  }

  function spawn () {
    if (!R || !active || fault) return
    r = new R()
    r.lang = 'zh-TW'
    r.continuous = true
    r.interimResults = false
    r.maxAlternatives = 5
    r.onresult = e => {
      const alts = []
      for (let i = e.resultIndex; i < e.results.length; i++) {
        for (const alt of e.results[i]) alts.push(alt.transcript)
      }
      if (alts.length) deliver('heard', alts)
    }
    r.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { fault = 'denied'; deliver('denied') }
      else if (e.error === 'network') { fault = 'network'; deliver('network') }
      // no-speech、aborted 這類不算故障，onend 會重開
    }
    // Chrome 一段時間沒聲音會自己結束，活著就重開（不會再問權限）
    r.onend = () => { r = null; if (active && !fault) setTimeout(spawn, 200) }
    try { r.start() } catch (err) { r = null }
  }

  return {
    start () { if (active) return; active = true; spawn() },
    stop () {
      active = false
      deliver('silent')
      if (r) { try { r.onend = null; r.stop() } catch (err) { /* 已停 */ } r = null }
    },
    fault () { return !R ? 'unavailable' : fault },
    next (ms = 5000) {
      if (!R) return Promise.resolve({ status: 'unavailable', transcripts: [] })
      if (fault) return Promise.resolve({ status: fault, transcripts: [] })
      if (!r && active) spawn()
      return new Promise(resolve => {
        if (waiter) deliver('silent')
        waiter = { resolve, timer: setTimeout(() => deliver('silent'), ms) }
      })
    },
  }
}

// 進遊戲先問一次麥克風。回 'granted' | 'denied' | 'unknown'。
export async function requestMic () {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'unknown'
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(t => t.stop())
    return 'granted'
  } catch (err) {
    return (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) ? 'denied' : 'unknown'
  }
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
    signText.innerHTML = symbolMarkup(symbol)
    signEl.classList.remove('glow')
    heardEl.textContent = ''
    heardEl.classList.remove('show')
  }
  function setListening (on) {
    micBtn.classList.toggle('listening', on)
    dogWrap.classList.toggle('listening', on)
  }
  // 顯示辨識到的字或狀態，給旁邊的大人看，小孩不用看得懂
  function heard (text) {
    heardEl.textContent = text ? '「' + text + '」' : '…？'
    heardEl.classList.remove('warn')
    heardEl.classList.add('show')
  }
  function notice (text, isWarn = true) {
    heardEl.textContent = text
    heardEl.classList.toggle('warn', isWarn)
    heardEl.classList.add('show')
  }
  function setMicEnabled (on) {
    micBtn.classList.toggle('disabled', !on)
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

  return { show, setListening, heard, notice, setMicEnabled, celebrate, sad, onMic, destroy }
}
