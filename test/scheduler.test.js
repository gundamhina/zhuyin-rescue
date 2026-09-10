import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createState, stars, activePool, buildRound, recordAnswer, resetProgress, pickSymbols, TIERS,
} from '../src/scheduler.js';
import { GROUPS } from '../src/data.js';

// 固定亂數，讓測試可重現
function seededRng(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function answerN(state, symbol, ok, n) {
  for (let i = 0; i < n; i++) {
    state = recordAnswer(state, { target: symbol, ok, picked: ok ? symbol : null, ms: 1000 });
  }
  return state;
}

test('新狀態：沒練過的符號 0 星，第一組解鎖', () => {
  const s = createState();
  assert.equal(stars(s, 'ㄚ'), 0);
  assert.deepEqual(activePool(s), GROUPS[0]);
  assert.equal(s.tier, 0);
});

test('家長勾「已經認得」的符號從 3 星起跳並進入出題池', () => {
  const s = createState({ known: ['ㄅ', 'ㄆ'] });
  assert.equal(stars(s, 'ㄅ'), 3);
  assert.ok(activePool(s).includes('ㄅ'));
  assert.ok(activePool(s).includes('ㄚ'));
});

test('答對率換成星星：最近 10 次全對 5 星、一半對 2 或 3 星', () => {
  let s = createState();
  s = answerN(s, 'ㄚ', true, 10);
  assert.equal(stars(s, 'ㄚ'), 5);
  let t = createState();
  t = answerN(t, 'ㄛ', true, 5);
  t = answerN(t, 'ㄛ', false, 5);
  assert.ok(stars(t, 'ㄛ') >= 2 && stars(t, 'ㄛ') <= 3);
});

test('只看最近 10 次：早期答錯練回來後會被洗掉', () => {
  let s = createState();
  s = answerN(s, 'ㄚ', false, 10);
  s = answerN(s, 'ㄚ', true, 10);
  assert.equal(stars(s, 'ㄚ'), 5);
});

test('第一組平均 4 星以上就解鎖第二組', () => {
  let s = createState();
  for (const sym of GROUPS[0]) s = answerN(s, sym, true, 10);
  const pool = activePool(s);
  for (const sym of GROUPS[1]) assert.ok(pool.includes(sym), `${sym} 應解鎖`);
  assert.ok(!pool.includes(GROUPS[2][0]), '第三組不該解鎖');
});

test('一局 5 題，每題有目標、選項含目標、選項數符合階級', () => {
  const s = createState();
  const round = buildRound(s, seededRng());
  assert.equal(round.length, 5);
  for (const q of round) {
    assert.ok(q.options.includes(q.target));
    assert.equal(q.options.length, TIERS[0].options);
    assert.equal(new Set(q.options).size, q.options.length);
  }
});

test('弱符號出現率高於強符號', () => {
  let s = createState();
  // 第一組四個：ㄚ 練到 5 星，ㄛ 完全沒練
  s = answerN(s, 'ㄚ', true, 10);
  s = answerN(s, 'ㄜ', true, 10);
  s = answerN(s, 'ㄝ', true, 10);
  const rng = seededRng(7);
  let weak = 0, strong = 0;
  for (let i = 0; i < 200; i++) {
    for (const q of buildRound(s, rng)) {
      if (q.target === 'ㄛ') weak++;
      if (q.target === 'ㄚ') strong++;
    }
  }
  assert.ok(weak > strong * 2, `弱 ${weak} 應遠多於強 ${strong}`);
});

test('每局至少 2 題來自最弱的三個符號', () => {
  let s = createState();
  for (const sym of GROUPS[0]) s = answerN(s, sym, true, 10);
  // 解鎖第二組後，第二組三個是最弱的
  const rng = seededRng(3);
  for (let i = 0; i < 50; i++) {
    const round = buildRound(s, rng);
    const fromWeak = round.filter(q => GROUPS[1].includes(q.target)).length;
    assert.ok(fromWeak >= 2, `第 ${i} 局只有 ${fromWeak} 題來自弱符號`);
  }
});

test('答錯會記下混淆對，之後出現該對的二選一題', () => {
  let s = createState();
  s = recordAnswer(s, { target: 'ㄚ', ok: false, picked: 'ㄛ', ms: 1500 });
  assert.ok(s.confusions['ㄚ|ㄛ'], '應記錄 ㄚ|ㄛ');
  const rng = seededRng(5);
  let found = false;
  for (let i = 0; i < 20 && !found; i++) {
    for (const q of buildRound(s, rng)) {
      if (q.drill && q.options.length === 2 &&
          q.options.includes('ㄚ') && q.options.includes('ㄛ')) found = true;
    }
  }
  assert.ok(found, '應出現 ㄚ/ㄛ 的二選一加練題');
});

test('混淆對連對 3 次後移除', () => {
  let s = createState();
  s = recordAnswer(s, { target: 'ㄚ', ok: false, picked: 'ㄛ', ms: 1500 });
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 900, drill: 'ㄚ|ㄛ' });
  s = recordAnswer(s, { target: 'ㄛ', ok: true, picked: 'ㄛ', ms: 900, drill: 'ㄚ|ㄛ' });
  assert.ok(s.confusions['ㄚ|ㄛ'], '兩次還不能移除');
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 900, drill: 'ㄚ|ㄛ' });
  assert.equal(s.confusions['ㄚ|ㄛ'], undefined);
});

