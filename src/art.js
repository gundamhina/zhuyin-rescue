// SVG 圖：場景、狗狗、卡片插圖。全部是字串，塞進 innerHTML。
// 風格：借宮崎駿動畫的氛圍。水彩天空、厚積雲、層疊山丘、青綠海面、褪色木頭、柔光，不用粗描邊。

import { WORD_TEXT, WORD_ICON } from './data.js'

// 符號怎麼顯示：單一符號直接放，結合韻兩個直排
export function symbolMarkup (sym) {
  // 詞：音節左右並列，每個音節各自直排；單一符號的音節也包成一欄，字才會一樣大
  if (sym.includes(' ')) {
    const syls = sym.split(' ')
    return `<span class="word w${syls.length}">${syls.map(s => syllableMarkup(s, true)).join('')}</span>`
  }
  return syllableMarkup(sym, false)
}

// 一個音節畫成一張小 SVG：符號直排、調號在最後一個符號右邊、輕聲點在最上面。
// 用 SVG 而不用 HTML 文字，是因為手機瀏覽器會自己放大它覺得太小的文字，注音每欄被放大的程度不一樣，排版就亂了；SVG 的字不會被動。
// 單獨一個音節（泡泡、地鼠、磁磚、牌子）：畫在 100×100 裡，整個音節跟單一符號一樣高。
// 詞裡的音節：每欄 80×170，符號一律 54，欄裡置中，一個詞的各欄才會對齊、字一樣大。
function syllableMarkup (sym, inWord) {
  const light = sym.startsWith('˙')
  if (light) sym = sym.slice(1)
  const tone = (sym.match(/[ˊˇˋ]$/) || [''])[0]
  const core = tone ? sym.slice(0, -1) : sym
  if (!inWord && core.length < 2 && !tone && !light) return sym
  const n = core.length
  let W, H, g, cx, centers, toneX, toneSize
  if (inWord) {
    W = 80; H = 170; g = 54; cx = 28; toneX = 67; toneSize = 32
    centers = [...core].map((_, i) => 85 + (i - (n - 1) / 2) * 54)
  } else {
    W = 100; H = 100; cx = 50; toneX = 94; toneSize = 40
    g = n === 1 ? 90 : n === 2 ? 54 : 38
    centers = n === 1 ? [50] : n === 2 ? [26, 74] : [17, 50, 83]
  }
  const glyphs = [...core].map((ch, i) => `<text x="${cx}" y="${centers[i]}" font-size="${g}">${ch}</text>`).join('')
  const toneSvg = tone ? `<text class="tone" x="${toneX}" y="${centers[n - 1] + g * 0.15}" font-size="${toneSize}">${tone}</text>` : ''
  const lightSvg = light ? `<text class="tone" x="${cx}" y="${centers[0] - g * 0.62}" font-size="${toneSize}">˙</text>` : ''
  return `<svg class="syl n${n}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-label="${light ? '˙' : ''}${core}${tone}">${lightSvg}${glyphs}${toneSvg}</svg>`
}

// 詞的圖：img/words/<國字>.png 有就用，沒有退回表情符號
export function wordPicMarkup (word) {
  const text = WORD_TEXT[word] || ''
  return `<img class="art-slot" src="img/words/${text}.png" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()"><span class="emoji">${WORD_ICON[word] || '❓'}</span>`
}

// 背景層：整個舞台大小，裡面一層天空填色、一層 1200×800 的場景圖（ui.js 的 layoutBg 會依舞台大小縮放定位）。
// kind：'home' 草原、'scene' 碼頭（碼頭在左下角，橫的時候靠左對齊）。inner 放要跟場景一起縮放的東西（釣魚的狗狗）。
// kind：'home' 草原、'scene' 碼頭，以及各遊戲自己的背景插槽 'garden'（打地鼠）、'room'（樹屋教室：翻牌、連連看、填空、寫字、唸）、'shop'（商店）。
// 插槽的圖（img/bg-<kind>.png）還沒放就退回草原 home.png，草原也沒有才用向量圖。
const BG_SLOTS = ['garden', 'room', 'shop']
export function bgHtml (kind, inner = '') {
  let art
  if (kind === 'scene') art = sceneSvg()
  else if (BG_SLOTS.includes(kind)) {
    art = homeBgSvg().replace(
      /src="img\/home\.png"([^>]*)onerror="this\.remove\(\)"/,
      `src="img/bg-${kind}.png"$1onerror="if (!this.dataset.fallback) { this.dataset.fallback = 1; this.src = 'img/home.png' } else this.remove()"`)
  } else art = homeBgSvg()
  return `<div class="bg" data-fit="${kind === 'scene' ? 'left' : 'center'}"><div class="bg-fill ${BG_SLOTS.includes(kind) ? 'home' : kind}"></div><div class="bg-art">${art}${inner}</div></div>`
}

// 六隻救援狗的配色：帽子／背心顏色，深色版做陰影
export const DOG_COLORS = [
  { main: '#4A6FA5', dark: '#34507A' }, // 藍 警察
  { main: '#C8553D', dark: '#96402D' }, // 紅 消防
  { main: '#E39AA8', dark: '#B87483' }, // 粉 飛行
  { main: '#6B9E6B', dark: '#4E7A4E' }, // 綠 回收
  { main: '#E0955B', dark: '#B07242' }, // 橘 工程
  { main: '#E8C86A', dark: '#B99A44' }, // 黃 鬆餅
]

