import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createState, stars, activePool, buildRound, recordAnswer, resetProgress, pickSymbols, singleSymbolState, noWordsState, wordsOnlyState, trackView, applyTrack, effectiveTier, lifetimeStats, dailyStats, TIERS,
  addBones, buyItem, wearItem, withWallet,
} from '../src/scheduler.js';
import { GROUPS, coreOf } from '../src/data.js';

// 固定亂數，讓測試可重現
function seededRng(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const view = (opts) => trackView(createState(opts), 'listen');

function answerN(state, symbol, ok, n) {
  for (let i = 0; i < n; i++) {
    state = recordAnswer(state, { target: symbol, ok, picked: ok ? symbol : null, ms: 1000 });
  }
  return state;
}

test('新狀態：沒練過的符號 0 星，第一組解鎖', () => {
  const s = view();
  assert.equal(stars(s, 'ㄚ'), 0);
  assert.deepEqual(activePool(s), GROUPS[0]);
  assert.equal(s.tier, 0);
});

test('家長勾「已經認得」的符號從 3 星起跳並進入出題池', () => {
  const s = view({ known: ['ㄅ', 'ㄆ'] });
  assert.equal(stars(s, 'ㄅ'), 3);
  assert.ok(activePool(s).includes('ㄅ'));
  assert.ok(activePool(s).includes('ㄚ'));
});

test('答對率換成星星：最近 10 次全對 5 星、一半對 2 或 3 星', () => {
  let s = view();
  s = answerN(s, 'ㄚ', true, 10);
  assert.equal(stars(s, 'ㄚ'), 5);
  let t = view();
  t = answerN(t, 'ㄛ', true, 5);
  t = answerN(t, 'ㄛ', false, 5);
  assert.ok(stars(t, 'ㄛ') >= 2 && stars(t, 'ㄛ') <= 3);
});

test('只看最近 10 次：早期答錯練回來後會被洗掉', () => {
  let s = view();
  s = answerN(s, 'ㄚ', false, 10);
  s = answerN(s, 'ㄚ', true, 10);
  assert.equal(stars(s, 'ㄚ'), 5);
});

test('第一組平均 4 星以上就解鎖第二組', () => {
  let s = view();
  for (const sym of GROUPS[0]) s = answerN(s, sym, true, 10);
  const pool = activePool(s);
  for (const sym of GROUPS[1]) assert.ok(pool.includes(sym), `${sym} 應解鎖`);
  assert.ok(!pool.includes(GROUPS[2][0]), '第三組不該解鎖');
});

test('一局 5 題，每題有目標、選項含目標、選項數符合階級', () => {
  const s = view();
  const round = buildRound(s, seededRng());
  assert.equal(round.length, 5);
  for (const q of round) {
    assert.ok(q.options.includes(q.target));
    assert.equal(q.options.length, TIERS[0].options);
    assert.equal(new Set(q.options).size, q.options.length);
  }
});

test('弱符號出現率高於強符號', () => {
  let s = view();
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
  let s = view();
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
  let s = view();
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
  let s = view();
  s = recordAnswer(s, { target: 'ㄚ', ok: false, picked: 'ㄛ', ms: 1500 });
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 900, drill: 'ㄚ|ㄛ' });
  s = recordAnswer(s, { target: 'ㄛ', ok: true, picked: 'ㄛ', ms: 900, drill: 'ㄚ|ㄛ' });
  assert.ok(s.confusions['ㄚ|ㄛ'], '兩次還不能移除');
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 900, drill: 'ㄚ|ㄛ' });
  assert.equal(s.confusions['ㄚ|ㄛ'], undefined);
});

test('混淆對加練時再答錯，連對次數歸零', () => {
  let s = view();
  s = recordAnswer(s, { target: 'ㄚ', ok: false, picked: 'ㄛ', ms: 1500 });
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 900, drill: 'ㄚ|ㄛ' });
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 900, drill: 'ㄚ|ㄛ' });
  s = recordAnswer(s, { target: 'ㄚ', ok: false, picked: 'ㄛ', ms: 900, drill: 'ㄚ|ㄛ' });
  assert.equal(s.confusions['ㄚ|ㄛ'].streak, 0);
});

