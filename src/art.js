// SVG 圖：場景、狗狗、卡片插圖。全部是字串，塞進 innerHTML。
// 風格：借宮崎駿動畫的氛圍。水彩天空、厚積雲、層疊山丘、青綠海面、褪色木頭、柔光，不用粗描邊。

// 符號怎麼顯示：單一符號直接放，結合韻兩個直排
export function symbolMarkup (sym) {
  const tone = (sym.match(/[ˊˇˋ˙]$/) || [''])[0]
  const core = tone ? sym.slice(0, -1) : sym
  if (core.length < 2 && !tone) return sym
  const marks = [...core].map(ch => `<i>${ch}</i>`).join('')
  const toneHtml = tone ? `<b class="tone">${tone}</b>` : ''
  return `<span class="compound n${core.length}">${marks}${toneHtml}</span>`
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
export function dogSvg (color = 0) {
  const c = DOG_COLORS[color % DOG_COLORS.length]
  return `<span class="dog-slot"><img class="art-slot" src="img/dog-${color % DOG_COLORS.length}.png" width="260" height="300" alt="" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">
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
