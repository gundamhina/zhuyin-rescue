// 選人、首頁、結算、大人面板、舞台縮放。

import { GROUPS, REP_CHAR } from './data.js'
import { stars, activePool, effectiveTier, unlockedCount, TIERS, TRACKS, TRACK_NAMES } from './scheduler.js'
import { dogSvg, confettiHtml, DOG_COLORS, homeBgSvg, cardArt } from './art.js'


// 舞台固定 1200×800，依視窗等比縮放置中
export function fitStage (stage) {
  const scale = Math.min(window.innerWidth / 1200, window.innerHeight / 800)
  const x = (window.innerWidth - 1200 * scale) / 2
  const y = (window.innerHeight - 800 * scale) / 2
  stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
}

export function showScreen (name) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.toggle('active', el.id === 'screen-' + name)
  })
}

const GEAR_SVG = `<svg viewBox="0 0 24 24" width="40" height="40" fill="#fff"><path d="M19.4 13a7.6 7.6 0 0 0 .1-1 7.6 7.6 0 0 0-.1-1l2.1-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.5 1a7.3 7.3 0 0 0-1.7-1l-.4-2.6a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.4 2.6a7.3 7.3 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.2l-2 3.5a.5.5 0 0 0 .1.6L4.6 11a7.6 7.6 0 0 0-.1 1 7.6 7.6 0 0 0 .1 1l-2.1 1.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.5-1a7.3 7.3 0 0 0 1.7 1l.4 2.6a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.6a7.3 7.3 0 0 0 1.7-1l2.5 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>`

// 選人畫面：每人一張卡（狗狗頭像＋名字），最後一張是「＋」
export function renderProfiles (root, { profiles, onPick, onAdd, onGear }) {
  root.innerHTML = `
    <div class="home-sky">${homeBgSvg()}</div>
    <div class="profiles">
      ${profiles.list.map(p => `
        <button class="profile-card" data-id="${p.id}" aria-label="${p.name}">
          <div class="profile-avatar" style="background:${DOG_COLORS[p.color % DOG_COLORS.length].main}22">${dogSvg(p.color)}</div>
          <div class="profile-name">${escapeHtml(p.name)}</div>
        </button>`).join('')}
      <button class="profile-card add" id="btn-add-profile" aria-label="新增">
        <div class="profile-plus">＋</div>
      </button>
    </div>
    <div class="profile-form hidden" id="profile-form">
      <div class="profile-form-box">
        <div class="color-pick">${DOG_COLORS.map((c, i) => `
          <button class="color-dot ${i === 0 ? 'on' : ''}" data-color="${i}" style="background:${c.main}"></button>`).join('')}
        </div>
        <input id="profile-name" maxlength="6" placeholder="名字">
        <div class="profile-form-actions">
          <button id="profile-cancel">取消</button>
          <button id="profile-ok" class="primary">好</button>
        </div>
      </div>
    </div>
    <button class="gear" id="btn-gear" aria-label="大人面板">${GEAR_SVG}</button>`

  root.querySelectorAll('.profile-card[data-id]').forEach(b => {
    b.addEventListener('pointerdown', () => onPick(b.dataset.id))
  })
  const form = root.querySelector('#profile-form')
  let color = 0
  root.querySelector('#btn-add-profile').addEventListener('pointerdown', () => {
    form.classList.remove('hidden')
    root.querySelector('#profile-name').focus()
  })
  root.querySelectorAll('.color-dot').forEach(d => {
    d.onclick = () => {
      color = parseInt(d.dataset.color, 10)
      root.querySelectorAll('.color-dot').forEach(x => x.classList.toggle('on', x === d))
    }
  })
  root.querySelector('#profile-cancel').onclick = () => form.classList.add('hidden')
  root.querySelector('#profile-ok').onclick = () => {
    const name = root.querySelector('#profile-name').value.trim()
    if (!name) return
    onAdd({ name, color })
  }
  root.querySelector('#btn-gear').addEventListener('pointerdown', onGear)
}