test('混淆對加練時再答錯，連對次數歸零', () => {
  let s = createState();
  s = recordAnswer(s, { target: 'ㄚ', ok: false, picked: 'ㄛ', ms: 1500 });
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 900, drill: 'ㄚ|ㄛ' });
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 900, drill: 'ㄚ|ㄛ' });
  s = recordAnswer(s, { target: 'ㄚ', ok: false, picked: 'ㄛ', ms: 900, drill: 'ㄚ|ㄛ' });
  assert.equal(s.confusions['ㄚ|ㄛ'].streak, 0);
});

test('最近 10 題答對 9 題以上升一階，低於 6 題降一階', () => {
  let s = createState();
  s = answerN(s, 'ㄚ', true, 10);
  assert.equal(s.tier, 1);
  // 升階後重新計算，再錯 10 題就降回去
  s = answerN(s, 'ㄛ', false, 10);
  assert.equal(s.tier, 0);
});

test('階級不會低於 0 或高於最高階', () => {
  let s = createState();
  s = answerN(s, 'ㄚ', false, 30);
  assert.equal(s.tier, 0);
  let t = createState();
  t = answerN(t, 'ㄚ', true, 200);
  assert.equal(t.tier, TIERS.length - 1);
});

test('形似階級的干擾項優先挑長得像的', () => {
  let s = createState({ known: ['ㄅ', 'ㄆ', 'ㄉ', 'ㄊ'] });
  s = { ...s, tier: 2 }; // 形似階
  const rng = seededRng(9);
  const partner = { ㄅ: 'ㄆ', ㄆ: 'ㄅ', ㄉ: 'ㄊ', ㄊ: 'ㄉ' };
  let similarHits = 0, total = 0;
  for (let i = 0; i < 100; i++) {
    for (const q of buildRound(s, rng)) {
      if (q.drill || !partner[q.target]) continue;
      total++;
      if (q.options.includes(partner[q.target])) similarHits++;
    }
  }
  // 目標是 ㄅㄆㄉㄊ 之一時，選項幾乎都該帶上它的形似對
  assert.ok(total > 20, `樣本太少 ${total}`);
  assert.ok(similarHits / total > 0.8, `形似命中率 ${similarHits}/${total}`);
});

test('選項數超過池子大小時，選項數縮到池子大小', () => {
  let s = createState();
  s = { ...s, tier: TIERS.length - 1 }; // 6 選項，但第一組只有 4 個
  for (const q of buildRound(s, seededRng())) {
    if (q.drill) continue;
    assert.equal(q.options.length, 4);
  }
});