test('最近 10 題答對 9 題以上升一階，低於 6 題降一階', () => {
  let s = view();
  s = answerN(s, 'ㄚ', true, 10);
  assert.equal(s.tier, 1);
  // 升階後重新計算，再錯 10 題就降回去
  s = answerN(s, 'ㄛ', false, 10);
  assert.equal(s.tier, 0);
});

test('階級不會低於 0 或高於最高階', () => {
  let s = view();
  s = answerN(s, 'ㄚ', false, 30);
  assert.equal(s.tier, 0);
  let t = view();
  t = answerN(t, 'ㄚ', true, 200);
  assert.equal(t.tier, TIERS.length - 1);
});

test('形似階級的干擾項優先挑長得像的', () => {
  let s = view({ known: ['ㄅ', 'ㄆ', 'ㄉ', 'ㄊ'] });
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
  let s = view();
  s = { ...s, tier: TIERS.length - 1 }; // 6 選項，但第一組只有 4 個
  for (const q of buildRound(s, seededRng())) {
    if (q.drill) continue;
    assert.equal(q.options.length, 4);
  }
});

test('鎖定難度階級後，出題用鎖定的階級，自動升降照常記錄但不影響出題', () => {
  let s = view();
  s = { ...s, lockTier: 3 };
  for (const q of buildRound(s, seededRng())) {
    if (q.drill) continue;
    assert.equal(q.options.length, Math.min(TIERS[3].options, GROUPS[0].length));
    assert.equal(q.idleHint, TIERS[3].idleHint);
  }
  s = answerN(s, 'ㄚ', true, 10);
  assert.equal(s.tier, 1, '背景的自動階級照常升');
  assert.equal(s.lockTier, 3, '鎖定值不變');
});

test('指定練習範圍後，出題池就是那幾組，不管解鎖與認得', () => {
  let s = view({ known: ['ㄅ'] });
  s = { ...s, rangeGroups: [1, 2] };
  const pool = activePool(s);
  assert.deepEqual(new Set(pool), new Set([...GROUPS[1], ...GROUPS[2]]));
  for (const q of buildRound(s, seededRng())) {
    assert.ok(pool.includes(q.target), `${q.target} 不在範圍內`);
  }
});

test('範圍設為空或 null 時回到自動解鎖', () => {
  const s = { ...view(), rangeGroups: [] };
  assert.deepEqual(activePool(s), GROUPS[0]);
});

test('清除練習紀錄：星星、混淆對、階級歸零，認得與難度設定保留', () => {
  let s = view({ known: ['ㄅ'] });
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
  let s = { ...view(), unlockedUpTo: 3 };
  const pool = activePool(s);
  for (const g of GROUPS.slice(0, 3)) for (const sym of g) assert.ok(pool.includes(sym), `${sym} 應解鎖`);
  assert.ok(!pool.includes(GROUPS[3][0]), '第四組不該解鎖');
  // 前三組全練熟，第四組就自動解鎖
  for (const g of GROUPS.slice(0, 3)) for (const sym of g) s = answerN(s, sym, true, 10);
  assert.ok(activePool(s).includes(GROUPS[3][0]));
});

test('跳級不會縮小自動解鎖的範圍', () => {
  let s = view();
  for (const sym of GROUPS[0]) s = answerN(s, sym, true, 10);
  s = { ...s, unlockedUpTo: 1 };
  assert.ok(activePool(s).includes(GROUPS[1][0]), '自動已解鎖的第二組要保留');
});

test('翻牌用的符號：從出題池挑不重複的 n 個，池子不夠就給全部', () => {
  const s = view();
  const picked = pickSymbols(s, seededRng(), 5);
  assert.equal(picked.length, 4, '第一組只有 4 個');
  assert.equal(new Set(picked).size, picked.length);
  for (const sym of picked) assert.ok(GROUPS[0].includes(sym));
});