// 首頁：目前使用者的狗狗、三張玩法卡
export function renderHome (root, { profile, speech = true }) {
  root.innerHTML = `
    <div class="home-sky">${homeBgSvg()}</div>
    <button class="who" id="btn-who" aria-label="換人">
      <div class="who-avatar">${dogSvg(profile.color)}</div>
      <div class="who-name">${escapeHtml(profile.name)}</div>
    </button>
    <div class="cards" id="cards">
      <button class="card" data-game="fishing" aria-label="釣魚">
        <div class="card-pic">${cardArt('fishing')}</div>
      </button>
      <button class="card" data-game="whack" aria-label="打地鼠">
        <div class="card-pic">${cardArt('whack')}</div>
      </button>
      <button class="card" data-game="memory" aria-label="翻牌">
        <div class="card-pic">${cardArt('memory')}</div>
      </button>
      <button class="card" data-game="write" aria-label="寫給狗狗看">
        <div class="card-pic">${cardArt('write')}</div>
      </button>
      <button class="card ${speech ? '' : 'hidden'}" data-game="speak" aria-label="唸給狗狗聽">
        <div class="card-pic">${cardArt('speak')}</div>
      </button>
    </div>
    <button class="gear" id="btn-gear" aria-label="大人面板">${GEAR_SVG}</button>`
}

export function renderResult (root, color = 0) {
  root.innerHTML = `
    <div class="result-bg">${homeBgSvg()}</div>
    <div class="result-burst"></div>
    <div class="confetti-wrap">${confettiHtml()}</div>
    <div class="result-dogs">${dogSvg(color)}${dogSvg((color + 1) % 6)}${dogSvg((color + 2) % 6)}</div>
    <div class="result-stars">${'<span class="star">★</span>'.repeat(5)}</div>
    <div class="result-actions hidden" id="result-actions">
      <button class="round-btn" id="btn-again" aria-label="再玩一次">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="#fff"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>
      </button>
      <button class="round-btn home" id="btn-home" aria-label="回首頁">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="#fff"><path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>
      </button>
    </div>`
}

// 結算動畫：星星一顆顆亮，3 秒後出按鈕
export function playResult (root, earned) {
  const starEls = root.querySelectorAll('.result-stars .star')
  starEls.forEach(s => s.classList.remove('lit'))
  earned.forEach((ok, i) => {
    if (!ok) return
    setTimeout(() => starEls[i].classList.add('lit'), 400 + i * 350)
  })
  root.querySelector('#result-actions').classList.add('hidden')
  setTimeout(() => root.querySelector('#result-actions').classList.remove('hidden'), 3000)
}

function starColor (n) {
  if (n >= 4) return 'green'
  if (n >= 2) return 'yellow'
  return 'red'
}

function escapeHtml (s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
}

// 大人面板：目前使用者的熟練度色塊、已經認得、試聽設定、匯出匯入、刪除使用者
const DISTRACT_LABEL = { random: '隨機', shape: '形似', sound: '音似' }
function tierLabel (t) {
  const idle = t.idleHint ? `發呆 ${t.idleHint} 秒才提示` : '不提示'
  const sim = t.similar >= 1 ? `一定放${DISTRACT_LABEL[t.distract]}干擾` : `${Math.round(t.similar * 10)} 成機率放形似音似干擾`
  return `${t.options} 選項、${sim}、${idle}`
}

// 兩段式確認：第一下按鈕變成確認文字，4 秒內再按一下才執行。不用瀏覽器對話框。
function armButton (btn, confirmText, onConfirm) {
  const original = btn.textContent
  let timer = null
  btn.onclick = () => {
    if (btn.classList.contains('armed')) {
      clearTimeout(timer)
      onConfirm()
      return
    }
    btn.classList.add('armed')
    btn.textContent = confirmText
    timer = setTimeout(() => { btn.classList.remove('armed'); btn.textContent = original }, 4000)
  }
}

