// 選人、首頁、結算、大人面板、舞台縮放。

import { GROUPS, REP_CHAR, GROUP_NAMES } from './data.js'
import { stars, activePool, effectiveTier, unlockedCount, lifetimeStats, dailyStats, TIERS, TRACKS, TRACK_NAMES } from './scheduler.js'
import { dogSvg, confettiHtml, DOG_COLORS, bgHtml, cardArt, boneSvg, SHOP_ICONS, UX_ICONS } from './art.js'


// 舞台會跟著螢幕比例變形，所以不留邊：
//   橫的：高固定 800，寬照螢幕比例 1200～1800。畫面元素排在正中央 1200×800 的 .frame 裡，背景鋪滿整個舞台。
//   直的：寬固定 800，高照螢幕比例 1100～1800。.frame 就是整個舞台，各畫面另有直版排法（#stage.portrait）。
// 舞台大小放在 STAGE，也寫成 CSS 變數 --W、--H 給樣式用。
export const STAGE = { w: 1200, h: 800, portrait: false }

export function fitStage (stage) {
  const vv = window.visualViewport
  const vw = vv ? vv.width : window.innerWidth
  const vh = vv ? vv.height : window.innerHeight
  const portrait = vh > vw
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const W = portrait ? 800 : Math.round(clamp(800 * vw / vh, 1200, 1800))
  const H = portrait ? Math.round(clamp(800 * vh / vw, 1100, 1800)) : 800
  const changed = W !== STAGE.w || H !== STAGE.h || portrait !== STAGE.portrait
  STAGE.w = W
  STAGE.h = H
  STAGE.portrait = portrait
  stage.style.width = W + 'px'
  stage.style.height = H + 'px'
  stage.style.setProperty('--W', W + 'px')
  stage.style.setProperty('--H', H + 'px')
  stage.classList.toggle('portrait', portrait)
  const scale = Math.min(vw / W, vh / H)
  const x = (vw - W * scale) / 2
  const y = (vh - H * scale) / 2
  stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
  return changed
}

// 背景層定位。橫的：放大到填滿舞台、貼底（碼頭那張靠左，其他置中）。
// 直的：草原一樣蓋滿（放大到填滿高度，左右裁掉）；碼頭那張要留住碼頭和狗狗的比例，
// 所以只放大到占畫面下半（至少填滿寬），貼左下，上面由 .bg-fill 的天空色補。縮放結果記在 dataset 給釣魚算竿尖用。
export function layoutBg (el) {
  const art = el.querySelector('.bg-art')
  if (!art) return
  const { w: W, h: H, portrait } = STAGE
  let s, x, y
  if (portrait && el.dataset.fit === 'left') {
    // 螢幕越高，碼頭放得越大（1100 高時剛好填滿寬，1800 高時放大到 1.3 倍）
    s = Math.max(W / 1200, 0.667 + (H - 1100) / 700 * 0.633)
    x = 0
    y = H - 800 * s
  } else if (portrait) {
    s = H / 800
    x = (W - 1200 * s) / 2
    y = 0
  } else {
    s = Math.max(W / 1200, H / 800)
    y = H - 800 * s
    x = el.dataset.fit === 'left' ? 0 : (W - 1200 * s) / 2
  }
  art.style.transform = `translate(${x}px, ${y}px) scale(${s})`
  art.dataset.s = s
  art.dataset.x = x
  art.dataset.y = y
}
export function mountBgs (root) {
  root.querySelectorAll('.bg').forEach(layoutBg)
}

// 螢幕座標換成舞台座標（1200×800 那套），縮放、旋轉都算進去。拖曳、畫字都用這個。
export function stagePoint (e) {
  const stage = document.getElementById('stage')
  const m = new DOMMatrix(getComputedStyle(stage).transform)
  const p = m.inverse().transformPoint(new DOMPoint(e.clientX, e.clientY))
  return [p.x, p.y]
}

// 螢幕座標換成某個 .frame 裡的座標（橫的時候 frame 不在舞台左上角）
export function framePoint (e, frame) {
  const [x, y] = stagePoint(e)
  return [x - frame.offsetLeft, y - frame.offsetTop]
}

// 元素在舞台裡的位置（不含 transform），一路加 offsetLeft/offsetTop 到舞台
export function stageOffset (el) {
  let x = 0
  let y = 0
  for (let n = el; n && n.id !== 'stage'; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop }
  return [x, y]
}