test('翻牌選符號時弱的比強的常被挑到', () => {
  let s = view({ known: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'] }); // 池子 8 個
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

test('只有最低兩階有發呆 10 秒提示，其他階級沒有任何提示', () => {
  for (const t of TIERS) assert.equal(typeof t.idleHint, 'number');
  assert.equal(TIERS[0].idleHint, 10);
  assert.equal(TIERS[1].idleHint, 10);
  for (const t of TIERS.slice(2)) assert.equal(t.idleHint, 0);
  for (const t of TIERS) assert.equal(t.wrongHint, undefined, '答錯不顯示答案，沒有這個設定');
});

test('拼讀字的干擾項優先挑只差一個符號的', () => {
  // 把範圍鎖在第 14 組（ㄅㄆㄇㄈ 兩拼），鎖形似階（3 選項）
  const s = { ...view(), rangeGroups: [13], lockTier: 2 };
  const rng = seededRng(21);
  let total = 0, close = 0;
  for (let i = 0; i < 60; i++) {
    for (const q of buildRound(s, rng)) {
      if (q.drill) continue;
      for (const o of q.options) {
        if (o === q.target) continue;
        total++;
        const oc = coreOf(o), tc = coreOf(q.target);
        const shared = [...oc].filter((ch, k) => tc[k] === ch).length;
        if (oc.length === tc.length && shared === oc.length - 1) close++;
      }
    }
  }
  assert.ok(total > 50, `樣本 ${total}`);
  assert.ok(close / total > 0.8, `只差一個符號的比例 ${close}/${total}`);
});

test('寫字用的狀態：只保留單一符號的組別（前十組裡已解鎖或指定範圍的）', () => {
  let s = view();
  s = { ...s, unlockedUpTo: 12 }; // 解鎖到結合韻
  const w = singleSymbolState(s);
  const pool = activePool(w);
  assert.ok(pool.length >= 37, `應包含前十組 ${pool.length}`);
  for (const sym of pool) assert.equal(sym.length, 1, `${sym} 不是單一符號`);
  // 家長把範圍指到拼讀組時，退回第一組
  const r = singleSymbolState({ ...view(), rangeGroups: [14, 15] });
  assert.deepEqual(activePool(r), GROUPS[0]);
  // 範圍含單一符號組就只留那些
  const m = singleSymbolState({ ...view(), rangeGroups: [4, 14] });
  assert.deepEqual(activePool(m), GROUPS[4]);
});

// ---- 聽、讀、寫三軌分開記 ----
test('新狀態有三軌，各自空的紀錄；共用的家長設定在外層', () => {
  const s = createState();
  assert.equal(s.version, 2);
  assert.deepEqual(Object.keys(s.tracks).sort(), ['listen', 'read', 'write']);
  for (const t of Object.values(s.tracks)) {
    assert.deepEqual(t.mastery, {});
    assert.deepEqual(t.confusions, {});
    assert.equal(t.tier, 0);
    assert.deepEqual(t.recent, []);
  }
  assert.deepEqual(s.known, []);
  assert.equal(s.lockTier, null);
});

test('trackView 取出一軌當舊格式用；applyTrack 寫回去，不動其他軌', () => {
  let s = createState();
  let listen = trackView(s, 'listen');
  listen = recordAnswer(listen, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 800 });
  s = applyTrack(s, 'listen', listen);
  assert.equal(stars(trackView(s, 'listen'), 'ㄚ'), 1);
  assert.equal(stars(trackView(s, 'read'), 'ㄚ'), 0, '讀那軌不受影響');
  assert.equal(stars(trackView(s, 'write'), 'ㄚ'), 0);
});

test('每軌各自升階、各自解鎖', () => {
  let s = createState();
  let w = trackView(s, 'write');
  for (const sym of GROUPS[0]) w = answerN(w, sym, true, 10);
  s = applyTrack(s, 'write', w);
  assert.ok(trackView(s, 'write').tier >= 1);
  assert.equal(trackView(s, 'listen').tier, 0);
  assert.ok(activePool(trackView(s, 'write')).includes(GROUPS[1][0]), '寫那軌解鎖第二組');
  assert.ok(!activePool(trackView(s, 'listen')).includes(GROUPS[1][0]), '聽那軌還沒');
});

test('家長設定（認得、鎖階、範圍、跳級）三軌共用', () => {
  const s = { ...createState({ known: ['ㄅ'] }), lockTier: 2, unlockedUpTo: 3 };
  for (const t of ['listen', 'read', 'write']) {
    const v = trackView(s, t);
    assert.equal(stars(v, 'ㄅ'), 3);
    assert.equal(effectiveTier(v), 2);
    assert.ok(activePool(v).includes(GROUPS[2][0]));
  }
});

test('清除練習紀錄清三軌，保留家長設定', () => {
  let s = { ...createState({ known: ['ㄅ'] }), lockTier: 1 };
  s = applyTrack(s, 'read', answerN(trackView(s, 'read'), 'ㄚ', true, 5));
  const r = resetProgress(s);
  assert.equal(stars(trackView(r, 'read'), 'ㄚ'), 0);
  assert.deepEqual(r.known, ['ㄅ']);
  assert.equal(r.lockTier, 1);
});

test('最低階也會常放形似或音似的干擾項（約六成），第三階起一定放', () => {
  const partnerOf = { ㄅ: ['ㄆ'], ㄆ: ['ㄅ'], ㄉ: ['ㄊ'], ㄊ: ['ㄉ'], ㄋ: ['ㄇ', 'ㄌ'], ㄌ: ['ㄋ'] };
  function rate (tier) {
    let s = { ...view({ known: ['ㄅ', 'ㄆ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ'] }), rangeGroups: [4, 5], lockTier: tier };
    const rng = seededRng(31);
    let hit = 0, total = 0;
    for (let i = 0; i < 120; i++) {
      for (const q of buildRound(s, rng)) {
        if (q.drill || !partnerOf[q.target]) continue;
        total++;
        if (partnerOf[q.target].some(p => q.options.includes(p))) hit++;
      }
    }
    return hit / total;
  }
  const low = rate(0);
  assert.ok(low > 0.45 && low < 0.8, `第 1 階命中率 ${low.toFixed(2)}`);
  assert.ok(rate(2) > 0.95, `第 3 階命中率 ${rate(2).toFixed(2)}`);
});

// ---- 長期紀錄 ----
test('每題都記一筆帶時間的日誌，星星仍只看最近 10 次', () => {
  let s = view();
  const t0 = Date.UTC(2026, 8, 1, 2, 0, 0);
  for (let i = 0; i < 15; i++) {
    s = recordAnswer(s, { target: 'ㄚ', ok: i >= 5, picked: 'ㄚ', ms: 800, at: t0 + i * 60000 });
  }
  assert.equal(s.log.length, 15);
  assert.deepEqual(s.log[0], { at: t0, s: 'ㄚ', ok: false });
  assert.equal(stars(s, 'ㄚ'), 5, '最近 10 次全對');
  const sum = lifetimeStats(s);
  assert.equal(sum.total, 15);
  assert.equal(sum.correct, 10);
  assert.equal(sum.bySymbol['ㄚ'].total, 15);
  assert.equal(sum.bySymbol['ㄚ'].correct, 10);
});

test('日誌最多留 3000 筆，最舊的先丟', () => {
  let s = view();
  for (let i = 0; i < 3005; i++) s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 1, at: i });
  assert.equal(s.log.length, 3000);
  assert.equal(s.log[0].at, 5);
});

test('按天統計最近 N 天（用本地日期），沒練的天數是 0', () => {
  let s = view();
  const day = 24 * 3600 * 1000;
  const now = new Date(2026, 8, 14, 20, 0, 0).getTime();
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 1, at: now - 2 * day });
  s = recordAnswer(s, { target: 'ㄛ', ok: false, picked: 'ㄜ', ms: 1, at: now - 2 * day + 1000 });
  s = recordAnswer(s, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 1, at: now });
  const days = dailyStats(s, 7, now);
  assert.equal(days.length, 7);
  assert.deepEqual(days[6], { date: '9/14', total: 1, correct: 1 });
  assert.deepEqual(days[4], { date: '9/12', total: 2, correct: 1 });
  assert.deepEqual(days[5], { date: '9/13', total: 0, correct: 0 });
});

