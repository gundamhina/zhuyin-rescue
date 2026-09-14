// 把所有模組接起來：使用者、狀態、出題、三種玩法、畫面切換。

import { buildRound, recordAnswer, resetProgress, pickSymbols, singleSymbolState, noWordsState, wordsOnlyState, activePool, effectiveTier, trackView, applyTrack } from './scheduler.js'
import { createStore } from './store.js'
import { createAudio } from './audio.js'
import { createFishing } from './fishing.js'
import { createWhack } from './whack.js'
import { createMemory } from './memory.js'
import { createSpeak, speechAvailable, createListener, matchesSymbol, requestMic } from './speak.js'
import { createWrite } from './write.js'
import { createMatchLine } from './matchline.js'
import { createFillBlank } from './fillblank.js'
import { fitStage, layoutBg, goFullscreenOnPhone, showScreen, renderProfiles, renderHome, renderResult, playResult, renderPanel, panelMessage } from './ui.js'
import { renderCheck } from './check.js'

const SETTINGS_KEY = 'zhuyin-rescue-settings'
const MEMORY_PAIRS = 5
// 每個玩法練哪一軌：聽（釣魚、打地鼠、翻牌）、讀（唸給狗狗聽）、寫（寫給狗狗看）
const TRACK_OF = { fishing: 'listen', whack: 'listen', memory: 'listen', speak: 'read', write: 'write', match: 'read', fill: 'read' }
const MATCH_PAIRS = 4
// 唸給狗狗聽的狀態訊息，寫給旁邊的大人看
const MIC_MSG = {
  silent: '沒聽到聲音，靠近一點再唸一次',
  denied: '麥克風被封鎖了：按網址列左邊的鎖頭或圖示，把麥克風改成「允許」，再重新整理',
  network: '語音辨識要連網才能用，請確認網路',
  unavailable: '這個瀏覽器沒有語音辨識，請用 Chrome',
}

function loadSettings () {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {} } catch (err) { return {} }
}
function saveSettings (s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) }

