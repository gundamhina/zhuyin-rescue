// 教學：每個玩法第一次玩之前，先放一段小手示範怎麼操作。全是圖、不用字，她看得懂就好。
// 示範只教「怎麼操作」（點、拖、畫、按），不教答案。動畫在 style.css 的 .tut-* 那一段，一輪 3.6 秒一直重播。
// showTutorial(root, kind, onGo)：蓋在遊戲畫面上，按綠色播放鍵才開始；回傳一個關掉它的函式。

const INK = '#2B3A4A'
const WOOD = '#B08A63'
const FONT = 'font-family="Microsoft JhengHei, Noto Sans TC, PingFang TC, sans-serif" font-weight="900"'

// 手指尖在 (0, 0)，動畫只改整組的位移
const HAND = `
  <rect x="-22" y="40" width="68" height="62" rx="26" fill="#FFE3C4" stroke="#8E6D4C" stroke-width="4"/>
  <rect x="-11" y="-2" width="22" height="62" rx="11" fill="#FFE3C4" stroke="#8E6D4C" stroke-width="4"/>
  <rect x="-7" y="44" width="14" height="14" fill="#FFE3C4"/>
  <path d="M8 58 v-6 M24 60 v-8" stroke="#8E6D4C" stroke-width="3" stroke-linecap="round"/>`

const hand = cls => `<g class="tut-hand ${cls}">${HAND}</g>`
const ripple = (cls, x, y) => `<circle class="tut-ripple ${cls}" cx="${x}" cy="${y}" r="34" fill="none" stroke="#E8C86A" stroke-width="7"/>`
const sparks = (cls, x, y) => [[-60, -30], [55, -40], [-40, 45], [60, 35], [0, -70]].map(([dx, dy], i) =>
  `<text class="tut-spark ${cls}" x="${x + dx}" y="${y + dy}" font-size="34" fill="${['#E8C86A', '#E39AA8', '#6B9E6B', '#4A6FA5', '#E0955B'][i]}" text-anchor="middle" dominant-baseline="central">★</text>`).join('')

// 喇叭：先「聽」
const SPEAKER = `<g class="tut-speaker"><path d="M60 70 h22 l26 -22 v68 l-26 -22 h-22 z" fill="#E0955B"/>
  <path class="tut-wave w1" d="M122 68 q10 14 0 28" stroke="#E0955B" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path class="tut-wave w2" d="M136 58 q18 24 0 48" stroke="#E0955B" stroke-width="6" fill="none" stroke-linecap="round"/></g>`