// 水彩紙紋：疊在色塊上的細顆粒
const PAPER_FILTER = `
  <filter id="paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.08 0" result="g"/>
    <feBlend in="SourceGraphic" in2="g" mode="multiply"/>
  </filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="softer" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>`

// 一朵積雲：底部帶淡藍陰影
function cloud (x, y, s = 1) {
  return `
  <g class="cloud" transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="18" rx="120" ry="30" fill="#C9D9E8" opacity="0.8"/>
    <ellipse cx="-50" cy="0" rx="58" ry="46" fill="#FFFDF7"/>
    <ellipse cx="10" cy="-18" rx="70" ry="58" fill="#FFFDF7"/>
    <ellipse cx="70" cy="2" rx="52" ry="42" fill="#FFFDF7"/>
    <ellipse cx="0" cy="22" rx="118" ry="26" fill="#FFFDF7"/>
    <ellipse cx="-30" cy="26" rx="70" ry="14" fill="#DCE7F0" opacity="0.7"/>
  </g>`
}

// 草叢：山丘邊緣的一小撮草
function grassTuft (x, y, color) {
  return `<path d="M${x} ${y} q3 -18 6 0 q3 -22 6 0 q3 -16 6 0 q2 -20 5 0" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`
}

// 救援狗。viewBox 260×300，原點在左上。color 是 DOG_COLORS 的索引。
// 這隻狗的圖是不是還只是 dog-0 的複本。build.js 比對檔案後寫進 DOG_COPIES；單獨載入模組時當作都是複本
function dogIsCopy (color) {
  // eslint-disable-next-line no-undef
  return typeof DOG_COPIES === 'undefined' || DOG_COPIES.includes(color % DOG_COLORS.length)
}

export function dogSvg (color = 0, { mate = false } = {}) {
  const c = DOG_COLORS[color % DOG_COLORS.length]
  const band = mate && dogIsCopy(color) ? `<svg class="dog-acc front" viewBox="0 0 260 300" xmlns="http://www.w3.org/2000/svg"><path d="M72 150 Q120 178 168 152 Q170 170 164 180 Q120 204 76 174 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="4"/></svg>` : ''
  return `<span class="dog-slot">${accessoryLayer(color)}${band}<img class="art-slot" src="img/dog-${color % DOG_COLORS.length}.png" width="260" height="300" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg class="dog" viewBox="0 0 260 300" width="260" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="fur${color}" cx="0.4" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#D9A86C"/><stop offset="1" stop-color="#A8703C"/>
    </radialGradient>
  </defs>
  <g class="dog-body">
    <path class="tail" d="M62 228 q-46 -28 -26 -76" stroke="#8A5A2B" stroke-width="18" fill="none" stroke-linecap="round"/>
    <ellipse cx="130" cy="238" rx="80" ry="56" fill="url(#fur${color})"/>
    <ellipse cx="130" cy="252" rx="46" ry="32" fill="#F1DFC0"/>
    <path d="M64 216 q66 -46 132 0 v42 q-66 24 -132 0z" fill="${c.main}"/>
    <path d="M64 216 q66 -46 132 0 v10 q-66 -30 -132 0z" fill="${c.dark}" opacity="0.5"/>
    <rect x="114" y="226" width="32" height="32" rx="6" fill="#F3E3B0"/>
    <ellipse cx="86" cy="288" rx="28" ry="13" fill="#9C6534"/>
    <ellipse cx="174" cy="288" rx="28" ry="13" fill="#9C6534"/>
    <g class="dog-head">
      <ellipse cx="58" cy="142" rx="30" ry="54" fill="#6E4522" transform="rotate(14 58 142)"/>
      <ellipse cx="202" cy="142" rx="30" ry="54" fill="#6E4522" transform="rotate(-14 202 142)"/>
      <circle cx="130" cy="132" r="74" fill="url(#fur${color})"/>
      <ellipse cx="130" cy="166" rx="44" ry="30" fill="#F1DFC0"/>
      <circle cx="86" cy="158" r="13" fill="#E9A59A" opacity="0.6"/>
      <circle cx="174" cy="158" r="13" fill="#E9A59A" opacity="0.6"/>
      <g class="eyes">
        <ellipse cx="104" cy="122" rx="11" ry="13" fill="#2B1D12"/>
        <ellipse cx="156" cy="122" rx="11" ry="13" fill="#2B1D12"/>
        <circle cx="108" cy="117" r="4" fill="#fff"/>
        <circle cx="160" cy="117" r="4" fill="#fff"/>
      </g>
      <path d="M118 152 q12 -10 24 0 q-6 12 -12 12 q-6 0 -12 -12z" fill="#2B1D12"/>
      <path class="mouth" d="M112 172 q18 16 36 0" fill="none" stroke="#5A3A20" stroke-width="4" stroke-linecap="round"/>
      <path d="M58 96 q72 -76 144 0 l-8 -30 q-64 -52 -128 0z" fill="${c.main}"/>
      <rect x="46" y="86" width="168" height="20" rx="10" fill="${c.dark}"/>
      <circle cx="130" cy="58" r="12" fill="#F3E3B0"/>
    </g>
  </g>
  <g class="rod">
    <line x1="192" y1="238" x2="256" y2="52" stroke="#5A3A20" stroke-width="9" stroke-linecap="round"/>
    <line x1="194" y1="236" x2="254" y2="56" stroke="#A9713A" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg></span>`
}

