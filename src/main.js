// 把所有模組接起來：使用者、狀態、出題、三種玩法、畫面切換。

import { buildRound, recordAnswer, resetProgress, pickSymbols } from './scheduler.js'
import { createStore } from './store.js'
import { createAudio } from './audio.js'
import { createFishing } from './fishing.js'
import { createFeeding } from './feeding.js'
import { createMemory } from './memory.js'
import { fitStage, showScreen, renderProfiles, renderHome, renderResult, playResult, renderPanel, panelMessage } from './ui.js'

const SETTINGS_KEY = 'zhuyin-rescue-settings'
const MEMORY_PAIRS = 5

function loadSettings () {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {} } catch (err) { return {} }
}
function saveSettings (s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) }

function main () {
  const stage = document.getElementById('stage')
  fitStage(stage)
  window.addEventListener('resize', () => fitStage(stage))

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
    renderHome(homeEl, { profile })
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
    if (game) game.destroy()
    game = null
    audio.stop()
  }

  function startGame (which) {
    destroyGame()
    kind = which
    earned = []
    showScreen('game')
    if (which === 'memory') return runMemory()
    runQuestions(which)
  }

  gameEl.querySelector('#btn-quit').addEventListener('pointerdown', () => { busy = false; goHome() })

  function commit (answer) {
    state = recordAnswer(state, answer)
    store.save(profile.id, state)
  }

  function finishRound () {
    destroyGame()
    renderResult(resultEl, profile.color)
    resultEl.querySelector('#btn-again').addEventListener('pointerdown', () => startGame(kind))
    resultEl.querySelector('#btn-home').addEventListener('pointerdown', goHome)
    showScreen('result')
    audio.cheer()
    playResult(resultEl, earned)
  }

  // ---- 釣魚、餵狗狗：聽音選形 ----
  let round = []
  let index = 0
  let firstAttempt = true
  let askedAt = 0
  let busy = false

  function runQuestions (which) {
    game = which === 'feeding'
      ? createFeeding(playArea, { color: profile.color })
      : createFishing(playArea, { color: profile.color })
    replayBtn.classList.remove('hidden')
    round = buildRound(state, Math.random)
    index = 0
    starTotal = round.length
    setStars()
    game.onAnswer(onPick)
    askQuestion()
  }

  // 聲音一出來就開放點擊，不等唸完；提示晃動等唸完才開始
  async function askQuestion () {
    const q = round[index]
    const myIndex = index
    const myGame = game
    firstAttempt = true
    busy = true
    game.start(q)
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
    if (index === myIndex && game === myGame) game.hint(q.hint)
  }

  replayBtn.addEventListener('pointerdown', () => {
    if (busy || kind === 'memory' || !round[index]) return
    audio.say(round[index].target)
  })

  async function onPick (symbol) {
    if (busy) return
    const q = round[index]
    const ms = Date.now() - askedAt
    if (symbol === q.target) {
      busy = true
      game.lock()
      if (firstAttempt) commit({ target: q.target, ok: true, picked: symbol, ms, drill: q.drill })
      earned.push(firstAttempt)
      setStars()
      audio.stop()
      if (kind === 'feeding') audio.crunch(); else audio.splash()
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
    // 答錯：第一次才記錄；選項晃、狗狗歪頭、正確的開始閃
    if (firstAttempt) {
      commit({ target: q.target, ok: false, picked: symbol, ms, drill: q.drill })
      firstAttempt = false
    }
    audio.wrong()
    game.shake(symbol)
    game.sad()
    game.flashCorrect()
  }

  // ---- 翻牌：配對，不記進度 ----
  function runMemory () {
    game = createMemory(playArea)
    replayBtn.classList.add('hidden')
    const symbols = pickSymbols(state, Math.random, MEMORY_PAIRS)
    starTotal = symbols.length
    setStars()
    game.onFlip(sym => { audio.flip(); audio.say(sym) })
    game.onPair(() => { earned.push(true); setStars(); audio.ding() })
    game.onDone(finishRound)
    game.start(symbols)
  }

  // ---- 大人面板 ----
  function openPanel () {
    destroyGame()
    renderPanel(panelEl, {
      profile,
      profiles: store.loadProfiles(),
      state,
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
      onStateChange (partial) {
        state = { ...state, ...partial }
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
