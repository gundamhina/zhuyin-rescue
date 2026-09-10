import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYMBOLS, GROUPS, REP_CHAR, SIMILAR_SHAPE, SIMILAR_SOUND } from '../src/data.js';

test('有 37 個不重複的注音符號', () => {
  assert.equal(SYMBOLS.length, 37);
  assert.equal(new Set(SYMBOLS).size, 37);
});

test('十組分組合起來剛好是全部 37 個符號', () => {
  assert.equal(GROUPS.length, 10);
  const flat = GROUPS.flat();
  assert.equal(flat.length, 37);
  assert.deepEqual(new Set(flat), new Set(SYMBOLS));
});

test('前四組是韻符，第五組才開始聲符', () => {
  assert.deepEqual(GROUPS[0], ['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ']);
  assert.deepEqual(GROUPS[4], ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ']);
});

test('每個符號都有代表字', () => {
  for (const s of SYMBOLS) {
    assert.equal(typeof REP_CHAR[s], 'string', `${s} 沒有代表字`);
    assert.ok(REP_CHAR[s].length >= 1);
  }
});

test('形似、音似對的兩端都在符號表內', () => {
  for (const [a, b] of [...SIMILAR_SHAPE, ...SIMILAR_SOUND]) {
    assert.ok(SYMBOLS.includes(a), `${a} 不在表內`);
    assert.ok(SYMBOLS.includes(b), `${b} 不在表內`);
    assert.notEqual(a, b);
  }
});
