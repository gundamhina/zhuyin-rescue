// 把 src/ 合成一個 dist/index.html。
// 做法：依相依順序串接各模組，拿掉 import 行和 export 關鍵字，全部放進同一個 script 範圍。
// 前提：各模組頂層名稱不能撞。

import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const ORDER = ['syllables.js', 'data.js', 'scheduler.js', 'store.js', 'audio.js', 'art.js', 'fishing.js', 'whack.js', 'memory.js', 'speak.js', 'ink.js', 'write.js', 'matchline.js', 'fillblank.js', 'ui.js', 'check.js', 'main.js']

function strip (src, name) {
  return `// ===== ${name} =====\n` + src
    .replace(/^import\s[^\n]*\n/gm, '')
    .replace(/^export\s*\{[^\n]*\}[^\n]*\n/gm, '') // 轉出口（export { X }）在單一範圍裡不需要
    .replace(/^export\s+(const|let|function|async function)\s/gm, '$1 ')
}

const js = ORDER.map(f => strip(readFileSync(join(root, 'src', f), 'utf8'), f)).join('\n')
// 合成後全部在同一個範圍，模組之間頂層名稱撞到會直接是語法錯誤，先在這裡抓出來
try {
  new Function(js) // eslint-disable-line no-new-func
} catch (err) {
  console.error('合成後的 JS 有語法錯誤：', err.message)
  process.exit(1)
}
const css = readFileSync(join(root, 'src', 'style.css'), 'utf8')
const html = readFileSync(join(root, 'src', 'index.html'), 'utf8')
  .replace('/*__CSS__*/', () => css)
  .replace('/*__JS__*/', () => js)

mkdirSync(join(root, 'dist'), { recursive: true })
writeFileSync(join(root, 'dist', 'index.html'), html)
console.log('dist/index.html', (html.length / 1024).toFixed(0) + ' KB')

// 錄音檔：audio/ 底下的 mp3、wav 一起複製到 dist/audio/
const audioDir = join(root, 'audio')
if (existsSync(audioDir)) {
  mkdirSync(join(root, 'dist', 'audio'), { recursive: true })
  const files = readdirSync(audioDir).filter(f => /\.(mp3|wav)$/i.test(f))
  for (const f of files) copyFileSync(join(audioDir, f), join(root, 'dist', 'audio', f))
  console.log('dist/audio/', files.length, 'files')
}

// 圖片檔：img/ 底下的 png、jpg、webp 一起複製到 dist/img/
const imgDir = join(root, 'img')
if (existsSync(imgDir)) {
  mkdirSync(join(root, 'dist', 'img'), { recursive: true })
  const files = readdirSync(imgDir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
  for (const f of files) copyFileSync(join(imgDir, f), join(root, 'dist', 'img', f))
  console.log('dist/img/', files.length, 'files')
}