// 遊戲背景：水彩天、積雲、層疊山丘、青綠海、褪色碼頭。1200×800。
export function sceneSvg () {
  return `<img class="art-slot" src="img/scene.png" width="1200" height="800" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg class="scene" viewBox="0 0 1200 800" width="1200" height="800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
  <defs>
    ${PAPER_FILTER}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5B8FC7"/><stop offset="0.45" stop-color="#9CC4E4"/><stop offset="0.8" stop-color="#DCEBF2"/><stop offset="1" stop-color="#F6EBD3"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6FB3C4"/><stop offset="0.35" stop-color="#3E8FA6"/><stop offset="1" stop-color="#26647E"/>
    </linearGradient>
    <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DBFA6"/><stop offset="1" stop-color="#7FA58B"/></linearGradient>
    <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FAF6E"/><stop offset="1" stop-color="#5E8E52"/></linearGradient>
    <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E9C58"/><stop offset="1" stop-color="#4F7A40"/></linearGradient>
  </defs>
  <g filter="url(#paper)">
    <rect width="1200" height="800" fill="url(#sky)"/>
    <ellipse cx="1000" cy="150" rx="260" ry="200" fill="#FFF4D0" opacity="0.55" filter="url(#softer)"/>
    <circle cx="1000" cy="150" r="46" fill="#FFF7DC"/>
    <circle cx="1000" cy="150" r="70" fill="#FFF7DC" opacity="0.35" filter="url(#soft)"/>
    <g class="clouds">
      <g class="cloud-wrap c1">${cloud(260, 150, 1.05)}</g>
      <g class="cloud-wrap c2">${cloud(700, 210, 0.75)}</g>
      <g class="cloud-wrap c3">${cloud(1080, 300, 0.55)}</g>
    </g>
    <!-- 遠山：帶霧 -->
    <path d="M0 420 q120 -130 260 -60 q100 -90 220 -30 q140 -120 300 -40 q160 -80 420 20 v80 H0z" fill="url(#hillFar)" opacity="0.85"/>
    <rect y="380" width="1200" height="60" fill="#DCEBF2" opacity="0.35"/>
    <!-- 中山 -->
    <path d="M0 460 q160 -90 340 -20 q150 -70 320 0 q160 -60 340 10 q120 -20 200 20 v40 H0z" fill="url(#hillMid)"/>
    <g opacity="0.5">${[80, 260, 420, 610, 800, 980, 1120].map(x => grassTuft(x, 452, '#4F7A40')).join('')}</g>
    <!-- 樹叢 -->
    <g fill="#4F7A40"><ellipse cx="560" cy="446" rx="46" ry="26"/><ellipse cx="600" cy="440" rx="34" ry="30"/><ellipse cx="900" cy="450" rx="40" ry="22"/></g>
    <g fill="#6E9C58"><ellipse cx="548" cy="440" rx="26" ry="16"/><ellipse cx="892" cy="444" rx="22" ry="12"/></g>
    <!-- 海 -->
    <rect y="470" width="1200" height="330" fill="url(#sea)"/>
    <path d="M0 470 h1200 v10 q-300 14 -600 0 t-600 0z" fill="#8FC7D2" opacity="0.7"/>
    <g class="waves" fill="none" stroke="#CFEAF0" stroke-width="5" stroke-linecap="round" opacity="0.5">
      <path class="w1" d="M380 540 q40 -14 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0"/>
      <path class="w2" d="M360 650 q40 -14 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0"/>
      <path class="w3" d="M400 750 q40 -14 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0"/>
    </g>
    <g class="sea-sparkle" fill="#F6F3E6" opacity="0.55">
      <ellipse cx="560" cy="500" rx="44" ry="4"/><ellipse cx="820" cy="512" rx="60" ry="5"/><ellipse cx="1060" cy="496" rx="36" ry="4"/>
    </g>
    <g class="fish" fill="#F0B27A" opacity="0.45">
      <path d="M1000 720 q30 -22 60 0 q-30 22 -60 0z"/><polygon points="1060,720 1082,706 1082,734"/>
    </g>
    <!-- 碼頭：褪色木頭 -->
    <g>
      <rect x="70" y="560" width="24" height="220" rx="3" fill="#6E4F35"/>
      <rect x="215" y="560" width="24" height="220" rx="3" fill="#6E4F35"/>
      <rect x="360" y="560" width="24" height="220" rx="3" fill="#6E4F35"/>
      <rect x="0" y="524" width="410" height="42" rx="6" fill="#B08A63"/>
      <rect x="0" y="524" width="410" height="8" rx="4" fill="#CBA783"/>
      <rect x="0" y="562" width="410" height="14" fill="#7E5E40"/>
      <g stroke="#8E6D4C" stroke-width="3" opacity="0.8">
        <line x1="60" y1="524" x2="60" y2="566"/><line x1="130" y1="524" x2="130" y2="566"/><line x1="200" y1="524" x2="200" y2="566"/>
        <line x1="270" y1="524" x2="270" y2="566"/><line x1="340" y1="524" x2="340" y2="566"/>
      </g>
      <path d="M395 516 v-44" stroke="#5A3A20" stroke-width="5" stroke-linecap="round"/>
      <circle cx="395" cy="514" r="13" fill="#C8553D"/>
      <g>
        <path d="M300 492 l8 40 h44 l8 -40z" fill="#6F8FA3"/>
        <ellipse cx="330" cy="492" rx="30" ry="8" fill="#9EC3D1"/>
        <path d="M304 490 q26 -34 52 0" fill="none" stroke="#3E5A6A" stroke-width="3"/>
      </g>
      <ellipse cx="200" cy="580" rx="230" ry="14" fill="#26647E" opacity="0.35"/>
    </g>
  </g>
</svg>`
}

