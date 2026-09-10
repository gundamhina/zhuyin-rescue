// 發音與音效。語音合成唸代表字；audio/ 資料夾有錄音就改播錄音；音效全部現場合成。

import { REP_CHAR } from './data.js'

// getSettings 回傳目前設定 { voiceName, rate, repChar }，每次唸都重新拿，面板改了馬上生效。
export function createAudio (getSettings) {
  let ctx = null
  let voices = []
  const recordingExists = {} // 符號 → true/false，第一次試過就記住

  function refreshVoices () {
    if (!('speechSynthesis' in window)) return
    voices = window.speechSynthesis.getVoices()
  }
  if ('speechSynthesis' in window) {
    refreshVoices()
    window.speechSynthesis.onvoiceschanged = refreshVoices
  }

  function pickVoice () {
    refreshVoices()
    const settings = getSettings()
    if (settings.voiceName) {
      const chosen = voices.find(v => v.name === settings.voiceName)
      if (chosen) return chosen
    }
    const tw = voices.filter(v => /zh[-_]TW/i.test(v.lang))
    return tw.find(v => /Google/i.test(v.name)) || tw[0] ||
      voices.find(v => /^zh/i.test(v.lang)) || null
  }

  // 第一次觸碰時呼叫：建立 AudioContext、暖機語音合成。
  function unlock () {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) ctx = new AC()
    }
    if (ctx && ctx.state === 'suspended') ctx.resume()
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      window.speechSynthesis.speak(u)
    }
  }

  function speakTts (text) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve()
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'zh-TW'
      u.rate = getSettings().rate || 0.8
      const v = pickVoice()
      if (v) u.voice = v
      let done = false
      const finish = () => { if (!done) { done = true; resolve() } }
      u.onend = finish
      u.onerror = finish
      setTimeout(finish, 3000) // 語音卡住也不要卡遊戲
      window.speechSynthesis.speak(u)
    })
  }

  const RECORDING_EXTS = ['wav', 'mp3']
  let currentEl = null // 正在播的錄音，換題時先停掉

  // onStart 在聲音真的開始出來時呼叫，讓遊戲可以提早開放點擊
  function playFile (url, onStart) {
    return new Promise(resolve => {
      const el = new Audio(url)
      currentEl = el
      el.onplaying = () => { if (onStart) onStart() }
      el.onended = () => resolve(true)
      el.onpause = () => resolve(true) // 被 stop() 中斷也要讓等待的人繼續
      el.onerror = () => resolve(false)
      el.play().catch(() => resolve(false))
    })
  }

  // audio/ㄅ.wav 或 audio/ㄅ.mp3，哪個有就播哪個。找過一次的結果記住，不重複試。
  async function playRecording (symbol, onStart) {
    const known = recordingExists[symbol]
    if (known === false) return false
    if (typeof known === 'string') return playFile(known, onStart)
    for (const ext of RECORDING_EXTS) {
      const url = 'audio/' + encodeURIComponent(symbol) + '.' + ext
      if (await playFile(url, onStart)) { recordingExists[symbol] = url; return true }
    }
    recordingExists[symbol] = false
    return false
  }

  function stop () {
    if (currentEl) { currentEl.pause(); currentEl = null }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  // 唸一個符號。回傳 Promise，唸完才 resolve。有官方錄音就播錄音，沒有才用語音合成。
  async function say (symbol, { onStart } = {}) {
    stop()
    if (await playRecording(symbol, onStart)) return
    const settings = getSettings()
    const text = (settings.repChar && settings.repChar[symbol]) || REP_CHAR[symbol] || symbol
    if (onStart) onStart()
    await speakTts(text)
  }

  function tone (freq, start, dur, type = 'sine', gain = 0.25) {
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, ctx.currentTime + start)
    g.gain.setValueAtTime(0, ctx.currentTime + start)
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
    o.connect(g).connect(ctx.destination)
    o.start(ctx.currentTime + start)
    o.stop(ctx.currentTime + start + dur + 0.05)
  }

  function ding () { tone(880, 0, 0.18); tone(1320, 0.12, 0.3) }
  function wrong () {
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(300, ctx.currentTime)
    o.frequency.linearRampToValueAtTime(380, ctx.currentTime + 0.25)
    g.gain.setValueAtTime(0.2, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.4)
  }
  function splash () {
    if (!ctx) return
    const len = ctx.sampleRate * 0.35
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1200
    const g = ctx.createGain()
    g.gain.value = 0.4
    src.connect(f).connect(g).connect(ctx.destination)
    src.start()
  }
  // 咬餅乾：短短的雜訊
  function crunch () {
    if (!ctx) return
    const len = Math.floor(ctx.sampleRate * 0.12)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 2200
    const g = ctx.createGain()
    g.gain.value = 0.5
    src.connect(f).connect(g).connect(ctx.destination)
    src.start()
    tone(180, 0.02, 0.1, 'square', 0.08)
  }
  // 翻牌：輕輕一聲
  function flip () { tone(660, 0, 0.07, 'triangle', 0.15) }
  function cheer () {
    const notes = [523, 659, 784, 1047]
    notes.forEach((n, i) => tone(n, i * 0.12, 0.35, 'triangle', 0.2))
    tone(1319, 0.5, 0.6, 'triangle', 0.2)
  }

  return { unlock, say, stop, ding, wrong, splash, crunch, flip, cheer, listVoices: () => { refreshVoices(); return voices } }
}