// 手機：第一次點的時候進全螢幕並鎖橫向（要在使用者手勢裡呼叫；iPhone 不支援就算了）
let fullscreenPending = false
export function goFullscreenOnPhone () {
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  const standalone = window.matchMedia && window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches
  if (!coarse || standalone || fullscreenPending || document.fullscreenElement || !document.documentElement.requestFullscreen) return
  fullscreenPending = true
  document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(() => {
    if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape')
  }).catch(() => {}).finally(() => { fullscreenPending = false })
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
    ${bgHtml('home')}
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
  mountBgs(root)

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
// daily = { rounds, claimed, streak, goal }；recommend = 推薦的玩法；musicOn = 背景音樂開著沒
export function renderHome (root, { profile, speech = true, bones = 0, mates = [], daily = null, recommend = null, musicOn = true }) {
  const d = daily || { rounds: 0, claimed: false, streak: 0, goal: 3 }
  const chestState = d.claimed ? 'claimed' : d.rounds >= d.goal ? 'ready' : 'locked'
  const paws = Array.from({ length: d.goal }, (_, i) => `<span class="paw ${i < d.rounds ? 'on' : ''}">${UX_ICONS.paw}</span>`).join('')
  root.innerHTML = `
    ${bgHtml('home')}
    <button class="who" id="btn-who" aria-label="換人">
      <div class="who-avatar">${dogSvg(profile.color)}</div>
      <div class="who-name">${escapeHtml(profile.name)}</div>
    </button>
    <button class="shop-btn" id="btn-shop" aria-label="狗狗商店"><span class="bone-ic">${boneSvg()}</span><b>${bones}</b><span class="shop-word">${SHOP_ICONS.bag}</span></button>
    <div class="daily" id="daily">
      <div class="streak ${d.streak ? '' : 'cold'}" title="連續 ${d.streak} 天">${UX_ICONS.flame}<b>${d.streak}</b></div>
      <div class="paws" title="今天玩了 ${Math.min(d.rounds, d.goal)} 局">${paws}</div>
      <button class="chest ${chestState}" id="btn-chest" aria-label="寶箱" ${chestState === 'ready' ? '' : 'disabled'}>${UX_ICONS.chest}</button>
    </div>
    <button class="music-btn ${musicOn ? '' : 'off'}" id="btn-music" aria-label="背景音樂">${musicOn ? UX_ICONS.musicOn : UX_ICONS.musicOff}</button>
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
      <button class="card" data-game="match" aria-label="連連看">
        <div class="card-pic">${cardArt('match')}</div>
      </button>
      <button class="card" data-game="fill" aria-label="填空">
        <div class="card-pic">${cardArt('fill')}</div>
      </button>
      <button class="card" data-game="write" aria-label="寫給狗狗看">
        <div class="card-pic">${cardArt('write')}</div>
      </button>
      <button class="card ${speech ? '' : 'hidden'}" data-game="speak" aria-label="唸給狗狗聽">
        <div class="card-pic">${cardArt('speak')}</div>
      </button>
    </div>
    <div class="mates home-mates">${mates.map(c => `<div class="mate">${dogSvg(c, { mate: true })}</div>`).join('')}</div>
    <button class="gear" id="btn-gear" aria-label="大人面板">${GEAR_SVG}</button>`
  mountBgs(root)
  // 今天推薦：那張卡發光、角落蓋一個腳印
  const rec = recommend && root.querySelector(`.card[data-game="${recommend}"]:not(.hidden)`)
  if (rec) {
    rec.classList.add('recommend')
    const badge = document.createElement('span')
    badge.className = 'rec-badge'
    badge.innerHTML = UX_ICONS.paw
    rec.appendChild(badge)
  }
}

export function renderResult (root, color = 0, { roundBones = 0, bones = 0, mates = [], daily = null, perfect = false } = {}) {
  root.innerHTML = `
    ${bgHtml('home')}
    <div class="result-burst"></div>
    <div class="confetti-wrap">${confettiHtml()}</div>
    <div class="result-dogs ${mates.length >= 3 ? 'many' : ''}">${dogSvg(color)}${mates.map(c => dogSvg(c, { mate: true })).join('')}</div>
    <div class="result-stars">${'<span class="star">★</span>'.repeat(5)}</div>
    <div class="result-bones" id="result-bones" data-gain="${roundBones}" data-total="${bones}"><span class="bone-ic">${boneSvg()}</span> +<b class="rb-gain">0</b>　<small>共 <span class="rb-total">${bones - roundBones}</span></small></div>
    ${perfect ? `<div class="result-crown" id="result-crown">${UX_ICONS.crown}</div>` : ''}
    ${daily ? `<div class="result-daily">${Array.from({ length: daily.goal }, (_, i) => `<span class="paw ${i < daily.rounds - 1 ? 'on' : ''} ${i === daily.rounds - 1 ? 'new' : ''}">${UX_ICONS.paw}</span>`).join('')}${daily.rounds >= daily.goal && !daily.claimed ? `<span class="chest ready">${UX_ICONS.chest}</span>` : ''}</div>` : ''}
    <div class="result-actions hidden" id="result-actions">
      <button class="round-btn" id="btn-again" aria-label="再玩一次">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="#fff"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>
      </button>
      <button class="round-btn home" id="btn-home" aria-label="回首頁">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="#fff"><path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>
      </button>
    </div>`
  mountBgs(root)
}

// 結算動畫：星星一顆顆亮，接著骨頭數字往上跳、今天的腳印蓋上去，全對的話皇冠掉下來；3 秒後出按鈕
export function playResult (root, earned, { onTick = () => {}, onPerfect = () => {}, onPaw = () => {} } = {}) {
  const starEls = root.querySelectorAll('.result-stars .star')
  starEls.forEach(s => s.classList.remove('lit'))
  earned.forEach((ok, i) => {
    if (!ok) return
    setTimeout(() => starEls[i].classList.add('lit'), 400 + i * 350)
  })
  root.querySelector('#result-actions').classList.add('hidden')
  const bonesEl = root.querySelector('#result-bones')
  const starsDone = 400 + earned.length * 350 + 300
  if (bonesEl) {
    setTimeout(() => {
      bonesEl.classList.add('show')
      const gainN = parseInt(bonesEl.dataset.gain, 10) || 0
      const total = parseInt(bonesEl.dataset.total, 10) || 0
      const gainEl = bonesEl.querySelector('.rb-gain')
      const totalEl = bonesEl.querySelector('.rb-total')
      const steps = Math.min(gainN, 20)
      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          const v = Math.round(gainN * i / steps)
          gainEl.textContent = v
          totalEl.textContent = total - gainN + v
          onTick()
        }, i * 60)
      }
    }, starsDone)
  }
  const paw = root.querySelector('.result-daily .paw.new')
  if (paw) setTimeout(() => { paw.classList.add('on', 'stamp'); onPaw() }, starsDone + 1400)
  const crown = root.querySelector('#result-crown')
  if (crown) setTimeout(() => { crown.classList.add('show'); onPerfect(crown) }, starsDone + 700)
  setTimeout(() => root.querySelector('#result-actions').classList.remove('hidden'), 3000)
}