// 首頁／選人／結算的背景：水彩天、積雲、草原。1200×800。
export function homeBgSvg () {
  return `<img class="art-slot" src="img/home.png" width="1200" height="800" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg class="scene" viewBox="0 0 1200 800" width="1200" height="800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
  <defs>
    ${PAPER_FILTER}
    <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5B8FC7"/><stop offset="0.55" stop-color="#A9CDE6"/><stop offset="1" stop-color="#EAF1EC"/>
    </linearGradient>
    <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8DBB74"/><stop offset="1" stop-color="#5E8E52"/></linearGradient>
  </defs>
  <g filter="url(#paper)">
    <rect width="1200" height="800" fill="url(#hsky)"/>
    <ellipse cx="1040" cy="110" rx="240" ry="180" fill="#FFF4D0" opacity="0.5" filter="url(#softer)"/>
    <circle cx="1040" cy="110" r="42" fill="#FFF7DC"/>
    <g class="clouds">
      <g class="cloud-wrap c1">${cloud(230, 170, 1.1)}</g>
      <g class="cloud-wrap c2">${cloud(780, 130, 0.8)}</g>
      <g class="cloud-wrap c3">${cloud(560, 260, 0.5)}</g>
    </g>
    <path d="M0 560 q200 -70 420 -20 q200 -60 400 -10 q180 -40 380 10 v40 H0z" fill="#9DBFA6" opacity="0.8"/>
    <path d="M0 620 q300 -90 600 -10 t600 0 v200 H0z" fill="url(#meadow)"/>
    <path d="M0 690 q300 -60 600 0 t600 0 v110 H0z" fill="#4F7A40" opacity="0.9"/>
    <g opacity="0.7">${[60, 180, 330, 470, 620, 760, 900, 1050, 1150].map(x => grassTuft(x, 688, '#3E6A34')).join('')}</g>
    <g fill="#F6F3E6" opacity="0.9"><circle cx="160" cy="724" r="5"/><circle cx="420" cy="746" r="5"/><circle cx="900" cy="732" r="5"/><circle cx="1100" cy="756" r="5"/><circle cx="660" cy="722" r="5"/></g>
    <g fill="#E8C86A" opacity="0.9"><circle cx="300" cy="756" r="4"/><circle cx="760" cy="740" r="4"/><circle cx="1010" cy="770" r="4"/></g>
  </g>
</svg>`
}

