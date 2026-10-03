// 注音表：三頁，37 個符號、22 個結合韻、5 個聲調，上面三顆按鈕切換。點一個就放大、照教育部筆順寫一次給她看，同時唸出來。
// 聲調那頁：每格是一個調號，點了放大成例字 ㄇㄚ 的那個聲調（媽、麻、馬、罵、嗎），調號跳一下，唸例字。
// 純看，不記進度、不給骨頭。符號本身也用筆順資料畫（教育部字形），不靠電腦字型。
// 介面：createChart(root, { onPick }) 回 { destroy }；onPick(symbol) 在點到符號時呼叫（外面負責唸）。

import { bgHtml, symbolMarkup, toneTileMarkup } from './art.js'
import { mountBgs } from './ui.js'
import { strokeSvg } from './strokeplay.js'
import { GROUPS } from './data.js'

// 課本的分組：聲符六組、介符一組、韻符四組。每組一個框；橫的一組一直行、由左到右，直的一組一橫列
const CHART_SECTIONS = [
  { cls: 'initial', groups: [['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'], ['ㄉ', 'ㄊ', 'ㄋ', 'ㄌ'], ['ㄍ', 'ㄎ', 'ㄏ'], ['ㄐ', 'ㄑ', 'ㄒ'], ['ㄓ', 'ㄔ', 'ㄕ', 'ㄖ'], ['ㄗ', 'ㄘ', 'ㄙ']] },
  { cls: 'medial', groups: [['ㄧ', 'ㄨ', 'ㄩ']] },
  { cls: 'final', groups: [['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ'], ['ㄞ', 'ㄟ', 'ㄠ', 'ㄡ'], ['ㄢ', 'ㄣ', 'ㄤ', 'ㄥ'], ['ㄦ']] },
]
// 結合韻：ㄧ、ㄨ、ㄩ 開頭各一組（data.js 的第 11～13 組），兩個符號上下直排，跟遊戲裡一樣
const CHART_PAGES = [
  { key: 'single', icon: 'ㄅ', name: '注音符號', sections: CHART_SECTIONS },
  { key: 'compound', icon: 'ㄧㄚ', name: '結合韻', sections: [{ cls: 'compound', groups: GROUPS.slice(10, 13) }] },
  { key: 'tone', tone: 'ˇ', name: '聲調', sections: [{ cls: 'tone', groups: [['ㄇㄚ', 'ㄇㄚˊ', 'ㄇㄚˇ', 'ㄇㄚˋ', '˙ㄇㄚ']] }] },
]
// 聲調那頁每格的調號（一聲課本不標，格子上畫一條橫線）
const CHART_TONE_OF = { ㄇㄚ: '1', 'ㄇㄚˊ': 'ˊ', 'ㄇㄚˇ': 'ˇ', 'ㄇㄚˋ': 'ˋ', '˙ㄇㄚ': '˙' }
// 一個符號或一個結合韻畫出來：每個符號一個 SVG；要動的話一個寫完才寫下一個
function chartGlyphs (sym, opts) {
  let wait = 0
  return Array.from(sym).map(ch => {
    const { svg, duration } = strokeSvg(ch, { ...opts, wait })
    if (opts.animate !== false) wait = duration + 250
    return svg
  }).join('')
}
const CHART_STILL = { color: '#2B3A4A', ghost: null, animate: false }
const CHART_REPLAY_SVG = '<svg viewBox="0 0 24 24" width="44" height="44" fill="#fff"><path d="M8 5v14l11-7z"/></svg>'
const CHART_CLOSE_SVG = '<svg viewBox="0 0 24 24" width="40" height="40" fill="#fff"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>'

export function createChart (root, { onPick = () => {} } = {}) {
  const tile = s => CHART_TONE_OF[s]
    ? `<button class="chart-tile tone" data-sym="${s}" aria-label="${s}">${toneTileMarkup(CHART_TONE_OF[s])}</button>`
    : `<button class="chart-tile ${s.length > 1 ? 'duo' : ''}" data-sym="${s}" aria-label="${s}">${chartGlyphs(s, CHART_STILL)}</button>`
  root.innerHTML = bgHtml('room') + `<div class="frame">
    <div class="chart-tabs">${CHART_PAGES.map((p, i) => `<button class="chart-tab ${i ? '' : 'on'}" data-page="${p.key}" aria-label="${p.name}">${p.tone ? toneTileMarkup(p.tone) : chartGlyphs(p.icon, CHART_STILL)}</button>`).join('')}</div>
    ${CHART_PAGES.map((p, i) => `<div class="chart ${p.key} ${i ? 'hidden' : ''}" data-page="${p.key}">${p.sections.map(sec => `<div class="chart-section ${sec.cls}">${sec.groups.map(g => `<div class="chart-group">${g.map(tile).join('')}</div>`).join('')}</div>`).join('')}</div>`).join('')}
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
    const tone = CHART_TONE_OF[sym]
    guide.classList.toggle('duo', !tone && sym.length > 1)
    guide.classList.toggle('tone', !!tone)
    // 聲調：放大成例字的注音（調號跳一下），不寫筆順；其他照筆順寫
    guide.innerHTML = tone ? `<div class="chart-tone-big">${symbolMarkup(sym)}</div>` : chartGlyphs(sym, { speed: 0.8 })
    pop.classList.remove('hidden')
    onPick(sym)
  }
  function close () { current = null; guide.innerHTML = ''; pop.classList.add('hidden') }

  root.querySelectorAll('.chart-tile').forEach(b => b.addEventListener('pointerdown', () => play(b.dataset.sym)))
  root.querySelectorAll('.chart-tab').forEach(t => t.addEventListener('pointerdown', () => {
    root.querySelectorAll('.chart-tab').forEach(o => o.classList.toggle('on', o === t))
    root.querySelectorAll('.chart[data-page]').forEach(c => c.classList.toggle('hidden', c.dataset.page !== t.dataset.page))
  }))
  root.querySelector('.chart-replay').addEventListener('pointerdown', e => { e.stopPropagation(); if (current) play(current) })
  root.querySelector('.chart-close').addEventListener('pointerdown', e => { e.stopPropagation(); close() })
  root.querySelector('.chart-backdrop').addEventListener('pointerdown', close)

  function destroy () { root.innerHTML = '' }
  return { destroy }
}
