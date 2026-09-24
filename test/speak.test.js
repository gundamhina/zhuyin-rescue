import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesSymbol } from '../src/speak.js';

test('唸單一符號：辨識結果有同音字就算對', () => {
  assert.equal(matchesSymbol('ㄅ', ['玻']), true);
  assert.equal(matchesSymbol('ㄅ', ['喝']), false);
});

test('唸詞：兩個字的詞兩個字都要出現，只唸其中一個字不算', () => {
  const huoche = 'ㄏㄨㄛˇ ㄔㄜ'; // 火車
  assert.equal(matchesSymbol(huoche, ['火車']), true);
  assert.equal(matchesSymbol(huoche, ['我看到火車了']), true, '句子裡有整個詞也算');
  assert.equal(matchesSymbol(huoche, ['火']), false, '只有「火」不能算火車');
  assert.equal(matchesSymbol(huoche, ['火箭']), false);
  assert.equal(matchesSymbol(huoche, ['車火']), true, '順序顛倒還是算（辨識偶爾會這樣）');
});

test('唸詞：三個字的詞對兩個字就算，只對一個字不算', () => {
  const giraffe = 'ㄔㄤˊ ㄐㄧㄥˇ ㄌㄨˋ'; // 長頸鹿
  assert.equal(matchesSymbol(giraffe, ['長頸鹿']), true);
  assert.equal(matchesSymbol(giraffe, ['長景鹿']), true, '辨識錯一個字還是算');
  assert.equal(matchesSymbol(giraffe, ['鹿']), false);
});

test('唸疊字的詞：爸爸只要有「爸」就算', () => {
  assert.equal(matchesSymbol('ㄅㄚˋ ˙ㄅㄚ', ['爸']), true);
  assert.equal(matchesSymbol('ㄅㄚˋ ˙ㄅㄚ', ['媽']), false);
});