// 三張玩法卡的插圖。300×400。
export function cardArt (kind) {
  if (kind === 'fishing') {
    return `<img class="art-slot" src="img/card-fishing.png" width="300" height="400" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg viewBox="0 0 300 400" width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6F9FD0"/><stop offset="1" stop-color="#DCEBF2"/></linearGradient></defs>
  <rect width="300" height="400" fill="url(#csky)"/>
  <circle cx="230" cy="70" r="30" fill="#FFF7DC"/>
  ${cloud(90, 80, 0.45)}
  <path d="M0 190 q80 -60 160 -10 q70 -50 140 0 v40 H0z" fill="#7FAF6E"/>
  <rect y="210" width="300" height="190" fill="#3E8FA6"/>
  <g fill="none" stroke="#CFEAF0" stroke-width="5" stroke-linecap="round" opacity="0.6">
    <path d="M40 260 q20 -12 40 0 t40 0"/><path d="M180 340 q20 -12 40 0 t40 0"/>
  </g>
  <rect x="0" y="240" width="120" height="18" rx="5" fill="#B08A63"/>
  <rect x="20" y="258" width="12" height="80" fill="#6E4F35"/><rect x="86" y="258" width="12" height="80" fill="#6E4F35"/>
  <line x1="70" y1="242" x2="150" y2="130" stroke="#5A3A20" stroke-width="7" stroke-linecap="round"/>
  <line x1="150" y1="130" x2="200" y2="270" stroke="#F6F3E6" stroke-width="2.5"/>
  <circle cx="200" cy="300" r="52" fill="#F6F3E6" opacity="0.92"/>
  <text x="200" y="322" text-anchor="middle" font-size="64" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄅ</text>
</svg>`
  }
  if (kind === 'whack') {
    return `<img class="art-slot" src="img/card-whack.png" width="300" height="400" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg viewBox="0 0 300 400" width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6F9FD0"/><stop offset="1" stop-color="#DCEBF2"/></linearGradient></defs>
  <rect width="300" height="400" fill="url(#wsky)"/>
  ${cloud(80, 70, 0.4)}
  <rect y="170" width="300" height="230" fill="#8DBB74"/>
  <path d="M0 170 q75 -30 150 0 t150 0 v20 H0z" fill="#7FAF6E"/>
  <ellipse cx="80" cy="260" rx="52" ry="22" fill="#5A4030"/>
  <ellipse cx="150" cy="340" rx="52" ry="22" fill="#5A4030"/>
  <rect x="180" y="190" width="80" height="80" rx="40" fill="#F6E7C8"/>
  <text x="220" y="250" text-anchor="middle" font-size="56" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄇ</text>
  <ellipse cx="220" cy="262" rx="56" ry="14" fill="#3E2A1A"/>
</svg>`
  }
  if (kind === 'write') {
    return `<img class="art-slot" src="img/card-write.png" width="300" height="400" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg viewBox="0 0 300 400" width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#EAF1EC"/>
  <rect x="40" y="60" width="220" height="220" rx="24" fill="#FFFDF7" stroke="#B08A63" stroke-width="8"/>
  <text x="150" y="215" text-anchor="middle" font-size="150" font-weight="900" fill="#CFD8E3" font-family="Microsoft JhengHei, sans-serif">ㄅ</text>
  <path d="M120 120 q10 60 -4 120 q40 -6 62 -30" fill="none" stroke="#2B3A4A" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="200" y="290" width="26" height="90" rx="8" fill="#E0955B" transform="rotate(-30 213 335)"/>
  <polygon points="188,372 200,395 210,380" fill="#2B3A4A" transform="rotate(-30 213 335)"/>
</svg>`
  }
  if (kind === 'match') {
    return `<img class="art-slot" src="img/card-match.png" width="300" height="400" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg viewBox="0 0 300 400" width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#DCEBF2"/>
  <rect x="30" y="70" width="100" height="70" rx="14" fill="#FFFDF7" stroke="#B08A63" stroke-width="6"/>
  <rect x="30" y="230" width="100" height="70" rx="14" fill="#FFFDF7" stroke="#B08A63" stroke-width="6"/>
  <text x="80" y="118" text-anchor="middle" font-size="40" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄒㄍ</text>
  <text x="80" y="278" text-anchor="middle" font-size="40" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄒㄇ</text>
  <line x1="130" y1="105" x2="200" y2="265" stroke="#6B9E6B" stroke-width="8" stroke-linecap="round"/>
  <line x1="130" y1="265" x2="200" y2="105" stroke="#6B9E6B" stroke-width="8" stroke-linecap="round"/>
  <text x="240" y="130" text-anchor="middle" font-size="60">\u{1F431}</text>
  <text x="240" y="290" text-anchor="middle" font-size="60">\u{1F436}</text>
</svg>`
  }
  if (kind === 'fill') {
    return `<img class="art-slot" src="img/card-fill.png" width="300" height="400" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg viewBox="0 0 300 400" width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#F3E4C2"/>
  <text x="70" y="150" text-anchor="middle" font-size="80">\u{1F34E}</text>
  <rect x="130" y="60" width="140" height="130" rx="18" fill="#FFFDF7" stroke="#B08A63" stroke-width="6"/>
  <text x="165" y="140" text-anchor="middle" font-size="44" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄆ</text>
  <rect x="200" y="90" width="50" height="70" rx="10" fill="none" stroke="#E0955B" stroke-width="5" stroke-dasharray="10 8"/>
  <rect x="60" y="260" width="70" height="70" rx="14" fill="#FFFDF7" stroke="#B08A63" stroke-width="6"/>
  <rect x="170" y="260" width="70" height="70" rx="14" fill="#FFF3B0" stroke="#E0955B" stroke-width="6"/>
  <text x="95" y="310" text-anchor="middle" font-size="40" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄍ</text>
  <text x="205" y="310" text-anchor="middle" font-size="40" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄨ</text>
  <path d="M215 250 q10 -40 10 -70" fill="none" stroke="#E0955B" stroke-width="5" stroke-dasharray="6 6"/>
</svg>`
  }
  if (kind === 'speak') {
    return `<img class="art-slot" src="img/card-speak.png" width="300" height="400" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg viewBox="0 0 300 400" width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#F3E4C2"/>
  <path d="M0 300 h300 v100 H0z" fill="#8DBB74"/>
  <circle cx="110" cy="230" r="60" fill="#C99A63"/>
  <ellipse cx="110" cy="258" rx="34" ry="22" fill="#F1DFC0"/>
  <ellipse cx="56" cy="240" rx="22" ry="42" fill="#6E4522" transform="rotate(14 56 240)"/>
  <ellipse cx="164" cy="240" rx="22" ry="42" fill="#6E4522" transform="rotate(-14 164 240)"/>
  <ellipse cx="92" cy="222" rx="9" ry="11" fill="#2B1D12"/><ellipse cx="128" cy="222" rx="9" ry="11" fill="#2B1D12"/>
  <path d="M110 270 q-16 0 -16 -8 h32 q0 8 -16 8z" fill="#2B1D12"/>
  <path d="M170 90 h100 a16 16 0 0 1 16 16 v70 a16 16 0 0 1 -16 16 h-60 l-30 26 v-26 h-10 a16 16 0 0 1 -16 -16 v-70 a16 16 0 0 1 16 -16z" fill="#FFFDF7"/>
  <text x="220" y="158" text-anchor="middle" font-size="60" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄚ</text>
  <rect x="210" y="250" width="40" height="70" rx="20" fill="#4A6FA5"/>
  <path d="M196 300 a34 34 0 0 0 68 0" stroke="#4A6FA5" stroke-width="10" fill="none"/>
  <rect x="224" y="330" width="12" height="30" fill="#4A6FA5"/>
</svg>`
  }
  return `<img class="art-slot" src="img/card-memory.png" width="300" height="400" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
<svg viewBox="0 0 300 400" width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#BFD8B0"/>
  <g>
    <rect x="40" y="80" width="90" height="120" rx="14" fill="#E39AA8"/>
    <rect x="170" y="80" width="90" height="120" rx="14" fill="#6F9FD0"/>
    <rect x="40" y="220" width="90" height="120" rx="14" fill="#E8C86A"/>
    <rect x="170" y="220" width="90" height="120" rx="14" fill="#F6F3E6"/>
  </g>
  <g fill="#F6F3E6" opacity="0.7"><circle cx="85" cy="140" r="22"/><circle cx="215" cy="140" r="22"/><circle cx="85" cy="280" r="22"/></g>
  <text x="215" y="300" text-anchor="middle" font-size="60" font-weight="900" fill="#2B3A4A" font-family="Microsoft JhengHei, sans-serif">ㄉ</text>
</svg>`
}

