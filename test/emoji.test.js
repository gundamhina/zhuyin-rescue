import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { WORDS, WORD_ICON } from '../src/data.js';
import { twemojiName } from '../src/art.js';

test('每個有圖的詞都有 Twemoji 圖檔（跑 tools/fetch_twemoji.py 下載）', () => {
  const missing = WORDS.filter(w => !existsSync(new URL(`../img/emoji/${twemojiName(WORD_ICON[w])}.svg`, import.meta.url)));
  assert.deepEqual(missing, []);
});

test('Twemoji 檔名：沒有 ZWJ 的拿掉 FE0F，有 ZWJ 的保留', () => {
  assert.equal(twemojiName('❤️'), '2764');
  assert.equal(twemojiName('🐶'), '1f436');
  assert.equal(twemojiName('👨‍⚕️'), '1f468-200d-2695-fe0f');
});
