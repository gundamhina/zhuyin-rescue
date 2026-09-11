import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rasterize, normalizePoints, chamfer, coverage, bestMatch } from '../src/ink.js';

const SIZE = 64;

// 幾個假筆跡（600×600 畫布座標）
const vertical = [[[300, 100], [300, 500]]];
const horizontal = [[[100, 300], [500, 300]]];
const lShape = [[[150, 100], [150, 500], [450, 500]]];
const box = [[[150, 150], [450, 150], [450, 450], [150, 450], [150, 150]]];

function bitmapOf (strokes) {
  return rasterize(normalizePoints(strokes, SIZE, 6), SIZE, 3);
}

test('rasterize 會把筆跡畫成 0/1 小圖，畫過的地方是 1', () => {
  const bm = bitmapOf(vertical);
  assert.equal(bm.length, SIZE * SIZE);
  const on = bm.reduce((a, b) => a + b, 0);
  assert.ok(on > 50 && on < 600, `亮點數 ${on}`);
  assert.equal(bm[32 * SIZE + 32], 1, '正中間應該有墨');
  assert.equal(bm[2 * SIZE + 2], 0, '角落不該有墨');
});

test('normalizePoints 把筆跡放大置中：一條短線也會撐滿高度', () => {
  const small = [[[290, 290], [290, 310]]];
  const pts = normalizePoints(small, SIZE, 6).flat();
  const ys = pts.map(p => p[1]);
  assert.ok(Math.min(...ys) <= 7 && Math.max(...ys) >= SIZE - 8, `y 範圍 ${Math.min(...ys)}–${Math.max(...ys)}`);
});

test('chamfer：一樣的圖距離是 0，直線跟橫線距離很大', () => {
  const v = bitmapOf(vertical);
  const h = bitmapOf(horizontal);
  assert.equal(chamfer(v, v, SIZE), 0);
  assert.ok(chamfer(v, h, SIZE) > 5, `距離 ${chamfer(v, h, SIZE)}`);
});

test('bestMatch 在候選裡挑最像的：歪一點的直線還是認成直線', () => {
  const wobbly = [[[290, 110], [305, 250], [295, 400], [310, 490]]];
  const templates = { 直: bitmapOf(vertical), 橫: bitmapOf(horizontal), 角: bitmapOf(lShape), 框: bitmapOf(box) };
  const ranked = bestMatch(bitmapOf(wobbly), templates, SIZE);
  assert.equal(ranked[0].symbol, '直');
  assert.ok(ranked[0].score < ranked[1].score);
});

test('coverage：描寫時筆跡蓋到範本多少、有多少畫到範本外面', () => {
  const tpl = bitmapOf(lShape);
  const good = coverage(tpl, bitmapOf([[[160, 110], [150, 490], [440, 505]]]), SIZE, 3);
  assert.ok(good.covered > 0.7, `蓋到 ${good.covered}`);
  assert.ok(good.stray < 0.3, `畫出去 ${good.stray}`);
  const bad = coverage(tpl, bitmapOf(horizontal), SIZE, 3);
  assert.ok(bad.covered < 0.5, `亂畫也算蓋到 ${bad.covered}`);
});