test('三軌的日誌分開；舊存檔沒有 log 欄位也能用', () => {
  let s = createState();
  s = applyTrack(s, 'read', recordAnswer(trackView(s, 'read'), { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 1, at: 1 }));
  assert.equal(lifetimeStats(trackView(s, 'read')).total, 1);
  assert.equal(lifetimeStats(trackView(s, 'listen')).total, 0);
  const legacy = { ...trackView(createState(), 'listen') }; delete legacy.log;
  assert.equal(lifetimeStats(legacy).total, 0);
  assert.equal(recordAnswer(legacy, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 1, at: 1 }).log.length, 1);
});

test('詞的干擾項優先挑共用一個音節的，而且最多 4 個選項', () => {
  const wordGroup = GROUPS.findIndex(g => g[0].includes(' ') && g.includes('ㄒㄧㄠˇ ㄍㄡˇ'));
  assert.ok(wordGroup > 0, '要有含小狗的動物組');
  const s = { ...view(), rangeGroups: [wordGroup], lockTier: 5 };
  const rng = seededRng(41);
  let share = 0, total = 0;
  for (let i = 0; i < 60; i++) {
    for (const q of buildRound(s, rng)) {
      if (q.drill) continue;
      assert.ok(q.options.length <= 4, `詞最多 4 選項，現在 ${q.options.length}`);
      const tSyl = q.target.split(' ').map(coreOf);
      for (const o of q.options) {
        if (o === q.target) continue;
        total++;
        if (o.split(' ').map(coreOf).some((x, k) => tSyl.includes(x))) share++;
      }
    }
  }
  assert.ok(share / total > 0.5, `共用音節比例 ${share}/${total}`);
});

