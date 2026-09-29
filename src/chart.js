// 注音表：37 個符號排成一張表，點一個就放大、照教育部筆順寫一次給她看，同時唸出來。
// 純看，不記進度、不給骨頭。符號本身也用筆順資料畫（教育部字形），不靠電腦字型。
// 介面：createChart(root, { onPick }) 回 { destroy }；onPick(symbol) 在點到符號時呼叫（外面負責唸）。

import { bgHtml } from './art.js'
import { mountBgs } from './ui.js'
import { strokeSvg } from './strokeplay.js'

// 課本的分組：聲符六組、介符一組、韻符四組。每組一個框；橫的一組一直行、由左到右，直的一組一橫列
const CHART_SECTIONS = [
  { cls: 'initial', groups: [['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'], ['ㄉ', 'ㄊ', 'ㄋ', 'ㄌ'], ['ㄍ', 'ㄎ', 'ㄏ'], ['ㄐ', 'ㄑ', 'ㄒ'], ['ㄓ', 'ㄔ', 'ㄕ', 'ㄖ'], ['ㄗ', 'ㄘ', 'ㄙ']] },
  { cls: 'medial', groups: [['ㄧ', 'ㄨ', 'ㄩ']] },
  { cls: 'final', groups: [['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ'], ['ㄞ', 'ㄟ', 'ㄠ', 'ㄡ'], ['ㄢ', 'ㄣ', 'ㄤ', 'ㄥ'], ['ㄦ']] },
]
const CHART_REPLAY_SVG = '<svg viewBox="0 0 24 24" width="44" height="44" fill="#fff"><path d="M8 5v14l11-7z"/></svg>'
const CHART_CLOSE_SVG = '<svg viewBox="0 0 24 24" width="40" height="40" fill="#fff"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>'

export function createChart (root, { onPick = () => {} } = {}) {
  const tile = s => `<button class="chart-tile" data-sym="${s}" aria-label="${s}">${strokeSvg(s, { color: '#2B3A4A', ghost: null, animate: false }).svg}</button>`
  root.innerHTML = bgHtml('room') + `<div class="frame"><div class="chart">${CHART_SECTIONS.map(sec => `<div class="chart-section ${sec.cls}">${sec.groups.map(g => `<div class="chart-group">${g.map(tile).join('')}</div>`).join('')}</div>`).join('')}</div>
    <div class="chart-pop hidden">
      <div class="chart-backdrop"></div>
      <div class="pad-wrap chart-pad"><div class="learn-guide"></div>
        <button class="pad-undo chart-replay" aria-label="再看一次">${CHART_REPLAY_SVG}</button>
      </div>
      <button class="round-btn chart-close" aria-label="回注音表">${CHART_CLOSE_SVG}</button>
    </div></div>`
  mountBgs(root)
  const pop = root.querySelector('.chart-pop')
  const guide = root.querySelector('.chart-pad .learn-guide')
  let current = null

  // 放大這個符號：照筆順寫一次，同時唸
  function play (sym) {
    current = sym
    guide.innerHTML = strokeSvg(sym, { speed: 0.8 }).svg
    pop.classList.remove('hidden')
    onPick(sym)
  }
  function close () { current = null; guide.innerHTML = ''; pop.classList.add('hidden') }

  root.querySelectorAll('.chart-tile').forEach(b => b.addEventListener('pointerdown', () => play(b.dataset.sym)))
  root.querySelector('.chart-replay').addEventListener('pointerdown', e => { e.stopPropagation(); if (current) play(current) })
  root.querySelector('.chart-close').addEventListener('pointerdown', e => { e.stopPropagation(); close() })
  root.querySelector('.chart-backdrop').addEventListener('pointerdown', close)

  function destroy () { root.innerHTML = '' }
  return { destroy }
}
