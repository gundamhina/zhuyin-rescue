// 打地鼠玩法。符號一個一個從洞裡冒出來又縮回去，狗狗喊一個音，拍到對的就過關。
// 不計時、不扣分：沒拍到就等它下次再冒出來，拍錯才算錯（交給 main.js 記錄）。
// 介面跟釣魚一樣：start、lock/unlock、hint、shake、celebrate、sad、onAnswer、destroy。

import { dogSvg, homeBgSvg } from './art.js'

const HOLES = [[330, 430], [600, 430], [870, 430], [460, 620], [730, 620], [1000, 620]]
const UP_MS = 1700 // 冒出來停多久
const GAP_MS = 350 // 縮回去到下一個冒出來

function shuffleList (arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function createWhack (root, { color = 0 } = {}) {
  root.innerHTML = homeBgSvg() +
    '<div class="dog-wrap whack-dog">' + dogSvg(color) + '</div>' +
    '<div class="holes">' + HOLES.map(([x, y]) => `
      <div class="hole" style="left:${x - 110}px;top:${y - 90}px">
        <div class="hole-back"></div>
        <div class="mole"><span></span></div>
        <div class="hole-front"></div>
      </div>`).join('') + '</div>'
  const dogWrap = root.querySelector('.whack-dog')
  const holes = [...root.querySelectorAll('.hole')]
  let handler = null
  let locked = true
  let current = null
  let running = false
  let timer = null
  let queue = []
  let lastHole = -1
  let glowOnce = false
  let upMole = null // 目前冒出來的那一個

  root.addEventListener('pointerdown', e => {
    const mole = e.target.closest('.mole')
    if (!mole || locked || !handler || !mole.classList.contains('up')) return
    handler(mole.dataset.symbol, mole)
  })

  // 出場順序：干擾項隨機，目標排在第 2 個，之後每 3 個出現一次
  function refill () {
    const distractors = shuffleList(current.options.filter(s => s !== current.target))
    const seq = []
    let d = 0
    for (let i = 0; i < 9; i++) {
      if (i % 3 === 1) seq.push(current.target)
      else { seq.push(distractors[d % distractors.length]); d++ }
    }
    queue.push(...seq)
  }

  function popNext () {
    if (!running) return
    if (!queue.length) refill()
    const sym = queue.shift()
    let idx = Math.floor(Math.random() * holes.length)
    if (idx === lastHole) idx = (idx + 1) % holes.length
    lastHole = idx
    const mole = holes[idx].querySelector('.mole')
    mole.dataset.symbol = sym
    mole.querySelector('span').textContent = sym
    mole.classList.remove('shake', 'hit', 'hint-loop')
    if (sym === current.target && glowOnce) {
      mole.classList.add('hint-loop')
      glowOnce = false
    }
    mole.classList.add('up')
    upMole = mole
    timer = setTimeout(() => {
      mole.classList.remove('up')
      upMole = null
      timer = setTimeout(popNext, GAP_MS)
    }, UP_MS)
  }

  function stopLoop () {
    running = false
    clearTimeout(timer)
    timer = null
  }

  function start (question) {
    current = question
    locked = true
    queue = []
    glowOnce = false
    stopLoop()
    holes.forEach(h => {
      const m = h.querySelector('.mole')
      m.classList.remove('up', 'hit', 'shake', 'hint-loop')
    })
    upMole = null
  }

  function unlock () {
    locked = false
    if (!running) { running = true; timer = setTimeout(popNext, 200) }
  }
  function lock () { locked = true }

  // 提示：目標下一次冒出來時發一次光；若它正好在外面，現在就發
  function hint () {
    if (upMole && upMole.dataset.symbol === current.target) {
      upMole.classList.remove('hint-loop')
      void upMole.offsetWidth
      upMole.classList.add('hint-loop')
      return
    }
    glowOnce = true
  }
  function shake (symbol) {
    const mole = upMole && upMole.dataset.symbol === symbol ? upMole : null
    if (!mole) return
    mole.classList.remove('shake')
    void mole.offsetWidth
    mole.classList.add('shake')
  }

  // 拍到了：停止冒出，那一個彈一下留在外面
  function celebrate (symbol) {
    return new Promise(resolve => {
      stopLoop()
      const mole = upMole && upMole.dataset.symbol === symbol ? upMole : null
      if (mole) { mole.classList.remove('hint-loop'); mole.classList.add('hit') }
      dogWrap.classList.remove('jump')
      void dogWrap.offsetWidth
      dogWrap.classList.add('jump')
      setTimeout(() => { if (mole) mole.classList.remove('up', 'hit'); resolve() }, 650)
    })
  }
  function sad () {
    dogWrap.classList.remove('tilt')
    void dogWrap.offsetWidth
    dogWrap.classList.add('tilt')
  }
  function onAnswer (fn) { handler = fn }
  function destroy () { stopLoop(); root.innerHTML = ''; handler = null }

  return { start, unlock, lock, hint, shake, celebrate, sad, onAnswer, destroy }
}
