// 出題邏輯：熟練度、解鎖、加權出題、混淆對加練、階級升降。
// 純函式，不碰 DOM，不碰 localStorage。所有函式回傳新狀態，不改舊的。

import { GROUPS, SIMILAR_SHAPE, SIMILAR_SOUND, coreOf } from './data.js'

export const HISTORY_CAP = 10
export const RECENT_CAP = 10
export const ROUND_SIZE = 5
export const UNLOCK_STARS = 4
export const DRILL_CLEAR_STREAK = 3

// 一個數字代表整體難度，往上走選項變多、干擾項變刁、提示變少。
// idleHint：幾秒沒點就重唸並晃一下正確的（0 = 不提示）。只有最低兩階有，其他一律沒有。
// 一開始永遠沒有提示，答錯也不顯示答案，只重唸一次。
export const TIERS = [
  { options: 2, distract: 'random', idleHint: 10 },
  { options: 3, distract: 'random', idleHint: 10 },
  { options: 3, distract: 'shape', idleHint: 0 },
  { options: 4, distract: 'shape', idleHint: 0 },
  { options: 4, distract: 'sound', idleHint: 0 },
  { options: 6, distract: 'sound', idleHint: 0 },
]

export function createState ({ known = [], groups = null } = {}) {
  return {
    version: 1,
    mastery: {},
    known: [...known],
    confusions: {},
    tier: 0,
    recent: [],
    groups,
    lockTier: null, // 家長鎖定的階級；null 表示自動
    rangeGroups: null, // 家長指定的練習組別索引；null 或空表示自動解鎖
    unlockedUpTo: null, // 家長手動跳級：至少解鎖到第幾組（1 起算）；null 表示不干預
  }
}

// 自動解鎖到第幾組（1 起算）：練熟一組開下一組，再跟家長手動跳級的值取大者
export function unlockedCount (state) {
  const groups = state.groups || GROUPS
  let n = 1
  while (n < groups.length && groupAverage(state, groups[n - 1]) >= UNLOCK_STARS) n++
  const manual = typeof state.unlockedUpTo === 'number' ? state.unlockedUpTo : 1
  return Math.min(groups.length, Math.max(n, manual))
}

// 清除練習紀錄：星星、混淆對、階級、最近答題全部歸零。名字、認得、難度鎖、範圍都保留。
export function resetProgress (state) {
  return { ...state, mastery: {}, confusions: {}, tier: 0, recent: [] }
}

// 出題實際用的階級：家長有鎖就用鎖的，否則用自動升降的
export function effectiveTier (state) {
  return typeof state.lockTier === 'number' ? state.lockTier : state.tier
}

// 0–5 星。只看最近 10 次；樣本少時星星不會超過樣本數，避免答對一次就 5 星。
export function stars (state, symbol) {
  const history = (state.mastery[symbol] && state.mastery[symbol].history) || []
  if (history.length === 0) return state.known.includes(symbol) ? 3 : 0
  const okCount = history.filter(h => h.ok).length
  return Math.min(Math.round((okCount / history.length) * 5), history.length)
}

function groupAverage (state, group) {
  return group.reduce((sum, s) => sum + stars(state, s), 0) / group.length
}

// 目前可出題的符號。家長有指定範圍就只出那幾組；否則是已解鎖的組 + 家長勾「已經認得」的。
export function activePool (state) {
  const groups = state.groups || GROUPS
  if (Array.isArray(state.rangeGroups) && state.rangeGroups.length) {
    return state.rangeGroups.filter(i => groups[i]).flatMap(i => groups[i])
  }
  const pool = groups.slice(0, unlockedCount(state)).flat()
  for (const s of state.known) {
    if (!pool.includes(s)) pool.push(s)
  }
  return pool
}

function weightedPick (items, weightOf, rng) {
  const weights = items.map(weightOf)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r < 0) return items[i]
  }
  return items[items.length - 1]
}

function shuffle (arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function partnersOf (symbol, pairs) {
  const out = []
  for (const [a, b] of pairs) {
    if (a === symbol) out.push(b)
    else if (b === symbol) out.push(a)
  }
  return out
}

// 兩個字有幾個位置的符號一樣（長度不同算 0）
function sharedSymbols (a, b) {
  a = coreOf(a)
  b = coreOf(b)
  if (a.length !== b.length) return 0
  let n = 0
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) n++
  return n
}