// 結算頁的彩帶：像花瓣、樹葉，顏色收斂
export function confettiHtml (count = 44) {
  const colors = ['#E39AA8', '#E8C86A', '#8FC7D2', '#8DBB74', '#F6F3E6', '#E0955B']
  let html = ''
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100
    const delay = Math.random() * 2
    const dur = 3.5 + Math.random() * 2.5
    const color = colors[i % colors.length]
    const rot = Math.floor(Math.random() * 360)
    const shape = i % 2 === 0 ? 'petal' : ''
    html += `<i class="confetti ${shape}" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;background:${color};transform:rotate(${rot}deg)"></i>`
  }
  return html
}


// ---- 骨頭（積分）與狗狗配件 ----
// 骨頭：兩端各兩個圓、中間一根桿。先畫一層粗描邊、再疊一層填色，外框才會連成一圈
export function boneSvg () {
  const shape = '<circle cx="8" cy="6.5" r="5"/><circle cx="8" cy="13.5" r="5"/><circle cx="32" cy="6.5" r="5"/><circle cx="32" cy="13.5" r="5"/><rect x="8" y="7" width="24" height="6" rx="3"/>'
  return `<svg class="bone" viewBox="0 0 40 20" width="1.6em" height="0.8em" xmlns="http://www.w3.org/2000/svg"><g fill="#B08A63" stroke="#B08A63" stroke-width="3.5" stroke-linejoin="round">${shape}</g><g fill="#FFFDF7">${shape}</g></svg>`
}
// 商店按鈕用的圖：打勾（戴上／確定買）、叉叉（脫掉）、購物袋（首頁進商店）
export const SHOP_ICONS = {
  check: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  cross: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
}

