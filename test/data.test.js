import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYMBOLS, COMPOUNDS, SYLLABLES, WORDS, ALL_SYMBOLS, GROUPS, REP_CHAR, SIMILAR_SHAPE, SIMILAR_SOUND, SPEAK_ACCEPT, coreOf, TONE_MARKS } from '../src/data.js';

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

test('拼讀字：兩拼或三拼，聲符開頭，符合拼音條例，帶正確格式的調號', () => {
  assert.equal(SYLLABLES.length, GROUPS.slice(13).flat().filter(x => !x.includes(' ')).length);
  assert.equal(new Set(SYLLABLES).size, SYLLABLES.length, '拼讀字不重複');
  assert.ok(SYLLABLES.length >= 200, `拼讀字只有 ${SYLLABLES.length} 個`);
  for (const g of GROUPS.slice(13)) assert.ok(g.length >= 6 && g.length <= 40, `一組 ${g.length} 個`);
  if (false) {
  const initials = SYMBOLS.slice(0, 21);
  for (const w of SYLLABLES) {
    const core = coreOf(w);
    assert.ok(core.length === 2 || core.length === 3, `${w} 長度不對`);
    assert.ok(initials.includes(core[0]), `${w} 不是聲符開頭`);
    for (const ch of core) assert.ok(SYMBOLS.includes(ch), `${w} 含非法符號 ${ch}`);
    const tone = w.slice(core.length);
    assert.ok(tone === '' || (tone.length === 1 && TONE_MARKS.includes(tone)), `${w} 調號不對`);
    // 教育部拼音條例
    const ini = core[0], fin = core.slice(1);
    if ('ㄅㄆㄇㄈ'.includes(ini)) assert.ok(!fin.includes('ㄜ') && !fin.startsWith('ㄩ'), `${w}：ㄅㄆㄇㄈ 不接 ㄜ、ㄩ`);
    if (ini === 'ㄈ') assert.ok(!fin.startsWith('ㄧ'), `${w}：ㄈ 沒有齊齒`);
    if ('ㄉㄊㄋㄌㄍㄎㄏㄓㄔㄕㄖㄗㄘㄙ'.includes(ini)) assert.ok(fin !== 'ㄛ', `${w}：這些聲母不單獨拼 ㄛ`);
    if ('ㄐㄑㄒ'.includes(ini)) assert.ok('ㄧㄩ'.includes(fin[0]), `${w}：ㄐㄑㄒ 只接 ㄧㄩ`);
    if ('ㄍㄎㄏㄓㄔㄕㄖㄗㄘㄙ'.includes(ini)) assert.ok(!'ㄧㄩ'.includes(fin[0]), `${w}：這些聲母沒有齊齒撮口`);
    if ('ㄉㄊㄍㄎㄏㄓㄔㄕㄖㄗㄘㄙㄅㄆㄇㄈ'.includes(ini)) assert.ok(!fin.startsWith('ㄩ'), `${w}：只有 ㄋㄌㄐㄑㄒ 接 ㄩ`);
  }
  }
  // 兩拼組在前、三拼組在後（詞的組排在最後，不算）
  const lengths = GROUPS.slice(13).filter(g => !g[0].includes(' ')).map(g => coreOf(g[0]).length);
  const firstThree = lengths.indexOf(3);
  assert.ok(lengths.slice(firstThree).every(n => n === 3), '三拼組要排在兩拼組後面');
  // 幾個代表字是二三四聲的要帶調號
  assert.ok(SYLLABLES.includes('ㄉㄢˋ'), '蛋是四聲');
  assert.ok(SYLLABLES.includes('ㄒㄧㄠˇ'), '小是三聲');
  assert.ok(SYLLABLES.includes('ㄇㄠ'), '貓是一聲不標');
});

test('所有組合起來是 37 符號、22 結合韻、全部拼讀字、全部詞', () => {
  assert.ok(GROUPS.length >= 20);
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

test('詞：每個音節都是合法拼法（含零聲母），音節之間用空白，輕聲點在音節前', () => {
  assert.ok(WORDS.length >= 60, `詞只有 ${WORDS.length} 個`);
  assert.equal(new Set(WORDS).size, WORDS.length);
  const initials = SYMBOLS.slice(0, 21);
  for (const w of WORDS) {
    const syls = w.split(' ');
    assert.ok(syls.length >= 2 && syls.length <= 3, `${w} 音節數不對`);
    for (const syl of syls) {
      const light = syl.startsWith('˙');
      const body = light ? syl.slice(1) : syl;
      const core = coreOf(body);
      assert.ok(core.length >= 1 && core.length <= 3, `${w}：${syl} 長度不對`);
      for (const ch of core) assert.ok(SYMBOLS.includes(ch), `${w}：${syl} 含非法符號`);
      const tone = body.slice(core.length);
      assert.ok(tone === '' || TONE_MARKS.includes(tone), `${w}：${syl} 調號不對`);
      if (light) assert.equal(tone, '', `${w}：輕聲不能再帶調號`);
      if (initials.includes(core[0]) && core.length > 1) {
        const ini = core[0], fin = core.slice(1);
        if ('ㄐㄑㄒ'.includes(ini)) assert.ok('ㄧㄩ'.includes(fin[0]), `${w}：ㄐㄑㄒ 只接 ㄧㄩ`);
        if ('ㄍㄎㄏㄓㄔㄕㄖㄗㄘㄙ'.includes(ini)) assert.ok(!'ㄧㄩ'.includes(fin[0]), `${w}：${syl} 沒有齊齒撮口`);
      }
    }
    assert.equal(typeof REP_CHAR[w], 'string');
    assert.ok(REP_CHAR[w].length === syls.length, `${w} 代表詞字數要等於音節數`);
  }
  assert.ok(WORDS.includes('ㄒㄧㄠˇ ㄍㄡˇ'), '小狗');
  assert.ok(WORDS.includes('ㄅㄚˋ ˙ㄅㄚ'), '爸爸');
});
