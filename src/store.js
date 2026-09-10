// 進度存取：多位使用者、每人一份進度、匯出匯入。storage 用參數傳進來，測試時換成假的。

import { createState } from './scheduler.js'

const PREFIX = 'zhuyin-rescue:'
const PROFILES_KEY = 'zhuyin-rescue-profiles'

function isValidState (s) {
  return s && typeof s === 'object' && s.version === 1 && s.mastery && s.confusions
}

function readJson (storage, key, fallback) {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (err) {
    return fallback
  }
}

export function createStore (storage) {
  function loadProfiles () {
    const p = readJson(storage, PROFILES_KEY, null)
    if (!p || !Array.isArray(p.list)) return { list: [], current: null }
    return { list: p.list, current: p.current || null }
  }
  function saveProfiles (p) {
    storage.setItem(PROFILES_KEY, JSON.stringify(p))
  }

  return {
    load (profileId) {
      const s = readJson(storage, PREFIX + profileId, null)
      return isValidState(s) ? s : createState()
    },
    save (profileId, state) {
      storage.setItem(PREFIX + profileId, JSON.stringify(state))
    },
    exportJson (state) {
      return JSON.stringify(state, null, 2)
    },
    importJson (text) {
      const s = JSON.parse(text)
      if (!isValidState(s)) throw new Error('不是注音救援隊的存檔')
      return s
    },

    loadProfiles,
    addProfile ({ name, color }) {
      const p = loadProfiles()
      const profile = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, color }
      p.list.push(profile)
      p.current = profile.id
      saveProfiles(p)
      return profile
    },
    setCurrent (id) {
      const p = loadProfiles()
      p.current = id
      saveProfiles(p)
    },
    removeProfile (id) {
      const p = loadProfiles()
      p.list = p.list.filter(x => x.id !== id)
      if (p.current === id) p.current = p.list.length ? p.list[0].id : null
      saveProfiles(p)
      storage.removeItem(PREFIX + id)
    },
  }
}