// 第 14 組起有名字（聲母組＋韻類），前面的組顯示符號本身
function groupName (i, g) {
  const n = GROUP_NAMES[i - 13]
  return n ? ' ' + n + '（' + g.length + ' 字）' : ''
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

// 長期統計：累計題數與答對率，加最近 14 天每天練了幾題（藍＝答對、橘＝答錯，疊起來是當天總題數）
function statsHtml (state) {
  const life = lifetimeStats(state)
  const days = dailyStats(state, 14)
  const max = Math.max(1, ...days.map(d => d.total))
  const pct = life.total ? Math.round(life.correct / life.total * 100) : 0
  const bars = days.map(d => {
    const h = Math.round(d.total / max * 100)
    const hOk = d.total ? Math.round(d.correct / d.total * h) : 0
    const tip = `${d.date}：${d.total} 題，答對 ${d.correct}`
    return `<div class="dbar" title="${tip}" aria-label="${tip}">
      <div class="dbar-col" style="height:${h}%">
        <div class="dbar-bad" style="height:${100 - (d.total ? hOk / h * 100 : 0)}%"></div>
        <div class="dbar-ok" style="flex:1"></div>
      </div>
      <div class="dbar-n">${d.total || ''}</div>
      <div class="dbar-date">${d.date}</div>
    </div>`
  }).join('')
  return `
      <div class="panel-row panel-stats">
        <div class="stats-sum">累計 <b>${life.total}</b> 題，答對 <b>${life.correct}</b>（${pct}%）</div>
        <div class="dchart">
          <div class="dchart-title">最近 14 天每天練幾題　<span class="lg lg-ok"></span>答對　<span class="lg lg-bad"></span>答錯</div>
          <div class="dbars">${bars}</div>
        </div>
      </div>`
}

export function renderPanel (root, { profile, profiles, state, track = 'listen', onTrack, settings, voices, onKnownChange, onSettings, onStateChange, onExport, onImport, onResetProgress, onRemoveProfile, onClose, onSay, onCheck }) {
  const lifetime = state ? lifetimeStats(state) : { bySymbol: {} }
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
      <div class="pgroup-title">第 ${gi + 1} 組${groupName(gi, g)}${g.every(s => pool.includes(s)) ? '' : '（未解鎖）'}</div>
      <div class="ptiles">${g.map(s => {
        const n = stars(state, s)
        const known = state.known.includes(s)
        const hist = (state.mastery[s] && state.mastery[s].history) || []
        const life = lifetime.bySymbol[s]
        return `<div class="ptile ${starColor(n)}">
          <button class="ptile-sym" data-say="${s}" title="點一下試聽">${s}</button>
          <div class="ptile-stars">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</div>
          <div class="ptile-hist" title="最近 10 次答對／已答">${hist.length ? '近 ' + hist.filter(h => h.ok).length + '/' + hist.length : '沒練過'}${life ? '　累計 ' + life.correct + '/' + life.total : ''}</div>
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
        <span class="panel-hint-inline">聽＝釣魚、打地鼠；讀＝連連看、填空、唸給狗狗聽；寫＝寫給狗狗看。翻牌是純遊玩，不算進任何一軌。星星、混淆、階級、解鎖各軌分開算，下面的設定三軌共用。</span>
      </div>
      <div class="panel-row">
        <div>「${TRACK_NAMES[track]}」目前出題階級：<b>${effectiveTier(state) + 1}</b> / 6（${tierLabel(TIERS[effectiveTier(state)])}）</div>
        <div>自動判定：第 <b>${state.tier + 1}</b> 階
          <button class="mini" id="tier-down" title="降一階" ${state.tier <= 0 ? 'disabled' : ''}>−</button>
          <button class="mini" id="tier-up" title="跳一階" ${state.tier >= TIERS.length - 1 ? 'disabled' : ''}>＋</button>
          ，最近 10 題 ${state.recent.filter(Boolean).length}/${state.recent.length} 對</div>
        <div>混淆中：${confusions.length ? confusions.map(k => k.replace('|', '／')).join('、') : '沒有'}</div>
      </div>
      ${profile ? statsHtml(state) : ''}
      ${profile ? `
      <div class="panel-row">
        <b>骨頭</b> 現在 <b>${state.bones || 0}</b> 根（累計賺過 ${state.bonesTotal || 0}，買了 ${(state.owned || []).length} 件配件）
        <button class="mini" id="bones-minus" title="扣 50 根">−50</button>
        <button class="mini" id="bones-plus" title="送 50 根">＋50</button>
        <span class="panel-hint-inline">第一次就答對 2 根、重試才對 1 根、玩完一局再送 3 根。翻牌是純遊玩：配對一對 1 根、沒有過關獎勵，星星和難度都不算它。</span>
      </div>` : ''}
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
              ${GROUPS.map((g, i) => `<option value="${i + 1}" ${unlockedCount(state) === i + 1 ? 'selected' : ''}>${i + 1} 組（${g.length > 8 ? groupName(i, g).trim() : g.join('')}）</option>`).join('')}
            </select>，之後照常自動往後解鎖
          </label>
          <span class="range-groups ${!(state.rangeGroups && state.rangeGroups.length) ? 'dimmed' : ''}">
            ${GROUPS.map((g, i) => `<label><input type="checkbox" data-range="${i}" ${(state.rangeGroups || []).includes(i) ? 'checked' : ''}> ${i + 1}.${g.length > 8 ? groupName(i, g) : g.join('')}</label>`).join('')}
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
    root.querySelector('#bones-minus').onclick = () => onStateChange({ bones: Math.max(0, (state.bones || 0) - 50) })
    root.querySelector('#bones-plus').onclick = () => onStateChange({ bones: (state.bones || 0) + 50, bonesTotal: (state.bonesTotal || 0) + 50 })
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