test('聽的玩法不出詞：noWordsState 把詞的組排除在自動解鎖與範圍之外', () => {
  const wordGroup = GROUPS.findIndex(g => g[0].includes(' '));
  const all = { ...view(), unlockedUpTo: GROUPS.length };
  const pool = activePool(noWordsState(all));
  assert.ok(pool.length > 300, `池子 ${pool.length}`);
  assert.ok(pool.every(s => !s.includes(' ')), '不該有詞');
  const ranged = { ...view(), rangeGroups: [wordGroup, wordGroup + 1] };
  assert.deepEqual(activePool(noWordsState(ranged)), GROUPS[0], '範圍全是詞就退回第一組');
});

test('讀讀看用的狀態：只留詞的組，家長沒指定就是全部詞', () => {
  const s = wordsOnlyState(view());
  const pool = activePool(s);
  assert.ok(pool.length >= 60);
  assert.ok(pool.every(w => w.includes(' ')));
  const wordGroup = GROUPS.findIndex(g => g[0].includes(' '));
  const ranged = wordsOnlyState({ ...view(), rangeGroups: [2, wordGroup] });
  assert.deepEqual(activePool(ranged), GROUPS[wordGroup], '有指定就只留指定的詞組');
});


// ---- 骨頭與商店 ----
test('骨頭：加了會累計，扣不會變負；買配件要夠錢、買了自動戴上；沒買的不能戴', () => {
  let s = createState()
  assert.equal(s.bones, 0)
  s = addBones(s, 5)
  s = addBones(s, 2)
  assert.equal(s.bones, 7)
  assert.equal(s.bonesTotal, 7)
  const bow = { id: 'bow', slot: 'head', price: 8 }
  assert.equal(buyItem(s, bow).bones, 7, '不夠錢不能買')
  assert.deepEqual(buyItem(s, bow).owned, [])
  s = addBones(s, 1)
  s = buyItem(s, bow)
  assert.equal(s.bones, 0)
  assert.deepEqual(s.owned, ['bow'])
  assert.equal(s.worn.head, 'bow')
  s = wearItem(s, 'head', null)
  assert.equal(s.worn.head, undefined)
  s = wearItem(s, 'head', 'crown')
  assert.equal(s.worn.head, undefined, '沒買過的不能戴')
  s = wearItem(s, 'head', 'bow')
  assert.equal(s.worn.head, 'bow')
  assert.equal(addBones(s, -99).bones, 0)
})

test('舊的 version 2 存檔沒有骨頭欄位，載入時補上，清除練習紀錄不會動到骨頭', () => {
  const old = createState()
  delete old.bones; delete old.owned; delete old.worn; delete old.bonesTotal
  const s = withWallet(old)
  assert.equal(s.bones, 0)
  assert.deepEqual(s.owned, [])
  const rich = addBones(s, 12)
  assert.equal(resetProgress(rich).bones, 12)
})