test('鎖定難度階級後，出題用鎖定的階級，自動升降照常記錄但不影響出題', () => {
  let s = createState();
  s = { ...s, lockTier: 3 };
  for (const q of buildRound(s, seededRng())) {
    if (q.drill) continue;
    assert.equal(q.options.length, Math.min(TIERS[3].options, GROUPS[0].length));
    assert.equal(q.hint, TIERS[3].hint);
  }
  s = answerN(s, 'ㄚ', true, 10);
  assert.equal(s.tier, 1, '背景的自動階級照常升');
  assert.equal(s.lockTier, 3, '鎖定值不變');
});

test('指定練習範圍後，出題池就是那幾組，不管解鎖與認得', () => {
  let s = createState({ known: ['ㄅ'] });
  s = { ...s, rangeGroups: [1, 2] };
  const pool = activePool(s);
  assert.deepEqual(new Set(pool), new Set([...GROUPS[1], ...GROUPS[2]]));
  for (const q of buildRound(s, seededRng())) {
    assert.ok(pool.includes(q.target), `${q.target} 不在範圍內`);
  }
});

test('範圍設為空或 null 時回到自動解鎖', () => {
  const s = { ...createState(), rangeGroups: [] };
  assert.deepEqual(activePool(s), GROUPS[0]);
});

test('清除練習紀錄：星星、混淆對、階級歸零，認得與難度設定保留', () => {
  let s = createState({ known: ['ㄅ'] });
  s = { ...s, lockTier: 2, rangeGroups: [4] };
  s = answerN(s, 'ㄚ', true, 10);
  s = recordAnswer(s, { target: 'ㄛ', ok: false, picked: 'ㄜ', ms: 900 });
  const r = resetProgress(s);
  assert.deepEqual(r.mastery, {});
  assert.deepEqual(r.confusions, {});
  assert.equal(r.tier, 0);
  assert.deepEqual(r.recent, []);
  assert.deepEqual(r.known, ['ㄅ']);
  assert.equal(r.lockTier, 2);
  assert.deepEqual(r.rangeGroups, [4]);
  assert.equal(stars(r, 'ㄚ'), 0);
});

test('手動跳級：指定已解鎖到第 N 組，前 N 組都進出題池，之後自動解鎖照常', () => {
  let s = { ...createState(), unlockedUpTo: 3 };
  const pool = activePool(s);
  for (const g of GROUPS.slice(0, 3)) for (const sym of g) assert.ok(pool.includes(sym), `${sym} 應解鎖`);
  assert.ok(!pool.includes(GROUPS[3][0]), '第四組不該解鎖');
  // 前三組全練熟，第四組就自動解鎖
  for (const g of GROUPS.slice(0, 3)) for (const sym of g) s = answerN(s, sym, true, 10);
  assert.ok(activePool(s).includes(GROUPS[3][0]));
});

test('跳級不會縮小自動解鎖的範圍', () => {
  let s = createState();
  for (const sym of GROUPS[0]) s = answerN(s, sym, true, 10);
  s = { ...s, unlockedUpTo: 1 };
  assert.ok(activePool(s).includes(GROUPS[1][0]), '自動已解鎖的第二組要保留');
});

test('翻牌用的符號：從出題池挑不重複的 n 個，池子不夠就給全部', () => {
  const s = createState();
  const picked = pickSymbols(s, seededRng(), 5);
  assert.equal(picked.length, 4, '第一組只有 4 個');
  assert.equal(new Set(picked).size, picked.length);
  for (const sym of picked) assert.ok(GROUPS[0].includes(sym));
});

test('翻牌選符號時弱的比強的常被挑到', () => {
  let s = createState({ known: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'] }); // 池子 8 個
  for (const sym of ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ']) s = answerN(s, sym, true, 10); // 這四個 5 星
  const rng = seededRng(11);
  let weak = 0, strong = 0;
  for (let i = 0; i < 200; i++) {
    for (const sym of pickSymbols(s, rng, 3)) {
      if (GROUPS[0].includes(sym)) weak++; else strong++;
    }
  }
  assert.ok(weak > strong * 2, `弱 ${weak} 強 ${strong}`);
});
