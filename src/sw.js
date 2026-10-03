// 離線版（service worker）：第一次有網路打開時，把整個遊戲（網頁、錄音、圖）存進這台裝置，之後沒網路也打得開。
// 網頁本身：有網路就拿最新的（3 秒拿不到就用存著的），所以上版後有網路打開就是新版。
// 錄音和圖：用存著的；每個檔案帶自己的內容雜湊，換了哪個檔就只重抓那個，沒變的不會重抓。
// build.js 把下面兩個佔位字換成這次打包的版本和檔案清單，放到 dist/sw.js。

const SHELL_CACHE = 'zhuyin-shell-__SHELL_VERSION__'
const ASSET_CACHE = 'zhuyin-assets'
// { '相對路徑（已經過網址編碼）': '內容雜湊' }
const ASSET_HASH = __ASSETS__
const SHELL_FILES = ['index.html', 'manifest.webmanifest']
const BASE = new URL(self.registration.scope).pathname // 例如 /zhuyin-rescue/

const assetKey = path => BASE + path + '?sw=' + ASSET_HASH[path]

// 還沒存的錄音和圖補抓起來；一次抓 6 個，抓不到的（網路斷了）下次打開再補
async function topUp () {
  const cache = await caches.open(ASSET_CACHE)
  const have = new Set((await cache.keys()).map(r => { const u = new URL(r.url); return u.pathname + u.search }))
  const todo = Object.keys(ASSET_HASH).filter(p => !have.has(assetKey(p)))
  const worker = async () => {
    while (todo.length) {
      const p = todo.pop()
      try {
        const res = await fetch(BASE + p, { cache: 'no-cache' })
        if (res.ok) await cache.put(assetKey(p), res)
      } catch (err) { return } // 沒網路：剩下的下次再補
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE)
    await shell.addAll(SHELL_FILES.map(f => BASE + f))
    await topUp()
    await self.skipWaiting()
  })())
})

// 新版接手：丟掉舊版的網頁，錄音和圖只留這版清單上的
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('zhuyin-shell-') && name !== SHELL_CACHE) await caches.delete(name)
    }
    const cache = await caches.open(ASSET_CACHE)
    const keep = new Set(Object.keys(ASSET_HASH).map(assetKey))
    for (const req of await cache.keys()) {
      const u = new URL(req.url)
      if (!keep.has(u.pathname + u.search)) await cache.delete(req)
    }
    await self.clients.claim()
  })())
})

// 網頁：先問網路，3 秒沒回或沒網路就用存著的
async function shellFirstNetwork (req, file) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const res = await Promise.race([
      // 用網址抓，不要拿瀏覽器的請求加參數再轉送：打開網頁的請求（mode: navigate）加了參數，Chrome 會直接拒絕，
      // 結果每次都掉到下面用存著的舊版
      fetch(BASE + file, { cache: 'no-cache' }),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ])
    if (res.ok) { await cache.put(BASE + file, res.clone()); return res }
  } catch (err) { /* 沒網路或太慢：下面用存著的 */ }
  const hit = await cache.match(BASE + file)
  return hit || fetch(req)
}

// 錄音和圖：有存就用存的，沒有就上網抓並存起來
async function assetFromCache (req, path) {
  const cache = await caches.open(ASSET_CACHE)
  const hit = await cache.match(assetKey(path))
  if (hit) return hit
  const res = await fetch(BASE + path)
  if (res.ok) await cache.put(assetKey(path), res.clone())
  return res
}

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return
  const path = url.pathname.slice(BASE.length)
  if (path === '' || path === 'index.html') {
    e.respondWith(shellFirstNetwork(req, 'index.html'))
    e.waitUntil(topUp()) // 有網路打開時順便補齊上次沒抓完的
    return
  }
  if (path === 'manifest.webmanifest') { e.respondWith(shellFirstNetwork(req, path)); return }
  if (ASSET_HASH[path]) e.respondWith(assetFromCache(req, path))
})
