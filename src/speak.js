// 唸給狗狗聽。狗狗舉一張牌，她按麥克風唸出來，用瀏覽器的語音辨識判斷。
// 辨識小孩的單音不會很準，所以 main.js 只在唸對時記錄，沒聽出來不算她錯。
// 介面：show(symbol)、setListening(bool)、heard(text)、celebrate()、sad()、onMic(fn)、destroy。
// 另外匯出 speechAvailable()、createListener()、matchesSymbol()。

import { dogSvg, bgHtml, symbolMarkup } from './art.js'
import { mountBgs } from './ui.js'
import { SPEAK_ACCEPT } from './data.js'

const MIC_SVG = `<svg viewBox="0 0 24 24" width="90" height="90" fill="#fff"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.9V22h2v-3.1A8 8 0 0 0 20 11h-2z"/></svg>`

export function speechAvailable () {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// 一條連續的辨識：整局只開一次，瀏覽器就只問一次麥克風。
// next(ms, isMatch) 回 { status, transcripts }：
//   heard 有聽到字、silent 時間到沒聲音、denied 麥克風被擋、nomic 沒有麥克風、network 辨識服務連不上、unavailable 瀏覽器沒這功能
// 手機 Chrome 在連續模式下，最後定案的結果常常要等很久甚至不給，所以也收「還在猜」的中途結果：
//   中途結果只要有一個對得上答案（isMatch）就直接算聽到；時間到了還沒定案，就拿最後一次中途結果去判。
//   中途結果也會經 onInterim 丟出去，畫面上即時顯示聽到什麼，大人才知道麥克風有在動。
export function createListener () {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition
  let r = null
  let active = false
  let waiter = null // { resolve, timer, isMatch, interim }
  let fault = null // 'denied' | 'nomic' | 'network' | null
  let interimFn = null
  const events = [] // 最近幾個辨識事件，出問題時顯示給大人看
  function log (name) { events.push(name); if (events.length > 8) events.shift() }

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
    r.interimResults = true
    r.maxAlternatives = 5
    r.onstart = () => log('start')
    r.onaudiostart = () => log('audio')
    r.onsoundstart = () => log('sound')
    r.onspeechstart = () => log('speech')
    r.onspeechend = () => log('speechend')
    r.onnomatch = () => log('nomatch')
    r.onresult = e => {
      log('result')
      const finals = []
      const interims = []
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        for (const alt of res) (res.isFinal ? finals : interims).push(alt.transcript)
      }
      if (finals.length) { deliver('heard', finals.concat(interims)); return }
      if (!interims.length) return
      if (interimFn) interimFn(interims[0])
      if (!waiter) return
      waiter.interim = interims
      if (waiter.isMatch && waiter.isMatch(interims)) deliver('heard', interims)
    }
    r.onerror = e => {
      log('error:' + e.error)
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { fault = 'denied'; deliver('denied') }
      else if (e.error === 'audio-capture') { fault = 'nomic'; deliver('nomic') }
      else if (e.error === 'network') { fault = 'network'; deliver('network') }
      // no-speech、aborted 這類不算故障，onend 會重開
    }
    // Chrome 一段時間沒聲音會自己結束，活著就重開（不會再問權限）
    r.onend = () => { log('end'); r = null; if (active && !fault) setTimeout(spawn, 200) }
    try { r.start() } catch (err) { log('startfail'); r = null }
  }

  return {
    start () { if (active) return; active = true; spawn() },
    stop () {
      active = false
      deliver('silent')
      if (r) { try { r.onend = null; r.stop() } catch (err) { /* 已停 */ } r = null }
    },
    fault () { return !R ? 'unavailable' : fault },
    onInterim (fn) { interimFn = fn },
    debug () { return events.join(' ') || '（沒有任何辨識事件）' },
    next (ms = 5000, isMatch = null) {
      if (!R) return Promise.resolve({ status: 'unavailable', transcripts: [] })
      if (fault) return Promise.resolve({ status: fault, transcripts: [] })
      if (!r && active) spawn()
      return new Promise(resolve => {
        if (waiter) deliver('silent')
        const w = { resolve, isMatch, interim: [] }
        // 時間到：有中途結果就拿它判，完全沒聲音才算沒聽到
        w.timer = setTimeout(() => { if (w.interim.length) deliver('heard', w.interim); else deliver('silent') }, ms)
        waiter = w
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
  root.innerHTML = bgHtml('home') + '<div class="frame">' +
    '<div class="dog-wrap speak-dog">' + dogSvg(color) + '</div>' +
    '<div class="sign"><div class="sign-board"><span></span></div><div class="sign-post"></div></div>' +
    '<div class="heard"></div>' +
    `<button class="mic-btn" aria-label="唸給狗狗聽">${MIC_SVG}</button></div>`
  mountBgs(root)
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
