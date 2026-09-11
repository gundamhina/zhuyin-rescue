// 發音檢查台（家長用）：依序播放 37 個符號、逐個標記問題、測語音辨識。
// 標記存在 settings.audioIssues = { 符號: '備註' }，家長區頂端會列出來。

import { SYMBOLS, REP_CHAR, SPEAK_ACCEPT } from './data.js'
import { listen, matchesSymbol, speechAvailable } from './speak.js'

export function renderCheck (root, { audio, settings, onSettings, onClose }) {
  const issues = settings.audioIssues || {}
  let playing = false
  let stopFlag = false
  let recTarget = SYMBOLS[0]

  root.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>發音檢查</h2>
        <button class="panel-close" id="check-close">回家長區</button>
      </div>
      <div class="panel-row">
        <button id="check-play-all">從頭依序播放</button>
        <button id="check-stop" disabled>停止</button>
        <span class="check-now"><b id="check-now-sym">－</b> <span id="check-now-src"></span></span>
        <span class="panel-msg" id="check-msg"></span>
      </div>
      <p class="panel-hint">點符號單獨播。覺得唸得不對就勾「有問題」，順手寫一句聽起來像什麼。音源寫「錄音」代表播的是教育部官方檔，「合成」代表該符號沒有錄音檔、用語音合成唸代表字。</p>
      <div class="panel-row check-issues" id="check-issues"></div>
      <div class="ptiles check-tiles">${SYMBOLS.map(s => `
        <div class="ptile ctile ${issues[s] !== undefined ? 'red' : 'green'}" data-sym="${s}">
          <button class="ptile-sym" data-play="${s}" title="播放">${s}</button>
          <div class="ptile-hist" data-src="${s}">音源：查詢中</div>
          <div class="ptile-hist">代表字：${(settings.repChar && settings.repChar[s]) || REP_CHAR[s]}</div>
          <label class="ptile-known"><input type="checkbox" data-issue="${s}" ${issues[s] !== undefined ? 'checked' : ''}> 有問題</label>
          <input class="ptile-rep check-note" data-note="${s}" placeholder="像什麼" value="${issues[s] || ''}" ${issues[s] === undefined ? 'disabled' : ''}>
        </div>`).join('')}
      </div>
      <div class="panel-row check-rec">
        <b>辨識測試</b>
        ${speechAvailable() ? `
          <label>符號 <select id="rec-sym">${SYMBOLS.map(s => `<option value="${s}">${s}</option>`).join('')}</select></label>
          <button id="rec-go">按一下開始唸</button>
          <span id="rec-result">聽到的字會顯示在這裡，判定用同音字表：<code id="rec-accept"></code></span>`
          : '<span>這個瀏覽器沒有語音辨識，「唸給狗狗聽」在這裡不會出現。</span>'}
      </div>
    </div>`

  const nowSym = root.querySelector('#check-now-sym')
  const nowSrc = root.querySelector('#check-now-src')
  const playAllBtn = root.querySelector('#check-play-all')
  const stopBtn = root.querySelector('#check-stop')

  function renderIssues () {
    const list = Object.entries(issues)
    root.querySelector('#check-issues').innerHTML = list.length
      ? '<b>問題清單</b>' + list.map(([s, note]) => `<span class="issue-chip">${s}${note ? '：' + note : ''}</span>`).join('') +
        `<button id="check-copy">複製清單</button>`
      : '<span>目前沒有標記任何問題。</span>'
    const copy = root.querySelector('#check-copy')
    if (copy) {
      copy.onclick = () => {
        const text = list.map(([s, note]) => s + (note ? '：' + note : '')).join('\n')
        navigator.clipboard.writeText(text).then(() => { root.querySelector('#check-msg').textContent = '已複製' })
      }
    }
  }
  renderIssues()

  function saveIssues () {
    onSettings({ ...settings, audioIssues: { ...issues } })
  }

  // 每個符號查一次有沒有錄音檔
  SYMBOLS.forEach(async s => {
    const src = await audio.sourceOf(s)
    const el = root.querySelector(`[data-src="${s}"]`)
    if (el) el.textContent = '音源：' + (src === 'recording' ? '錄音' : '合成')
  })

  async function playOne (s) {
    nowSym.textContent = s
    nowSrc.textContent = (await audio.sourceOf(s)) === 'recording' ? '錄音' : '合成（唸「' + ((settings.repChar && settings.repChar[s]) || REP_CHAR[s]) + '」）'
    root.querySelectorAll('.ctile.playing').forEach(t => t.classList.remove('playing'))
    const tile = root.querySelector(`.ctile[data-sym="${s}"]`)
    if (tile) { tile.classList.add('playing'); tile.scrollIntoView({ block: 'nearest' }) }
    await audio.say(s)
  }

  root.querySelectorAll('[data-play]').forEach(b => { b.onclick = () => { if (!playing) playOne(b.dataset.play) } })

  playAllBtn.onclick = async () => {
    if (playing) return
    playing = true
    stopFlag = false
    playAllBtn.disabled = true
    stopBtn.disabled = false
    for (const s of SYMBOLS) {
      if (stopFlag) break
      await playOne(s)
      await new Promise(r => setTimeout(r, 700))
    }
    playing = false
    playAllBtn.disabled = false
    stopBtn.disabled = true
    root.querySelectorAll('.ctile.playing').forEach(t => t.classList.remove('playing'))
  }
  stopBtn.onclick = () => { stopFlag = true; audio.stop() }

  root.querySelectorAll('[data-issue]').forEach(cb => {
    cb.onchange = () => {
      const s = cb.dataset.issue
      const note = root.querySelector(`[data-note="${s}"]`)
      const tile = root.querySelector(`.ctile[data-sym="${s}"]`)
      if (cb.checked) { issues[s] = note.value.trim(); note.disabled = false; tile.classList.replace('green', 'red') } else { delete issues[s]; note.disabled = true; tile.classList.replace('red', 'green') }
      saveIssues()
      renderIssues()
    }
  })
  root.querySelectorAll('[data-note]').forEach(inp => {
    inp.onchange = () => {
      const s = inp.dataset.note
      if (issues[s] === undefined) return
      issues[s] = inp.value.trim()
      saveIssues()
      renderIssues()
    }
  })

  // 辨識測試
  const recSel = root.querySelector('#rec-sym')
  if (recSel) {
    const acceptEl = root.querySelector('#rec-accept')
    const showAccept = () => { acceptEl.textContent = SPEAK_ACCEPT[recTarget] || '' }
    recSel.onchange = () => { recTarget = recSel.value; showAccept() }
    showAccept()
    root.querySelector('#rec-go').onclick = async () => {
      const btn = root.querySelector('#rec-go')
      const out = root.querySelector('#rec-result')
      btn.disabled = true
      btn.textContent = '聽著…現在唸'
      const heard = await listen()
      btn.disabled = false
      btn.textContent = '按一下開始唸'
      const ok = matchesSymbol(recTarget, heard)
      out.innerHTML = `聽到：${heard.length ? heard.map(h => '「' + h + '」').join(' ') : '（沒聽到）'}　→ <b style="color:${ok ? '#268F58' : '#B32B37'}">${ok ? '判對' : '判錯'}</b>`
    }
  }

  root.querySelector('#check-close').onclick = () => { stopFlag = true; audio.stop(); onClose() }
}
