import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYMBOLS, COMPOUNDS, SYLLABLES, ALL_SYMBOLS, GROUPS, REP_CHAR, SIMILAR_SHAPE, SIMILAR_SOUND, SPEAK_ACCEPT } from '../src/data.js';

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
});

test('拼讀字：六組各 8 到 12 個，兩拼或三拼，每個部件都是合法符號，聲符開頭', () => {
  assert.equal(SYLLABLES.length, GROUPS.slice(13).flat().length);
  assert.equal(new Set(SYLLABLES).size, SYLLABLES.length, '拼讀字不重複');
  for (const g of GROUPS.slice(13)) assert.ok(g.length >= 8 && g.length <= 12, `一組 ${g.length} 個`);
  const initials = SYMBOLS.slice(0, 21);
  for (const w of SYLLABLES) {
    assert.ok(w.length === 2 || w.length === 3, `${w} 長度不對`);
    assert.ok(initials.includes(w[0]), `${w} 不是聲符開頭`);
    for (const ch of w) assert.ok(SYMBOLS.includes(ch), `${w} 含非法符號 ${ch}`);
  }
  // 前四組兩拼、後兩組三拼
  for (const w of GROUPS.slice(13, 17).flat()) assert.equal(w.length, 2, `${w} 應為兩拼`);
  for (const w of GROUPS.slice(17).flat()) assert.equal(w.length, 3, `${w} 應為三拼`);
});

test('十九組合起來是 37 符號、22 結合韻、全部拼讀字', () => {
  assert.equal(GROUPS.length, 19);
  const flat = GROUPS.flat();
  assert.equal(flat.length, ALL_SYMBOLS.length);
  assert.deepEqual(new Set(flat), new Set(ALL_SYMBOLS));
  assert.deepEqual(new Set(GROUPS.slice(0, 10).flat()), new Set(SYMBOLS), '前十組還是原本的 37 個');
  assert.deepEqual(new Set(GROUPS.slice(10, 13).flat()), new Set(COMPOUNDS), '11–13 組是結合韻');
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