// 配件畫在狗狗的 260×300 框裡（對準 img/dog-0.png 那隻：帽子頂 y≈30、眼睛 y≈108 在 x 92 與 150、脖子 y≈160）。
// slot：head 頭上、face 臉上、neck 脖子，每個部位只能戴一件。box 是商店卡片裁圖用的範圍 [x, y, w, h]。
export const ACCESSORIES = [
  { id: 'flower', name: '小花', slot: 'head', price: 60, box: [20, 80, 70, 70],
    svg: `<g transform="translate(52 112)"><g fill="#E39AA8">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="7" ry="13" cy="-13" transform="rotate(${a})"/>`).join('')}</g><circle r="7" fill="#E8C86A"/></g>` },
  { id: 'bow', name: '紅蝴蝶結', slot: 'head', price: 80, box: [135, 40, 80, 70],
    svg: `<g transform="translate(176 74)"><path d="M0 0 L-26 -16 L-24 16 Z M0 0 L26 -16 L24 16 Z" fill="#C8553D"/><path d="M-20 -8 L-8 -2 M20 -8 L8 -2" stroke="#96402D" stroke-width="3" stroke-linecap="round" fill="none"/><circle r="6" fill="#96402D"/></g>` },
  { id: 'party', name: '派對帽', slot: 'head', price: 120, box: [120, 0, 90, 80],
    svg: `<g transform="translate(165 10)"><path d="M0 0 L-26 58 L26 58 Z" fill="#4A6FA5"/><path d="M-13 29 L13 29 M-20 44 L20 44" stroke="#E8C86A" stroke-width="5"/><circle r="7" fill="#E39AA8"/></g>` },
  { id: 'crown', name: '小皇冠', slot: 'head', price: 200, box: [60, 0, 100, 70],
    svg: `<g transform="translate(110 40)"><path d="M-34 14 L-38 -22 L-19 -4 L0 -30 L19 -4 L38 -22 L34 14 Z" fill="#E8C86A" stroke="#B99A44" stroke-width="3" stroke-linejoin="round"/><circle cx="-19" cy="4" r="4" fill="#C8553D"/><circle cx="0" cy="2" r="4" fill="#4A6FA5"/><circle cx="19" cy="4" r="4" fill="#6B9E6B"/></g>` },
  { id: 'glasses', name: '圓眼鏡', slot: 'face', price: 100, box: [60, 80, 120, 60],
    svg: `<g fill="rgba(255,255,255,0.18)" stroke="#8E6D4C" stroke-width="4"><circle cx="92" cy="108" r="19"/><circle cx="150" cy="108" r="19"/><path d="M111 106 Q121 100 131 106" fill="none"/></g>` },
  { id: 'shades', name: '太陽眼鏡', slot: 'face', price: 150, box: [60, 80, 120, 60],
    svg: `<g><rect x="70" y="94" width="44" height="28" rx="10" fill="#2B3A4A"/><rect x="128" y="94" width="44" height="28" rx="10" fill="#2B3A4A"/><path d="M114 104 Q121 98 128 104" stroke="#2B3A4A" stroke-width="4" fill="none"/><path d="M78 100 L92 100" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/><path d="M136 100 L150 100" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/></g>` },
  { id: 'bowtie', name: '領結', slot: 'neck', price: 80, box: [80, 135, 80, 60],
    svg: `<g transform="translate(120 164)"><path d="M0 0 L-24 -13 L-22 13 Z M0 0 L24 -13 L22 13 Z" fill="#34507A"/><circle r="5" fill="#1B2B4B"/></g>` },
  { id: 'scarf', name: '藍圍巾', slot: 'neck', price: 120, box: [50, 135, 130, 90],
    svg: `<g><path d="M72 150 Q120 178 168 152 Q170 168 166 176 Q120 200 74 170 Z" fill="#4A6FA5"/><path d="M78 168 Q64 190 70 216 L92 214 Q90 190 100 178 Z" fill="#34507A"/><path d="M72 208 L92 206" stroke="#E8C86A" stroke-width="4"/></g>` },
  { id: 'necklace', name: '星星項鍊', slot: 'neck', price: 100, box: [75, 140, 90, 60],
    svg: `<g><path d="M84 150 Q120 190 156 150" fill="none" stroke="#E8C86A" stroke-width="3"/><path d="M120 168 l5 10 11 1-8 8 2 11-10-6-10 6 2-11-8-8 11-1z" fill="#E8C86A" stroke="#B99A44" stroke-width="1.5"/></g>` },
  { id: 'ears', name: '兔耳朵', slot: 'head', price: 180, box: [60, 0, 120, 90],
    svg: `<g transform="translate(118 58)"><g transform="rotate(-14)"><ellipse cx="-20" cy="-30" rx="11" ry="34" fill="#FFFDF7" stroke="#B08A63" stroke-width="3"/><ellipse cx="-20" cy="-30" rx="5" ry="24" fill="#E39AA8"/></g><g transform="rotate(14)"><ellipse cx="20" cy="-30" rx="11" ry="34" fill="#FFFDF7" stroke="#B08A63" stroke-width="3"/><ellipse cx="20" cy="-30" rx="5" ry="24" fill="#E39AA8"/></g></g>` },
  { id: 'cowboy', name: '牛仔帽', slot: 'head', price: 280, box: [40, 20, 150, 80],
    svg: `<g transform="translate(115 62)"><ellipse rx="66" ry="17" fill="#B07242"/><path d="M-34 0 q-3 -34 8 -40 q26 10 52 0 q11 6 8 40 z" fill="#E0955B" stroke="#B07242" stroke-width="3"/><path d="M-34 -6 q34 10 68 0" stroke="#8E6D4C" stroke-width="8" fill="none"/></g>` },
  { id: 'heartglass', name: '愛心眼鏡', slot: 'face', price: 220, box: [55, 78, 130, 62],
    svg: `<g fill="#E39AA8" stroke="#C8553D" stroke-width="3"><path d="M92 120 q-20 -14 -20 -24 a10 10 0 0 1 20 -6 a10 10 0 0 1 20 6 q0 10 -20 24z"/><path d="M150 120 q-20 -14 -20 -24 a10 10 0 0 1 20 -6 a10 10 0 0 1 20 6 q0 10 -20 24z"/></g>` },
  { id: 'medal', name: '金牌', slot: 'neck', price: 300, box: [80, 140, 90, 90],
    svg: `<g><path d="M104 152 L120 196 L136 152" fill="none" stroke="#C8553D" stroke-width="9"/><circle cx="120" cy="208" r="19" fill="#E8C86A" stroke="#B99A44" stroke-width="3"/><path d="M120 197 l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#B99A44"/></g>` },
  { id: 'backpack', name: '小背包', slot: 'back', price: 250, box: [-30, 145, 120, 130],
    svg: `<g><rect x="-24" y="162" width="92" height="100" rx="26" fill="#6B9E6B" stroke="#4E7A4E" stroke-width="4"/><rect x="-10" y="202" width="62" height="36" rx="12" fill="#4E7A4E"/><path d="M-2 162 q22 -24 44 0" fill="none" stroke="#4E7A4E" stroke-width="7"/></g>` },
  { id: 'cape', name: '英雄披風', slot: 'back', price: 350, box: [-20, 140, 300, 195],
    svg: `<g><path d="M84 150 q36 24 72 0 l96 172 q-132 42 -264 0z" fill="#C8553D" stroke="#96402D" stroke-width="4"/><path d="M118 158 l-18 156 M146 158 l18 156" stroke="#96402D" stroke-width="3" opacity="0.45" fill="none"/></g>` },
  { id: 'wings', name: '小翅膀', slot: 'back', price: 550, box: [-30, 85, 320, 160],
    svg: `<g fill="#EAF2F8" stroke="#8FB3C9" stroke-width="4"><path d="M100 165 q-96 -72 -114 -8 q-14 54 34 64 q46 10 80 -28z"/><path d="M160 165 q96 -72 114 -8 q14 54 -34 64 q-46 10 -80 -28z"/></g>` },
]

// 目前這位小孩的狗狗顏色和穿戴；main.js 選人、買東西、換裝時更新。dogSvg 畫到同色的狗才加配件。
const OUTFIT = { color: -1, worn: {} }
export function setOutfit (color, worn) { OUTFIT.color = color; OUTFIT.worn = worn || {} }
function accessoryLayer (color) {
  if (color !== OUTFIT.color) return ''
  const items = ACCESSORIES.filter(a => OUTFIT.worn[a.slot] === a.id)
  if (!items.length) return ''
  const layer = (cls, list) => list.length
    ? `<svg class="dog-acc ${cls}" viewBox="0 0 260 300" xmlns="http://www.w3.org/2000/svg">${list.map(a => a.svg).join('')}</svg>`
    : ''
  // 背包、披風、翅膀畫在狗狗後面，其他畫在前面
  return layer('back', items.filter(a => a.slot === 'back')) + layer('front', items.filter(a => a.slot !== 'back'))
}
// 商店卡片用：只裁配件那一塊
export function accessoryIcon (item) {
  const [x, y, w, h] = item.box
  return `<svg viewBox="${x} ${y} ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${item.svg}</svg>`
}


