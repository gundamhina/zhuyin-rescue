import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/store.js';
import { createState, recordAnswer } from '../src/scheduler.js';

function fakeStorage() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
  };
}

test('沒有存檔時回傳新狀態', () => {
  const store = createStore(fakeStorage());
  const s = store.load('p1');
  assert.equal(s.tier, 0);
  assert.deepEqual(s.confusions, {});
});

test('存了再讀回來一樣', () => {
  const storage = fakeStorage();
  const store = createStore(storage);
  let s = createState();
  s = recordAnswer(s, { target: 'ㄚ', ok: false, picked: 'ㄛ', ms: 1200 });
  store.save('p1', s);
  assert.deepEqual(createStore(storage).load('p1'), s);
});

test('不同使用者的進度分開存', () => {
  const store = createStore(fakeStorage());
  let a = createState();
  a = recordAnswer(a, { target: 'ㄚ', ok: true, picked: 'ㄚ', ms: 800 });
  store.save('p1', a);
  const b = store.load('p2');
  assert.deepEqual(b.mastery, {});
  assert.deepEqual(store.load('p1'), a);
});

test('存檔壞掉時回傳新狀態，不會炸', () => {
  const storage = fakeStorage();
  storage.setItem('zhuyin-rescue:p1', '{not json');
  const s = createStore(storage).load('p1');
  assert.equal(s.tier, 0);
});

test('匯出是 JSON 字串，匯入後狀態一致', () => {
  const store = createStore(fakeStorage());
  let s = createState({ known: ['ㄅ'] });
  const text = store.exportJson(s);
  assert.equal(typeof text, 'string');
  assert.deepEqual(store.importJson(text), s);
});

test('一開始沒有任何使用者', () => {
  const store = createStore(fakeStorage());
  assert.deepEqual(store.loadProfiles(), { list: [], current: null });
});

test('新增使用者會拿到 id，並成為目前使用者', () => {
  const store = createStore(fakeStorage());
  const p = store.addProfile({ name: '小美', color: 2 });
  assert.equal(typeof p.id, 'string');
  const profiles = store.loadProfiles();
  assert.equal(profiles.list.length, 1);
  assert.equal(profiles.list[0].name, '小美');
  assert.equal(profiles.current, p.id);
});

test('切換目前使用者', () => {
  const store = createStore(fakeStorage());
  const a = store.addProfile({ name: 'A', color: 0 });
  store.addProfile({ name: 'B', color: 1 });
  store.setCurrent(a.id);
  assert.equal(store.loadProfiles().current, a.id);
});

test('刪除使用者會連進度一起刪', () => {
  const storage = fakeStorage();
  const store = createStore(storage);
  const a = store.addProfile({ name: 'A', color: 0 });
  store.save(a.id, createState({ known: ['ㄅ'] }));
  store.removeProfile(a.id);
  assert.equal(store.loadProfiles().list.length, 0);
  assert.equal(store.loadProfiles().current, null);
  assert.equal(storage.getItem('zhuyin-rescue:' + a.id), null);
});