function main () {
  const stage = document.getElementById('stage')
  // 螢幕大小或方向變了：舞台變形、背景重鋪、正在玩的遊戲重排
  function relayout () {
    const changed = fitStage(stage)
    if (!changed) return
    document.querySelectorAll('.bg').forEach(layoutBg)
    if (game && game.layout) game.layout()
  }
  fitStage(stage)
  window.addEventListener('resize', relayout)
  window.addEventListener('orientationchange', () => setTimeout(relayout, 300))
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout)
  // 手機上碰畫面就進全螢幕並鎖橫向（只在真的點下去時有效；退出全螢幕後再點會再進）
  document.addEventListener('pointerdown', goFullscreenOnPhone)
  showInstallHint()

  const store = createStore(localStorage)
  let settings = loadSettings()
  const audio = createAudio(() => settings)

  let profile = null
  let state = null

  const profilesEl = document.getElementById('screen-profiles')
  const homeEl = document.getElementById('screen-home')
  const gameEl = document.getElementById('screen-game')
  const resultEl = document.getElementById('screen-result')
  const panelEl = document.getElementById('screen-panel')

  // ---- 選人 ----
  function goProfiles () {
    renderProfiles(profilesEl, {
      profiles: store.loadProfiles(),
      onPick (id) { audio.unlock(); pickProfile(id) },
      onAdd (info) { audio.unlock(); const p = store.addProfile(info); pickProfile(p.id) },
      onGear: gearTap,
    })
    showScreen('profiles')
  }

  function pickProfile (id) {
    const profiles = store.loadProfiles()
    profile = profiles.list.find(p => p.id === id)
    if (!profile) return goProfiles()
    store.setCurrent(id)
    state = store.load(id)
    goHome()
  }

  // ---- 首頁 ----
  function goHome () {
    destroyGame()
    renderHome(homeEl, { profile, speech: speechAvailable() })
    homeEl.querySelector('#btn-who').addEventListener('pointerdown', goProfiles)
    homeEl.querySelectorAll('[data-game]').forEach(card => {
      card.addEventListener('pointerdown', () => { audio.unlock(); startGame(card.dataset.game) })
    })
    homeEl.querySelector('#btn-gear').addEventListener('pointerdown', gearTap)
    showScreen('home')
  }

  // 齒輪 2 秒內連點三下才開大人面板。每點一下齒輪旁顯示還差幾下，讓大人知道它沒壞。
  let gearTaps = []
  let gearHintTimer = null
  function gearTap (e) {
    const now = Date.now()
    gearTaps = gearTaps.filter(t => now - t < 2000)
    gearTaps.push(now)
    if (gearTaps.length >= 3) { gearTaps = []; hideGearHint(); openPanel(); return }
    const gear = e.currentTarget
    let hint = gear.parentElement.querySelector('.gear-hint')
    if (!hint) {
      hint = document.createElement('div')
      hint.className = 'gear-hint'
      gear.parentElement.appendChild(hint)
    }
    hint.textContent = '再點 ' + (3 - gearTaps.length) + ' 下進家長區'
    clearTimeout(gearHintTimer)
    gearHintTimer = setTimeout(hideGearHint, 2000)
  }
  function hideGearHint () {
    document.querySelectorAll('.gear-hint').forEach(el => el.remove())
  }

  // ---- 遊戲共用 ----
  const playArea = gameEl.querySelector('.play-area')
  const starsEl = gameEl.querySelector('.progress-stars')
  const replayBtn = gameEl.querySelector('#btn-replay')
  let game = null
  let kind = null
  let earned = []
  let starTotal = 5

  function setStars () {
    starsEl.innerHTML = ''
    for (let i = 0; i < starTotal; i++) {
      const s = document.createElement('span')
      s.className = 'star' + (i < earned.length ? (earned[i] ? ' lit' : ' dim') : '')
      s.textContent = '★'
      starsEl.appendChild(s)
    }
  }

  function destroyGame () {
    clearIdle()
    if (game) game.destroy()
    game = null
    if (listener) { listener.stop(); listener = null }
    audio.stop()
  }

  function startGame (which) {
    destroyGame()
    kind = which
    earned = []
    showScreen('game')
    if (which === 'memory') return runMemory()
    if (which === 'speak') return runSpeak()
    if (which === 'match') return runMatch()
    if (which === 'fill') return runFill()
    runQuestions(which)
  }

  gameEl.querySelector('#btn-quit').addEventListener('pointerdown', () => { busy = false; clearIdle(); goHome() })

  // 記到目前玩法那一軌
  function commit (answer) {
    const track = TRACK_OF[kind]
    state = applyTrack(state, track, recordAnswer(trackView(state, track), answer))
    store.save(profile.id, state)
  }
  // 手機、不是加到主畫面開的、又沒有全螢幕 API（app 內建瀏覽器）：提示改用 Chrome 加到主畫面
  function showInstallHint () {
    const hint = document.getElementById('install-hint')
    if (!hint) return
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const standalone = window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches
    const dismissed = (() => { try { return localStorage.getItem('zhuyin-rescue-hint') === '1' } catch (e) { return false } })()
    if (!coarse || standalone || dismissed || document.fullscreenEnabled) return
    hint.hidden = false
    hint.addEventListener('pointerdown', e => {
      e.stopPropagation()
      hint.hidden = true
      try { localStorage.setItem('zhuyin-rescue-hint', '1') } catch (err) { /* 存不了就下次再提示 */ }
    })
  }

  function currentView () { return trackView(state, TRACK_OF[kind]) }

  function finishRound () {
    destroyGame()
    renderResult(resultEl, profile.color)
    resultEl.querySelector('#btn-again').addEventListener('pointerdown', () => startGame(kind))
    resultEl.querySelector('#btn-home').addEventListener('pointerdown', goHome)
    showScreen('result')
    audio.cheer()
    playResult(resultEl, earned)
  }

  // ---- 釣魚、打地鼠：聽音選形 ----
  let round = []
  let index = 0
  let firstAttempt = true
  let askedAt = 0
  let busy = false
  let idleTimer = null

  function clearIdle () { clearTimeout(idleTimer); idleTimer = null }

  // 發呆太久：重唸一次、正確的晃一下。之後每隔同樣秒數再來一次。
  function armIdle (q, myIndex, myGame) {
    clearIdle()
    if (!q.idleHint) return
    idleTimer = setTimeout(async () => {
      if (index !== myIndex || game !== myGame || busy) return
      await audio.say(q.target)
      if (index !== myIndex || game !== myGame) return
      game.hint()
      armIdle(q, myIndex, myGame)
    }, q.idleHint * 1000)
  }

  function runQuestions (which) {
    if (which === 'whack') game = createWhack(playArea, { color: profile.color })
    else if (which === 'write') game = createWrite(playArea, { color: profile.color })
    else game = createFishing(playArea, { color: profile.color })
    replayBtn.classList.remove('hidden')
    // 寫字只出單一符號；聽的玩法不出詞
    const v = currentView()
    round = which === 'write' ? buildRound(singleSymbolState(v), Math.random) : buildRound(noWordsState(v), Math.random)
    index = 0
    starTotal = round.length
    setStars()
    game.onAnswer(onPick)
    askQuestion()
  }

  // 聲音一出來就開放點擊，不等唸完。一開始沒有提示，發呆太久才提示。
  async function askQuestion () {
    const q = round[index]
    const myIndex = index
    const myGame = game
    firstAttempt = true
    clearIdle()
    busy = true
    game.start(q, { isTrace: kind === 'write' && effectiveTier(currentView()) <= 1 })
    game.lock()
    await wait(350)
    let opened = false
    const open = () => {
      if (opened || index !== myIndex || game !== myGame) return
      opened = true
      game.unlock()
      askedAt = Date.now()
      busy = false
    }
    await audio.say(q.target, { onStart: open })
    open()
    if (index === myIndex && game === myGame) armIdle(q, myIndex, myGame)
  }

  replayBtn.addEventListener('pointerdown', () => {
    if (kind === 'memory' || kind === 'speak' || kind === 'match' || kind === 'fill' || !round[index]) return
    if (busy) return
    audio.say(round[index].target)
  })

  async function onPick (symbol) {
    if (busy) return
    const q = round[index]
    const ms = Date.now() - askedAt
    // 描寫沒蓋好：不算錯，晃一下讓她再寫
    if (symbol === '__miss__') { audio.wrong(); game.shake(); game.sad(); return }
    // 聽寫辨識不出是哪個：算錯但不記混淆對，答案會顯示在板子上讓她照著寫
    if (symbol === '__unknown__') {
      if (firstAttempt) { commit({ target: q.target, ok: false, picked: null, ms, drill: q.drill }); firstAttempt = false }
      audio.wrong(); game.shake(); game.sad()
      const myIndex = index; const myGame = game
      setTimeout(async () => { if (index !== myIndex || game !== myGame) return; await audio.say(q.target) }, 500)
      return
    }
    if (symbol === q.target) {
      busy = true
      clearIdle()
      game.lock()
      if (firstAttempt) commit({ target: q.target, ok: true, picked: symbol, ms, drill: q.drill })
      earned.push(firstAttempt)
      setStars()
      audio.stop()
      if (kind === 'whack') audio.crunch(); else if (kind === 'write') audio.ding(); else audio.splash()
      await game.celebrate(symbol)
      if (!game) return // 中途按了回首頁
      audio.ding()
      await wait(250)
      if (!game) return
      index++
      if (index >= round.length) return finishRound()
      askQuestion()
      return
    }
    // 答錯：第一次才記錄；錯的晃、狗狗歪頭、重唸一次。不顯示答案，她自己再選。
    if (firstAttempt) {
      commit({ target: q.target, ok: false, picked: symbol, ms, drill: q.drill })
      firstAttempt = false
    }
    audio.wrong()
    game.shake(symbol)
    game.sad()
    const myIndex = index
    const myGame = game
    setTimeout(async () => {
      if (index !== myIndex || game !== myGame) return
      await audio.say(q.target)
      if (index !== myIndex || game !== myGame) return
      armIdle(q, myIndex, myGame)
    }, 500)
  }

  // ---- 唸給狗狗聽（讀）：她看符號自己唸，遊戲不先播音。每題判完狗狗唸一次答案。只記唸對。 ----
  let speakTries = 0
  let listener = null
  function runSpeak () {
    game = createSpeak(playArea, { color: profile.color })
    replayBtn.classList.add('hidden') // 讀的練習不給聽
    // 麥克風只問一次：整局開一條連續辨識，不每題重開
    if (listener) listener.stop()
    listener = createListener()
    listener.start()
    // 先主動要一次權限，被擋就直接告訴大人，不用等她按
    const myGame = game
    requestMic().then(result => {
      if (game !== myGame) return
      if (result === 'denied') { game.notice(MIC_MSG.denied); game.setMicEnabled(false) }
    })
    round = buildRound(currentView(), Math.random)
    index = 0
    starTotal = round.length
    setStars()
    game.onMic(onMicPressed)
    askSpeak()
  }

  async function askSpeak () {
    const q = round[index]
    speakTries = 0
    firstAttempt = true
    busy = true
    game.show(q.target)
    await wait(400)
    busy = false
  }

  async function onMicPressed () {
    if (busy || !game) return
    const q = round[index]
    const myGame = game
    busy = true
    audio.stop()
    game.setListening(true)
    const { status, transcripts } = await listener.next(5000)
    if (game !== myGame) return
    game.setListening(false)
    // 沒聽到聲音、或麥克風／辨識不能用：不算她唸錯，不播答案
    if (status !== 'heard') {
      if (status === 'silent') { game.notice(MIC_MSG.silent, false); game.sad() } else { game.notice(MIC_MSG[status] || MIC_MSG.unavailable); game.setMicEnabled(false) }
      busy = false
      return
    }
    game.heard(transcripts[0] || '')
    if (matchesSymbol(q.target, transcripts)) {
      if (firstAttempt) commit({ target: q.target, ok: true, picked: q.target, ms: 0, drill: q.drill })
      earned.push(firstAttempt)
      setStars()
      audio.ding()
      await game.celebrate()
      if (game !== myGame) return
      await audio.say(q.target) // 對答案：狗狗唸一次正確的
      if (game !== myGame) return
      await wait(200)
      index++
      if (index >= round.length) return finishRound()
      askSpeak()
      return
    }
    // 沒聽出來或唸錯：狗狗歪頭、唸一次答案。兩次沒過就跳下一題，不記錯
    firstAttempt = false
    speakTries++
    game.sad()
    await audio.say(q.target)
    if (game !== myGame) return
    if (speakTries >= 2) {
      earned.push(false)
      setStars()
      await wait(400)
      index++
      if (index >= round.length) return finishRound()
      askSpeak()
      return
    }
    busy = false
  }

  // ---- 連連看（讀）：4 個詞配 4 張圖，記在讀那軌 ----
  function runMatch () {
    game = createMatchLine(playArea, { color: profile.color })
    replayBtn.classList.add('hidden')
    const words = pickSymbols(wordsOnlyState(currentView()), Math.random, MATCH_PAIRS)
    starTotal = words.length
    setStars()
    const firstTry = {}
    for (const w of words) firstTry[w] = true
    busy = false
    game.onPair(async (word, picked) => {
      if (busy) return
      if (word === picked) {
        busy = true
        if (firstTry[word]) commit({ target: word, ok: true, picked: word, ms: 0, drill: null })
        earned.push(firstTry[word])
        setStars()
        audio.ding()
        game.markCorrect(word, picked)
        await audio.say(word) // 對答案：唸一次這個詞
        busy = false
        return
      }
      if (firstTry[word]) { commit({ target: word, ok: false, picked, ms: 0, drill: null }); firstTry[word] = false }
      audio.wrong()
      game.markWrong(word, picked)
    })
    game.onPicTap(w => { if (!busy) audio.say(w) }) // 點圖聽這個詞怎麼唸
    game.onDone(finishRound)
    game.start(words)
  }

  // ---- 填空（讀）：詞少一個音節，拖對的音節進去 ----
  function runFill () {
    game = createFillBlank(playArea, { color: profile.color })
    replayBtn.classList.add('hidden')
    const v = wordsOnlyState(currentView())
    round = buildRound(v, Math.random)
    index = 0
    starTotal = round.length
    setStars()
    const pool = activePool(v)
    const allSyllables = [...new Set(pool.flatMap(w => w.split(' ')))]
    let correct = null
    const askFill = () => {
      const q = round[index]
      const syls = q.target.split(' ')
      const bi = Math.floor(Math.random() * syls.length)
      correct = syls[bi]
      const others = allSyllables.filter(s => s !== correct && !syls.includes(s))
      const tiles = [correct]
      while (tiles.length < 3 && others.length) tiles.push(others.splice(Math.floor(Math.random() * others.length), 1)[0])
      tiles.sort(() => Math.random() - 0.5)
      firstAttempt = true
      busy = true
      game.start(q, { blankIndex: bi, tiles })
      setTimeout(() => { if (game) { game.unlock(); busy = false } }, 350)
    }
    game.onPicTap(() => { if (!busy && round[index]) audio.say(round[index].target) })
    game.onAnswer(async syl => {
      if (busy) return
      const q = round[index]
      const myGame = game
      if (syl === correct) {
        busy = true
        game.lock()
        if (firstAttempt) commit({ target: q.target, ok: true, picked: q.target, ms: 0, drill: q.drill })
        earned.push(firstAttempt)
        setStars()
        audio.ding()
        game.fill(syl)
        await game.celebrate()
        if (game !== myGame) return
        await audio.say(q.target) // 對答案
        if (game !== myGame) return
        index++
        if (index >= round.length) return finishRound()
        askFill()
        return
      }
      if (firstAttempt) { commit({ target: q.target, ok: false, picked: null, ms: 0, drill: q.drill }); firstAttempt = false }
      audio.wrong()
      game.bounce(syl)
      game.sad()
    })
    askFill()
  }

  // ---- 翻牌：配對，不記進度 ----
  function runMemory () {
    game = createMemory(playArea)
    replayBtn.classList.add('hidden')
    const symbols = pickSymbols(noWordsState(trackView(state, 'listen')), Math.random, MEMORY_PAIRS)
    starTotal = symbols.length
    setStars()
    game.onFlip(sym => { audio.flip(); audio.say(sym) })
    game.onPair(() => { earned.push(true); setStars(); audio.ding() })
    game.onDone(finishRound)
    game.start(symbols)
  }

  // ---- 大人面板 ----
  let panelTrack = 'listen'
  function openPanel () {
    destroyGame()
    renderPanel(panelEl, {
      profile,
      profiles: store.loadProfiles(),
      state: state ? trackView(state, panelTrack) : null,
      track: panelTrack,
      onTrack (t) { panelTrack = t; openPanel() },
      settings,
      voices: audio.listVoices(),
      onKnownChange (symbol, checked) {
        const known = state.known.filter(s => s !== symbol)
        if (checked) known.push(symbol)
        state = { ...state, known }
        store.save(profile.id, state)
        openPanel()
      },
      onSettings (next) {
        settings = next
        saveSettings(settings)
        openPanel()
      },
      // 階級、最近答題是這一軌的；其他（鎖階、範圔、跳級）三軌共用
      onStateChange (partial) {
        const trackKeys = ['tier', 'recent']
        if (Object.keys(partial).some(k => trackKeys.includes(k))) {
          state = applyTrack(state, panelTrack, { ...trackView(state, panelTrack), ...partial })
        } else {
          state = { ...state, ...partial }
        }
        store.save(profile.id, state)
        openPanel()
      },
      onExport () {
        const blob = new Blob([store.exportJson(state)], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'zhuyin-rescue-' + profile.name + '.json'
        a.click()
      },
      onImport (text) {
        try {
          state = store.importJson(text)
          store.save(profile.id, state)
          openPanel()
        } catch (err) {
          panelMessage(panelEl, '匯入失敗：' + err.message)
        }
      },
      onResetProgress () {
        state = resetProgress(state)
        store.save(profile.id, state)
        openPanel()
      },
      onRemoveProfile (id) {
        store.removeProfile(id)
        if (profile && profile.id === id) {
          profile = null
          state = null
        }
        openPanel()
      },
      onClose () { profile ? goHome() : goProfiles() },
      onSay (symbol) { audio.say(symbol) },
      onCheck: openCheck,
    })
    showScreen('panel')
  }

  // 發音檢查台：借用家長區的畫面容器
  function openCheck () {
    renderCheck(panelEl, {
      audio,
      settings,
      onSettings (next) { settings = next; saveSettings(settings) },
      onClose: openPanel,
    })
    showScreen('panel')
  }

  // 開機：有記住上次的人就直接進首頁，否則選人
  const profiles = store.loadProfiles()
  if (profiles.current && profiles.list.some(p => p.id === profiles.current)) {
    pickProfile(profiles.current)
  } else {
    goProfiles()
  }
}

function wait (ms) { return new Promise(r => setTimeout(r, ms)) }

document.addEventListener('DOMContentLoaded', main)