// ---- 救援隊員：另外五隻狗狗，一隻一隻買回家 ----
export const DOG_NAMES = ['警察狗', '消防狗', '飛行狗', '回收狗', '工程狗', '鬆餅狗']
const MATE_PRICES = [600, 800, 1100, 1400, 1800]

// 她自己那隻本來就有，商店賣其他五隻；越後面越貴
export function teammatesFor (ownColor) {
  const own = ownColor % DOG_COLORS.length
  return DOG_COLORS.map((c, i) => i).filter(i => i !== own)
    .map((i, k) => ({ id: 'mate-' + i, kind: 'mate', color: i, name: DOG_NAMES[i], price: MATE_PRICES[k] }))
}
// 已經買回家的隊員（回傳狗狗顏色）
export function ownedMates (state) {
  return (state.owned || []).filter(id => id.startsWith('mate-')).map(id => parseInt(id.slice(5), 10))
}

// 商店分頁的圖示：配件（蝴蝶結）、隊員（狗掌）
export const TAB_ICONS = {
  acc: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M11 12 3 7v10zm2 0 8-5v10zm-1-2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
  mate: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><ellipse cx="12" cy="16" rx="6" ry="5"/><circle cx="5" cy="10" r="2.6"/><circle cx="9.5" cy="6.5" r="2.6"/><circle cx="14.5" cy="6.5" r="2.6"/><circle cx="19" cy="10" r="2.6"/></svg>',
}


// ---- 首頁每日目標、連對、結算用的小圖 ----
export const UX_ICONS = {
  flame: '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 1.5c1.2 4.2 5.5 5.6 5.5 11.3a5.5 5.5 0 0 1-11 0c0-2.8 1.3-4.4 2.6-5.7.2 1.9 1.1 3.1 2.3 3.5C11 7.6 12 4.8 12 1.5z" fill="#FFB347"/><path d="M12 11.5c.7 1.8 2.8 2.6 2.8 5.1a2.8 2.8 0 0 1-5.6 0c0-1.5 1-2.3 1.7-2.9.1.9.6 1.4 1.1 1.7-.3-1.6 0-2.7 0-3.9z" fill="#FFF1C9"/></svg>',
  paw: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><ellipse cx="12" cy="16" rx="5.6" ry="4.6"/><circle cx="5.4" cy="10" r="2.5"/><circle cx="9.5" cy="6.3" r="2.5"/><circle cx="14.5" cy="6.3" r="2.5"/><circle cx="18.6" cy="10" r="2.5"/></svg>',
  chest: '<svg viewBox="0 0 48 42" width="1em" height="1em"><g class="lid"><path d="M4 18 q0 -14 20 -14 q20 0 20 14 z" fill="#E0955B" stroke="#7A5A3C" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 6.5 v11.5 M34 6.5 v11.5" stroke="#E8C86A" stroke-width="3"/></g><rect x="4" y="18" width="40" height="20" rx="3" fill="#C9763E" stroke="#7A5A3C" stroke-width="2.5"/><path d="M14 18 v20 M34 18 v20" stroke="#E8C86A" stroke-width="3"/><rect x="20" y="15" width="8" height="10" rx="2" fill="#E8C86A" stroke="#7A5A3C" stroke-width="2"/></svg>',
  musicOn: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="#fff"><path d="M9 17.5a3 3 0 1 1-2-2.8V5.2l12-2.2v11.5a3 3 0 1 1-2-2.8V6.4L9 7.9z"/></svg>',
  musicOff: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="#fff"><path d="M9 17.5a3 3 0 1 1-2-2.8V5.2l12-2.2v11.5a3 3 0 1 1-2-2.8V6.4L9 7.9z" opacity=".55"/><path d="M3 3 21 21" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>',
  crown: '<svg viewBox="0 0 64 44" width="1em" height="1em"><path d="M6 38 L2 8 L18 22 L32 2 L46 22 L62 8 L58 38 Z" fill="#E8C86A" stroke="#B99A44" stroke-width="3" stroke-linejoin="round"/><circle cx="18" cy="30" r="4" fill="#C8553D"/><circle cx="32" cy="28" r="4.5" fill="#4A6FA5"/><circle cx="46" cy="30" r="4" fill="#6B9E6B"/></svg>',
}