const SCENES = {
  // 聽音，點泡泡
  fishing: `
    <rect x="0" y="210" width="640" height="190" fill="#8FC7D2"/>
    <path d="M0 214 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" stroke="#CFEAF0" stroke-width="6" fill="none"/>
    ${SPEAKER}
    <g class="tut-fish-b1"><circle cx="250" cy="262" r="54" fill="#F6F3E6" stroke="#fff" stroke-width="6"/><text x="250" y="264" font-size="62" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄅ</text></g>
    <g><circle cx="420" cy="276" r="54" fill="#F6F3E6" stroke="#fff" stroke-width="6"/><text x="420" y="278" font-size="62" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄆ</text></g>
    ${ripple('tut-fish-r', 250, 262)}${sparks('tut-fish-s', 250, 262)}
    ${hand('tut-fish-hand')}`,

  // 聽音，拍冒出來的
  whack: `
    <rect x="0" y="250" width="640" height="150" fill="#9BC47F"/>
    ${SPEAKER}
    ${[180, 320, 460].map(x => `<ellipse cx="${x}" cy="300" rx="64" ry="22" fill="#3E2A1A"/>`).join('')}
    <clipPath id="tut-hole"><rect x="240" y="100" width="160" height="202"/></clipPath>
    <g clip-path="url(#tut-hole)"><g class="tut-mole"><circle cx="320" cy="250" r="50" fill="#F6E7C8" stroke="#E2C89A" stroke-width="5"/><text x="320" y="252" font-size="60" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄅ</text></g></g>
    ${[180, 320, 460].map(x => `<path d="M${x - 66} 300 a66 22 0 0 0 132 0" fill="#6E9C58"/>`).join('')}
    ${ripple('tut-whack-r', 320, 250)}${sparks('tut-whack-s', 320, 240)}
    ${hand('tut-whack-hand')}`,

  // 翻兩張一樣的
  memory: `
    ${[130, 250, 370, 490].map((x, i) => `
      <g class="tut-card c${i}">
        <rect class="back" x="${x - 10}" y="130" width="100" height="130" rx="18" fill="#6B9E6B" stroke="#F6F3E6" stroke-width="5"/>
        <text class="back" x="${x + 40}" y="198" font-size="40" fill="#F6E7C8" text-anchor="middle" dominant-baseline="central">🐾</text>
        <rect class="front" x="${x - 10}" y="130" width="100" height="130" rx="18" fill="#FFFDF7" stroke="#E8C86A" stroke-width="5"/>
        <text class="front" x="${x + 40}" y="198" font-size="62" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄇ</text>
      </g>`).join('')}
    ${sparks('tut-mem-s', 300, 200)}
    ${hand('tut-mem-hand')}`,

  // 從詞拉一條線到圖
  match: `
    <rect x="60" y="148" width="190" height="110" rx="20" fill="#FFFDF7" stroke="${WOOD}" stroke-width="6"/>
    <text x="155" y="205" font-size="58" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄇㄠ</text>
    <g class="tut-match-pic"><rect x="430" y="143" width="120" height="120" rx="22" fill="#FFFDF7" stroke="#fff" stroke-width="6"/>
    <text x="490" y="205" font-size="70" text-anchor="middle" dominant-baseline="central">🐱</text></g>
    <line class="tut-match-line" x1="252" y1="203" x2="428" y2="203" stroke="#6B9E6B" stroke-width="10" stroke-linecap="round" stroke-dasharray="176" stroke-dashoffset="176"/>
    ${sparks('tut-match-s', 490, 203)}
    ${hand('tut-match-hand')}`,

  // 把一塊拖進空格
  fill: `
    <rect x="150" y="60" width="340" height="140" rx="24" fill="#FFFDF7" stroke="${WOOD}" stroke-width="8"/>
    <text x="255" y="132" font-size="80" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄚ</text>
    <rect class="tut-fill-blank" x="336" y="88" width="70" height="88" rx="14" fill="none" stroke="#E0955B" stroke-width="5" stroke-dasharray="10 8"/>
    <g class="tut-fill-tile"><rect x="285" y="262" width="80" height="80" rx="16" fill="#FFF3B0" stroke="#F6F3E6" stroke-width="5"/>
    <text x="325" y="304" font-size="56" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄧ</text></g>
    <rect x="435" y="262" width="80" height="80" rx="16" fill="#FFF3B0" stroke="#F6F3E6" stroke-width="5"/>
    <text x="475" y="304" font-size="56" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄨ</text>
    ${sparks('tut-fill-s', 371, 132)}
    ${hand('tut-fill-hand')}`,

  // 在板子上寫
  write: `
    <rect x="170" y="70" width="300" height="280" rx="26" fill="#FFFDF7" stroke="${WOOD}" stroke-width="8"/>
    <path class="tut-write-ink" d="M250 130 L250 280 L400 280" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-dasharray="300" stroke-dashoffset="300"/>
    <g class="tut-write-ok"><circle cx="470" cy="340" r="36" fill="#6B9E6B" stroke="#F6F3E6" stroke-width="5"/><path d="M454 340 l11 11 l20 -22" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    ${hand('tut-write-hand')}`,

  // 看牌子、按麥克風、唸出來
  speak: `
    <rect x="245" y="40" width="150" height="150" rx="22" fill="#FFFDF7" stroke="${WOOD}" stroke-width="8"/>
    <text x="320" y="118" font-size="96" ${FONT} fill="${INK}" text-anchor="middle" dominant-baseline="central">ㄚ</text>
    <circle cx="170" cy="300" r="56" fill="#F6E7C8" stroke="#D9A86C" stroke-width="5"/>
    <circle cx="150" cy="286" r="6" fill="${INK}"/><circle cx="190" cy="286" r="6" fill="${INK}"/>
    <ellipse class="tut-speak-mouth" cx="170" cy="318" rx="14" ry="10" fill="#C8553D"/>
    <path class="tut-wave s1" d="M244 282 q14 18 0 36" stroke="#E0955B" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path class="tut-wave s2" d="M262 268 q24 32 0 64" stroke="#E0955B" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g class="tut-speak-mic"><circle cx="480" cy="300" r="52" fill="#C8553D" stroke="#F6F3E6" stroke-width="6"/>
    <rect x="468" y="272" width="24" height="40" rx="12" fill="#fff"/><path d="M458 302 a22 22 0 0 0 44 0 M480 324 v12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>
    ${sparks('tut-speak-s', 320, 115)}
    ${hand('tut-speak-hand')}`,
}

const GO_SVG = '<svg viewBox="0 0 24 24" width="64" height="64" fill="#fff"><path d="M8 5v14l11-7z"/></svg>'

export function hasTutorial (kind) { return !!SCENES[kind] }

export function showTutorial (root, kind, onGo) {
  const wrap = document.createElement('div')
  wrap.className = 'tut'
  wrap.innerHTML = `
    <div class="tut-card">
      <svg class="tut-scene tut-${kind}" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="400" rx="30" fill="#EAF4F6"/>
        ${SCENES[kind] || ''}
      </svg>
      <button class="tut-go" aria-label="開始">${GO_SVG}</button>
    </div>`
  root.appendChild(wrap)
  let closed = false
  const close = () => {
    if (closed) return
    closed = true
    wrap.classList.add('out')
    setTimeout(() => wrap.remove(), 250)
  }
  wrap.querySelector('.tut-go').addEventListener('pointerdown', e => {
    e.stopPropagation()
    close()
    onGo()
  })
  return close
}
