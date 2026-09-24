// 狗狗商店：用骨頭買配件和救援隊員。全部用圖，不用字。
// renderShop(root, { profile, state, tab, onTab, onBuy(item), onWear(slot, id|null), onClose })

import { ACCESSORIES, accessoryIcon, boneSvg, dogSvg, bgHtml, SHOP_ICONS, TAB_ICONS, teammatesFor, ownedMates } from './art.js'
import { mountBgs } from './ui.js'

const SLOT_NAMES = { head: '頭上', face: '臉上', neck: '脖子', back: '背後' }

function priceBtn (item, canBuy) {
  return `<button class="item-btn buy ${canBuy ? '' : 'poor'}" data-buy="${item.id}" ${canBuy ? '' : 'disabled'} aria-label="買 ${item.name}">${boneSvg()} ${item.price}</button>`
}

export function renderShop (root, { profile, state, tab = 'acc', onTab, onBuy, onWear, onClose }) {
  const owned = state.owned || []
  const worn = state.worn || {}
  const mates = teammatesFor(profile.color)
  const all = tab === 'mate' ? mates : ACCESSORIES

  const cards = all.map(item => {
    const has = owned.includes(item.id)
    const on = item.slot ? worn[item.slot] === item.id : has
    const canBuy = !has && state.bones >= item.price
    // 按鈕全是圖：叉叉＝脫掉、打勾＝戴上、骨頭加數字＝買（按第一下變橘色加打勾＝確定）
    let btn
    if (item.kind === 'mate') btn = has ? `<div class="item-btn home-ok" aria-label="已經回家了">${SHOP_ICONS.check}</div>` : priceBtn(item, canBuy)
    else if (has && on) btn = `<button class="item-btn off" data-wear="${item.slot}" data-id="" aria-label="脫掉">${SHOP_ICONS.cross}</button>`
    else if (has) btn = `<button class="item-btn on" data-wear="${item.slot}" data-id="${item.id}" aria-label="戴上">${SHOP_ICONS.check}</button>`
    else btn = priceBtn(item, canBuy)
    const pic = item.kind === 'mate'
      ? `<div class="mate-pic">${dogSvg(item.color, { mate: true })}</div>`
      : accessoryIcon(item)
    const label = item.kind === 'mate' ? item.name : `${item.name}（${SLOT_NAMES[item.slot]}）`
    return `
      <div class="item-card ${has ? 'owned' : ''} ${on ? 'worn' : ''}" title="${label}">
        <div class="item-pic">${pic}</div>
        ${btn}
      </div>`
  }).join('')

  const tabBtn = (id, label) => `<button class="shop-tab ${tab === id ? 'on' : ''}" data-tab="${id}" aria-label="${label}">${TAB_ICONS[id]}</button>`

  root.innerHTML = `
    ${bgHtml('shop')}
    <div class="frame shop-frame">
      <button class="round-btn quit shop-close" id="shop-close" aria-label="回首頁">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="#fff"><path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>
      </button>
      <div class="bones-pill big"><span class="bone-ic">${boneSvg()}</span><b>${state.bones}</b></div>
      <div class="shop-dog dog-wrap">${dogSvg(profile.color)}</div>
      <div class="shop-tabs">${tabBtn('acc', '配件')}${tabBtn('mate', '救援隊員')}</div>
      <div class="shop-grid ${tab === 'mate' ? 'mates-tab' : ''}">${cards}</div>
    </div>`
  mountBgs(root)

  root.querySelector('#shop-close').addEventListener('pointerdown', onClose)
  root.querySelectorAll('[data-tab]').forEach(b => {
    b.addEventListener('pointerdown', () => onTab(b.dataset.tab))
  })
  // 買要按兩下：第一下變橘色加打勾，四秒內再按一下才真的買，小孩不會手滑
  root.querySelectorAll('[data-buy]').forEach(btn => {
    const item = all.find(i => i.id === btn.dataset.buy)
    let armed = null
    btn.addEventListener('pointerdown', () => {
      if (btn.disabled) return
      if (armed) { clearTimeout(armed); onBuy(item); return }
      btn.classList.add('armed')
      btn.innerHTML = `${SHOP_ICONS.check} ${item.price}` // 骨頭圖示先拿掉，四位數價格加打勾才塞得進卡片
      armed = setTimeout(() => { armed = null; btn.classList.remove('armed'); btn.innerHTML = `${boneSvg()} ${item.price}` }, 4000)
    })
  })
  root.querySelectorAll('[data-wear]').forEach(btn => {
    btn.addEventListener('pointerdown', () => onWear(btn.dataset.wear, btn.dataset.id || null))
  })

  // 已買的隊員一起站在旁邊
  const team = ownedMates(state)
  if (team.length) {
    const wrap = document.createElement('div')
    wrap.className = 'shop-team'
    wrap.innerHTML = team.map(c => `<div class="mate">${dogSvg(c, { mate: true })}</div>`).join('')
    root.querySelector('.shop-frame').appendChild(wrap)
  }
}
