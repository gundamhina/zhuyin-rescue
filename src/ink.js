// 筆跡比對：把筆跡和範本都轉成同尺寸的 0/1 小圖，算兩張圖的距離。
// 純數學，不碰 DOM，可以在 node 測。用在「寫給狗狗看」的描寫判定與聽寫辨識。

// 把筆跡（多條折線）放大置中到 size×size 的座標系，長寬比不變，四邊留 margin。
export function normalizePoints (strokes, size, margin) {
  const pts = strokes.flat()
  if (!pts.length) return []
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of pts) {
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
  }
  const w = Math.max(maxX - minX, 1)
  const h = Math.max(maxY - minY, 1)
  const scale = (size - margin * 2) / Math.max(w, h)
  const ox = (size - w * scale) / 2
  const oy = (size - h * scale) / 2
  return strokes.map(stroke => stroke.map(([x, y]) => [(x - minX) * scale + ox, (y - minY) * scale + oy]))
}

// 把折線畫成 size×size 的 0/1 圖，線寬 width。
export function rasterize (strokes, size, width) {
  const bm = new Uint8Array(size * size)
  const r = width / 2
  const stamp = (x, y) => {
    const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(size - 1, Math.ceil(x + r))
    const y0 = Math.max(0, Math.floor(y - r)), y1 = Math.min(size - 1, Math.ceil(y + r))
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        if ((px - x) * (px - x) + (py - y) * (py - y) <= r * r) bm[py * size + px] = 1
      }
    }
  }
  for (const stroke of strokes) {
    if (stroke.length === 1) { stamp(stroke[0][0], stroke[0][1]); continue }
    for (let i = 1; i < stroke.length; i++) {
      const [ax, ay] = stroke[i - 1]
      const [bx, by] = stroke[i]
      const len = Math.hypot(bx - ax, by - ay)
      const steps = Math.max(1, Math.ceil(len / 0.5))
      for (let k = 0; k <= steps; k++) {
        const t = k / steps
        stamp(ax + (bx - ax) * t, ay + (by - ay) * t)
      }
    }
  }
  return bm
}

// 每個像素到最近墨點的距離（兩趟掃描的近似距離轉換）
function distanceField (bm, size) {
  const INF = size * 2
  const d = new Float32Array(size * size)
  for (let i = 0; i < d.length; i++) d[i] = bm[i] ? 0 : INF
  const at = (x, y) => d[y * size + x]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = at(x, y)
      if (x > 0) v = Math.min(v, at(x - 1, y) + 1)
      if (y > 0) v = Math.min(v, at(x, y - 1) + 1)
      if (x > 0 && y > 0) v = Math.min(v, at(x - 1, y - 1) + 1.414)
      if (x < size - 1 && y > 0) v = Math.min(v, at(x + 1, y - 1) + 1.414)
      d[y * size + x] = v
    }
  }
  for (let y = size - 1; y >= 0; y--) {
    for (let x = size - 1; x >= 0; x--) {
      let v = at(x, y)
      if (x < size - 1) v = Math.min(v, at(x + 1, y) + 1)
      if (y < size - 1) v = Math.min(v, at(x, y + 1) + 1)
      if (x < size - 1 && y < size - 1) v = Math.min(v, at(x + 1, y + 1) + 1.414)
      if (x > 0 && y < size - 1) v = Math.min(v, at(x - 1, y + 1) + 1.414)
      d[y * size + x] = v
    }
  }
  return d
}

function meanDistance (from, toField) {
  let sum = 0, n = 0
  for (let i = 0; i < from.length; i++) {
    if (from[i]) { sum += toField[i]; n++ }
  }
  return n ? sum / n : Infinity
}

// 對稱的 chamfer 距離：a 的墨到 b 的平均距離，加 b 的墨到 a 的平均距離。越小越像。
export function chamfer (a, b, size) {
  const da = distanceField(a, size)
  const db = distanceField(b, size)
  return meanDistance(a, db) + meanDistance(b, da)
}

// 描寫判定：範本被蓋到的比例（筆跡在 tol 像素內就算蓋到），以及筆跡畫到範本外的比例。
export function coverage (template, drawing, size, tol) {
  const dDraw = distanceField(drawing, size)
  const dTpl = distanceField(template, size)
  let tplN = 0, covered = 0, drawN = 0, stray = 0
  for (let i = 0; i < size * size; i++) {
    if (template[i]) { tplN++; if (dDraw[i] <= tol) covered++ }
    if (drawing[i]) { drawN++; if (dTpl[i] > tol * 2) stray++ }
  }
  return { covered: tplN ? covered / tplN : 0, stray: drawN ? stray / drawN : 1 }
}

// 在候選範本裡找最像的，回傳依分數排序的 [{ symbol, score }]
export function bestMatch (drawing, templates, size) {
  return Object.entries(templates)
    .map(([symbol, bm]) => ({ symbol, score: chamfer(drawing, bm, size) }))
    .sort((a, b) => a.score - b.score)
}