export function renderPanel (root, { profile, profiles, state, track = 'listen', onTrack, settings, voices, onKnownChange, onSettings, onStateChange, onExport, onImport, onResetProgress, onRemoveProfile, onClose, onSay, onCheck }) {
  const usersHtml = profiles.list.length
    ? profiles.list.map(p => `
      <div class="puser">
        <span class="puser-dot" style="background:${DOG_COLORS[p.color % DOG_COLORS.length].main}"></span>
        <span class="puser-name">${escapeHtml(p.name)}${profile && profile.id === p.id ? '（目前）' : ''}</span>
        <button class="danger" data-remove="${p.id}">刪除</button>
      </div>`).join('')
    : '<span>還沒有使用者</span>'
  const pool = state ? activePool(state) : []
  const groupsHtml = !state ? '' : GROUPS.map((g, gi) => `
    <div class="pgroup">
      <div class="pgroup-title">第 ${gi + 1} 組${g.every(s => pool.includes(s)) ? '' : '（未解鎖）'}</div>
      <div class="ptiles">${g.map(s => {
        const n = stars(state, s)
        const known = state.known.includes(s)
        const hist = (state.mastery[s] && state.mastery[s].history) || []
        return `<div class="ptile ${starColor(n)}">
          <button class="ptile-sym" data-say="${s}" title="點一下試聽">${s}</button>
          <div class="ptile-stars">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</div>
          <div class="ptile-hist">${hist.length ? hist.filter(h => h.ok).length + '/' + hist.length : '沒練過'}</div>
          <label class="ptile-known"><input type="checkbox" data-known="${s}" ${known ? 'checked' : ''}> 認得</label>
          <input class="ptile-rep" data-rep="${s}" value="${(settings.repChar && settings.repChar[s]) || REP_CHAR[s]}" maxlength="2" title="唸成什麼字">
        </div>`
      }).join('')}</div>
    </div>`).join('')

  const confusions = state ? Object.keys(state.confusions) : []
  const voiceOptions = voices.map(v =>
    `<option value="${v.name}" ${settings.voiceName === v.name ? 'selected' : ''}>${v.name} (${v.lang})</option>`).join('')

  root.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>大人面板　<small>${profile ? '目前：' + escapeHtml(profile.name) : '尚未選人'}</small></h2>
        <button class="panel-close" id="panel-close">關閉</button>
      </div>
      <div class="panel-row panel-users">
        <b>使用者</b>${usersHtml}
      </div>
      ${profile ? `
      <div class="panel-row panel-tracks">
        <b>看哪一軌</b>
        ${TRACKS.map(t => `<button class="track-tab ${t === track ? 'on' : ''}" data-track="${t}">${TRACK_NAMES[t]}</button>`).join('')}
        <span class="panel-hint-inline">聽＝釣魚、打地鼠；讀＝唸給狗狗聽；寫＝寫給狗狗看。星星、混淆、階級、解鎖各軌分開算，下面的設定三軌共用。</span>
      </div>
      <div class="panel-row">
        <div>「${TRACK_NAMES[track]}」目前出題階級：<b>${effectiveTier(state) + 1}</b> / 6（${tierLabel(TIERS[effectiveTier(state)])}）</div>
        <div>自動判定：第 <b>${state.tier + 1}</b> 階
          <button class="mini" id="tier-down" title="降一階" ${state.tier <= 0 ? 'disabled' : ''}>−</button>
          <button class="mini" id="tier-up" title="跳一階" ${state.tier >= TIERS.length - 1 ? 'disabled' : ''}>＋</button>
          ，最近 10 題 ${state.recent.filter(Boolean).length}/${state.recent.length} 對</div>
        <div>混淆中：${confusions.length ? confusions.map(k => k.replace('|', '／')).join('、') : '沒有'}</div>
      </div>
      <div class="panel-row panel-difficulty">
        <label>難度
          <select id="sel-tier">
            <option value="" ${state.lockTier == null ? 'selected' : ''}>自動（連對升、連錯降）</option>
            ${TIERS.map((t, i) => `<option value="${i}" ${state.lockTier === i ? 'selected' : ''}>鎖在第 ${i + 1} 階：${tierLabel(t)}</option>`).join('')}
          </select>
        </label>
        <div class="range-pick">
          <label><input type="checkbox" id="range-auto" ${!(state.rangeGroups && state.rangeGroups.length) ? 'checked' : ''}> 範圍自動解鎖</label>
          <label class="${(state.rangeGroups && state.rangeGroups.length) ? 'dimmed' : ''}">已解鎖到第
            <select id="sel-unlocked" ${(state.rangeGroups && state.rangeGroups.length) ? 'disabled' : ''}>
              ${GROUPS.map((g, i) => `<option value="${i + 1}" ${unlockedCount(state) === i + 1 ? 'selected' : ''}>${i + 1} 組（${g.join('')}）</option>`).join('')}
            </select>，之後照常自動往後解鎖
          </label>
          <span class="range-groups ${!(state.rangeGroups && state.rangeGroups.length) ? 'dimmed' : ''}">
            ${GROUPS.map((g, i) => `<label><input type="checkbox" data-range="${i}" ${(state.rangeGroups || []).includes(i) ? 'checked' : ''}> ${g.join('')}</label>`).join('')}
          </span>
        </div>
      </div>` : ''}
      <div class="panel-row">
        <label>語音
          <select id="sel-voice"><option value="">自動</option>${voiceOptions}</select>
        </label>
        <label>語速 <input type="range" id="rng-rate" min="0.5" max="1.2" step="0.05" value="${settings.rate || 0.8}"> <span id="rate-val">${settings.rate || 0.8}</span></label>
        <button id="btn-check">發音檢查${Object.keys(settings.audioIssues || {}).length ? '（' + Object.keys(settings.audioIssues).length + ' 個有問題）' : ''}</button>
        ${profile ? `
        <button id="btn-export">匯出進度</button>
        <label class="file-btn">匯入進度<input type="file" id="file-import" accept=".json"></label>
        <button id="btn-reset" class="danger">清除練習紀錄（三軌）</button>` : ''}
        <span id="panel-msg" class="panel-msg"></span>
      </div>
      <p class="panel-hint">點符號可以試聽。「認得」勾起來的符號從 3 星起算並直接進入出題。每格右下方的字是語音合成實際唸的代表字，唸得怪可以改。</p>
      ${profile ? groupsHtml : '<p class="panel-hint">先回選人畫面選一個人，才看得到進度。</p>'}
    </div>`

  root.querySelector('#panel-close').onclick = onClose
  root.querySelector('#btn-check').onclick = onCheck
  root.querySelectorAll('[data-track]').forEach(b => { b.onclick = () => onTrack(b.dataset.track) })
  root.querySelectorAll('[data-say]').forEach(b => { b.onclick = () => onSay(b.dataset.say) })
  root.querySelectorAll('[data-known]').forEach(cb => {
    cb.onchange = () => onKnownChange(cb.dataset.known, cb.checked)
  })
  root.querySelectorAll('[data-rep]').forEach(inp => {
    inp.onchange = () => {
      const repChar = { ...(settings.repChar || {}) }
      const v = inp.value.trim()
      if (v && v !== REP_CHAR[inp.dataset.rep]) repChar[inp.dataset.rep] = v
      else delete repChar[inp.dataset.rep]
      onSettings({ ...settings, repChar })
    }
  })
  root.querySelector('#sel-voice').onchange = e => onSettings({ ...settings, voiceName: e.target.value })
  const rng = root.querySelector('#rng-rate')
  rng.oninput = () => { root.querySelector('#rate-val').textContent = rng.value }
  rng.onchange = () => onSettings({ ...settings, rate: parseFloat(rng.value) })
  if (profile) {
    root.querySelector('#sel-tier').onchange = e => {
      onStateChange({ lockTier: e.target.value === '' ? null : parseInt(e.target.value, 10) })
    }
    root.querySelector('#tier-down').onclick = () => onStateChange({ tier: Math.max(0, state.tier - 1), recent: [] })
    root.querySelector('#tier-up').onclick = () => onStateChange({ tier: Math.min(TIERS.length - 1, state.tier + 1), recent: [] })
    root.querySelector('#sel-unlocked').onchange = e => onStateChange({ unlockedUpTo: parseInt(e.target.value, 10) })
    const readRange = () => [...root.querySelectorAll('[data-range]:checked')].map(cb => parseInt(cb.dataset.range, 10))
    root.querySelector('#range-auto').onchange = e => {
      if (e.target.checked) onStateChange({ rangeGroups: null })
      else onStateChange({ rangeGroups: readRange().length ? readRange() : [0] })
    }
    root.querySelectorAll('[data-range]').forEach(cb => {
      cb.onchange = () => onStateChange({ rangeGroups: readRange() })
    })
    root.querySelector('#btn-export').onclick = onExport
    armButton(root.querySelector('#btn-reset'), '確定清除？星星和混淆紀錄會歸零，認得與難度設定保留', onResetProgress)
    root.querySelector('#file-import').onchange = e => {
      const f = e.target.files[0]
      if (!f) return
      const reader = new FileReader()
      reader.onload = () => onImport(String(reader.result))
      reader.readAsText(f)
    }
  }
  root.querySelectorAll('[data-remove]').forEach(btn => {
    armButton(btn, '確定刪除？連進度一起刪', () => onRemoveProfile(btn.dataset.remove))
  })
}

export function panelMessage (root, text) {
  const el = root.querySelector('#panel-msg')
  if (el) el.textContent = text
}
