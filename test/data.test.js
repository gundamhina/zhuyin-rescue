import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYMBOLS, COMPOUNDS, ALL_SYMBOLS, GROUPS, REP_CHAR, SIMILAR_SHAPE, SIMILAR_SOUND, SPEAK_ACCEPT } from '../src/data.js';

test('有 37 個不重複的注音符號', () => {
  assert.equal(SYMBOLS.length, 37);
  assert.equal(new Set(SYMBOLS).size, 37);
});

test('22 個結合韻，每個都是兩個符號、以 ㄧㄨㄩ 開頭', () => {
  assert.equal(COMPOUNDS.length, 22);
  assert.equal(new Set(COMPOUNDS).size, 22);
  for (const c of COMPOUNDS) {
    assert.equal(c.length, 2);
    assert.ok('ㄧㄨㄩ'.includes(c[0]), `${c} 開頭不是介音`);
    assert.ok(SYMBOLS.includes(c[1]));
  }
  assert.equal(ALL_SYMBOLS.length, 59);
});

test('十三組分組合起來剛好是 37 個符號加 22 個結合韻', () => {
  assert.equal(GROUPS.length, 13);
  const flat = GROUPS.flat();
  assert.equal(flat.length, 59);
  assert.deepEqual(new Set(flat), new Set(ALL_SYMBOLS));
  assert.deepEqual(new Set(GROUPS.slice(0, 10).flat()), new Set(SYMBOLS), '前十組還是原本的 37 個');
});

test('前四組是韻符，第五組才開始聲符', () => {
  assert.deepEqual(GROUPS[0], ['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ']);
  assert.deepEqual(GROUPS[4], ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ']);
});

test('每個符號和結合韻都有代表字', () => {
  for (const s of ALL_SYMBOLS) {
    assert.equal(typeof REP_CHAR[s], 'string', `${s} 沒有代表字`);
    assert.ok(REP_CHAR[s].length >= 1);
  }
});

test('形似、音似對的兩端都在符號表內', () => {
  for (const [a, b] of [...SIMILAR_SHAPE, ...SIMILAR_SOUND]) {
    assert.ok(ALL_SYMBOLS.includes(a), `${a} 不在表內`);
    assert.ok(ALL_SYMBOLS.includes(b), `${b} 不在表內`);
    assert.notEqual(a, b);
  }
});

test('每個符號和結合韻都有一組「唸對」可接受的同音字', () => {
  for (const s of ALL_SYMBOLS) {
    assert.equal(typeof SPEAK_ACCEPT[s], 'string', `${s} 沒有同音字表`);
    assert.ok(SPEAK_ACCEPT[s].length >= 1, `${s} 同音字表是空的`);
  }
});
