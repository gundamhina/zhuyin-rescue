# -*- coding: utf-8 -*-
"""拿教育部《國語辭典簡編本》核對 gen_syllables.py 的讀音。

用法：python tools/check_moe.py
第一次會下載簡編本文字資料庫（約 7 MB）到 tools/.moe/，之後直接用。
資料來源：教育部國語辭典公眾授權網，CC BY-ND 3.0 臺灣。

檢查三件事：
1. 詞：辭典有這個詞，注音要跟辭典第一個讀音一樣；辭典沒有的組合詞（小狗、大樹這類）逐字檢查讀音。
2. 拼讀字：代表字的讀音要在辭典裡；用的不是第一個讀音的破音字另外提醒（語音合成可能唸成另一個音）。
3. 三拼：使用者給的「三拼音對照表」裡的音是不是都有收（ㄔㄨㄚ 辭典只有「抓」的又音，不收）。
"""
import os, re, sys, zipfile, collections, urllib.request
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gen_syllables as g

URL = 'https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/download/dict_concised_2014_20260626.zip'
CACHE = os.path.join(HERE, '.moe')
ZIP = os.path.join(CACHE, 'dict_concised.zip')

# 三拼音對照表：每個結合韻能接的聲母
CHART = {
    'ㄧㄚ': 'ㄌㄐㄑㄒ', 'ㄨㄚ': 'ㄍㄎㄏㄓㄔㄕ', 'ㄨㄛ': 'ㄉㄊㄋㄌㄍㄎㄏㄓㄔㄕㄖㄗㄘㄙ',
    'ㄧㄝ': 'ㄅㄆㄇㄉㄊㄋㄌㄐㄑㄒ', 'ㄩㄝ': 'ㄋㄌㄐㄑㄒ', 'ㄨㄞ': 'ㄍㄎㄏㄓㄔㄕ',
    'ㄧㄠ': 'ㄅㄆㄇㄉㄊㄋㄌㄐㄑㄒ', 'ㄧㄡ': 'ㄇㄉㄋㄌㄐㄑㄒ', 'ㄧㄢ': 'ㄅㄆㄇㄉㄊㄋㄌㄐㄑㄒ',
    'ㄨㄢ': 'ㄉㄊㄋㄌㄍㄎㄏㄓㄔㄕㄖㄗㄘㄙ', 'ㄩㄢ': 'ㄐㄑㄒ', 'ㄧㄣ': 'ㄅㄆㄇㄋㄌㄐㄑㄒ',
    'ㄨㄣ': 'ㄉㄊㄌㄍㄎㄏㄓㄔㄕㄖㄗㄘㄙ', 'ㄩㄣ': 'ㄐㄑㄒ', 'ㄧㄤ': 'ㄋㄌㄐㄑㄒ',
    'ㄨㄤ': 'ㄍㄎㄏㄓㄔㄕ', 'ㄧㄥ': 'ㄅㄆㄇㄉㄊㄋㄌㄐㄑㄒ', 'ㄨㄥ': 'ㄉㄊㄋㄌㄍㄎㄏㄓㄔㄖㄗㄘㄙ',
    'ㄩㄥ': 'ㄐㄑㄒ', 'ㄨㄟ': 'ㄉㄊㄍㄎㄏㄓㄔㄕㄖㄗㄘㄙ',
}
SKIP = {'ㄔㄨㄚ'}
ZY = re.compile(r'^[ㄅ-ㄩˊˇˋ˙　 ]+$')
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'


def rows():
    """xlsx 不靠套件拆：sharedStrings 加 sheet1，回傳每列的前九欄。"""
    if not os.path.exists(ZIP):
        os.makedirs(CACHE, exist_ok=True)
        print('下載簡編本資料庫…')
        urllib.request.urlretrieve(URL, ZIP)
    outer = zipfile.ZipFile(ZIP)
    xlsx = zipfile.ZipFile(outer.open(next(n for n in outer.namelist() if n.endswith('.xlsx'))))
    ss = [''.join(t.text or '' for t in si.iter(NS + 't')) for si in ET.fromstring(xlsx.read('xl/sharedStrings.xml')).findall(NS + 'si')]
    for r in ET.fromstring(xlsx.read('xl/worksheets/sheet1.xml')).iter(NS + 'row'):
        cells = {}
        for c in r.findall(NS + 'c'):
            v = c.find(NS + 'v')
            if v is None:
                continue
            col = ord(re.match(r'[A-Z]', c.get('r')).group()) - 65
            cells[col] = ss[int(v.text)] if c.get('t') == 's' else v.text
        yield [(cells.get(i) or '').strip() for i in range(9)]


def norm(z):
    return ' '.join(z.replace('　', ' ').split())


def main():
    word = collections.defaultdict(list)   # 字詞 → 讀音（第一個是正音）
    char = collections.defaultdict(list)   # 單字 → 所有讀音
    for c in rows():
        if not c[6] or not ZY.match(c[6]):
            continue
        word[c[0]].append(norm(c[6]))
        if len(c[0]) == 1:
            # 多音排序（第 6 欄）1 是主要讀音；資料檔裡的列不一定照這個順序
            order = int(c[5]) if c[5].isdigit() else 0
            char[c[0]].append((order, norm(c[6])))
            if c[8] and ZY.match(c[8]):
                char[c[0]].append((order + 0.5, norm(c[8])))
    char = {ch: [z for o, z in sorted(rs)] for ch, rs in char.items()}
    problems = 0
    print('== 詞 ==')
    listen = [(n, [(t, z, None) for t, z in items]) for n, items in g.parse_listen_words()]
    for name, items in g.parse_words() + listen:
        for text, zy, icon in items:
            if text in word:
                # 辭典裡同一個詞有兩條（例如「那裡」ㄋㄚˇ／ㄋㄚˋ）就接受任何一條
                if zy not in word[text]:
                    print(f'  {text}：表裡 {zy}，辭典 {word[text][0]}')
                    problems += 1
                continue
            for ch, syl in zip(text, zy.split(' ')):
                if syl not in char.get(ch, []) and syl.lstrip('˙') not in [r.lstrip('˙') for r in char.get(ch, [])]:
                    print(f'  {text}（組合詞）的「{ch}」表裡 {syl}，辭典 {char.get(ch)}')
                    problems += 1
    print('== 拼讀字 ==')
    for core, ch, tone, ini, fin in g.parse():
        rs = char.get(ch)
        if rs is None:
            print(f'  「{ch}」辭典沒有這個字形（讀音 {core + tone} 請人工確認）')
        elif core + tone not in rs:
            print(f'  「{ch}」表裡 {core + tone}，辭典 {rs}')
            problems += 1
        elif rs[0] != core + tone:
            print(f'  「{ch}」用的不是辭典第一個讀音：{core + tone}，辭典 {rs}（提醒，語音合成可能唸成別的音）')
    print('== 三拼 ==')
    have = {core for core, ch, tone, ini, fin in g.parse()}
    miss = [i + f for f, inis in CHART.items() for i in inis if i + f not in have and i + f not in SKIP]
    print('  缺：' + (' '.join(miss) if miss else '（全部都有）'))
    problems += len(miss)
    print('要修的：', problems)
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