function pickDistractors (target, pool, count, mode, rng) {
  const candidates = pool.filter(s => s !== target)
  const preferred = []
  if (mode === 'sound') preferred.push(...partnersOf(target, SIMILAR_SOUND))
  if (mode === 'sound' || mode === 'shape') preferred.push(...partnersOf(target, SIMILAR_SHAPE))
  // 拼讀字：形似／音似階級優先挑只差一個符號的，越像越前面
  if (coreOf(target).length > 1 && mode !== 'random') {
    const close = shuffle(candidates.filter(c => sharedSymbols(target, c) >= coreOf(target).length - 1), rng)
    preferred.push(...close)
  }
  const chosen = []
  for (const p of preferred) {
    if (chosen.length >= count) break
    if (candidates.includes(p) && !chosen.includes(p)) chosen.push(p)
  }
  const rest = shuffle(candidates.filter(s => !chosen.includes(s)), rng)
  while (chosen.length < count && rest.length) chosen.push(rest.pop())
  return chosen
}

function pairKey (a, b) {
  return [a, b].sort().join('|')
}

// 一局 5 題。至少 2 題來自最弱的三個符號；有混淆對時，插一題二選一加練。
export function buildRound (state, rng, size = ROUND_SIZE) {
  const pool = activePool(state)
  const tier = TIERS[effectiveTier(state)]
  const optionCount = Math.min(tier.options, pool.length)
  const weakest = [...pool].sort((a, b) => stars(state, a) - stars(state, b)).slice(0, 3)
  const weightOf = s => Math.pow(6 - stars(state, s), 2)

  const slots = shuffle([...Array(size).keys()], rng)
  const forced = new Set(slots.slice(0, 2))
  const drillKeys = Object.keys(state.confusions)
  const drillSlot = drillKeys.length ? slots[2] : -1

  const round = []
  for (let i = 0; i < size; i++) {
    if (i === drillSlot) {
      const key = drillKeys[Math.floor(rng() * drillKeys.length)]
      const pair = key.split('|')
      const target = pair[Math.floor(rng() * 2)]
      round.push({ target, options: shuffle(pair, rng), idleHint: tier.idleHint, drill: key })
      continue
    }
    const source = forced.has(i) ? weakest : pool
    const target = weightedPick(source, weightOf, rng)
    const distractors = pickDistractors(target, pool, optionCount - 1, tier.distract, rng)
    round.push({ target, options: shuffle([target, ...distractors], rng), idleHint: tier.idleHint, drill: null })
  }
  return round
}

// 翻牌用：從出題池挑 n 個不重複的符號，弱的優先。池子不夠就全給。
export function pickSymbols (state, rng, n) {
  let candidates = activePool(state)
  const weightOf = s => Math.pow(6 - stars(state, s), 2)
  const chosen = []
  while (chosen.length < n && candidates.length) {
    const s = weightedPick(candidates, weightOf, rng)
    chosen.push(s)
    candidates = candidates.filter(x => x !== s)
  }
  return chosen
}

function adjustTier (tier, recent) {
  if (recent.length < RECENT_CAP) return { tier, recent }
  const okCount = recent.filter(Boolean).length
  if (okCount >= 9) return { tier: Math.min(tier + 1, TIERS.length - 1), recent: [] }
  if (okCount < 6) return { tier: Math.max(tier - 1, 0), recent: [] }
  return { tier, recent }
}

// 每題只記第一次點的結果。picked 是她點的符號；drill 是這題若為加練題的混淆對 key。
export function recordAnswer (state, { target, ok, picked, ms, drill = null }) {
  const oldHistory = (state.mastery[target] && state.mastery[target].history) || []
  const history = [...oldHistory, { ok, ms }].slice(-HISTORY_CAP)
  const mastery = { ...state.mastery, [target]: { history } }

  const confusions = { ...state.confusions }
  if (!ok && picked && picked !== target) {
    confusions[pairKey(target, picked)] = { streak: 0 }
  }
  if (drill && confusions[drill]) {
    if (!ok) {
      confusions[drill] = { streak: 0 }
    } else {
      const streak = confusions[drill].streak + 1
      if (streak >= DRILL_CLEAR_STREAK) delete confusions[drill]
      else confusions[drill] = { streak }
    }
  }

  const { tier, recent } = adjustTier(state.tier, [...state.recent, ok].slice(-RECENT_CAP))
  return { ...state, mastery, confusions, tier, recent }
}
