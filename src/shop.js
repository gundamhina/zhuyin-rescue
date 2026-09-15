// 狗狗商店：用骨頭買配件，買了就戴在她的狗狗身上。
// renderShop(root, { profile, state, onBuy(item), onWear(slot, id|null), onClose })

import { ACCESSORIES, accessoryIcon, boneSvg, dogSvg, bgHtml, SHOP_ICONS } from './art.js'
import { mountBgs } from './ui.js'

const SLOT_NAMES = { head: '頭上', face: '臉上', neck: '脖子' }

export function renderShop (root, { profile, state, onBuy, onWear, onClose }) {
  const owned = state.owned || []
  const worn = state.worn || {}
  const cards = ACCESSORIES.map(item => {
    const has = owned.includes(item.id)
    const on = worn[item.slot] === item.id
    const canBuy = !has && state.bones >= item.price
    let btn
    // 按鈕全部用圖不用字：叉叉＝脫掉、打勾＝戴上、骨頭加數字＝多少錢（第一下變橘色加打勾＝確定買）
    if (has && on) btn = `<button class="item-btn off" data-wear="${item.slot}" data-id="" aria-label="脫掉">${SHOP_ICONS.cross}</button>`
    else if (has) btn = `<button class="item-btn on" data-wear="${item.slot}" data-id="${item.id}" aria-label="戴上">${SHOP_ICONS.check}</button>`
    else btn = `<button class="item-btn buy ${canBuy ? '' : 'poor'}" data-buy="${item.id}" ${canBuy ? '' : 'disabled'} aria-label="買 ${item.name}">${boneSvg()} ${item.price}</button>`
    return `
      <div class="item-card ${has ? 'owned' : ''} ${on ? 'worn' : ''}" title="${item.name}（${SLOT_NAMES[item.slot]}）">
        <div class="item-pic">${accessoryIcon(item)}</div>
        ${btn}
      </div>`
  }).join('')

  root.innerHTML = `
    ${bgHtml('home')}
    <div class="frame shop-frame">
      <button class="round-btn quit shop-close" id="shop-close" aria-label="回首頁">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="#fff"><path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>
      </button>
      <div class="bones-pill big"><span class="bone-ic">${boneSvg()}</span><b>${state.bones}</b></div>
      <div class="shop-dog dog-wrap">${dogSvg(profile.color)}</div>
      <div class="shop-grid">${cards}</div>
      <div class="shop-msg" id="shop-msg"></div>
    </div>`
  mountBgs(root)

  root.querySelector('#shop-close').addEventListener('pointerdown', onClose)
  // 買：第一下變成「再按一下就買」，四秒內再按一下才真的買，小孩不會手滑
  root.querySelectorAll('[data-buy]').forEach(btn => {
    const item = ACCESSORIES.find(i => i.id === btn.dataset.buy)
    let armed = null
    btn.addEventListener('pointerdown', () => {
      if (btn.disabled) return
      if (armed) { clearTimeout(armed); onBuy(item); return }
      btn.classList.add('armed')
      btn.innerHTML = `${boneSvg()} ${item.price} ${SHOP_ICONS.check}`
      armed = setTimeout(() => { armed = null; btn.classList.remove('armed'); btn.innerHTML = `${boneSvg()} ${item.price}` }, 4000)
    })
  })
  root.querySelectorAll('[data-wear]').forEach(btn => {
    btn.addEventListener('pointerdown', () => onWear(btn.dataset.wear, btn.dataset.id || null))
  })
}
