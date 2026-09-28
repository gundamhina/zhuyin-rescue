# -*- coding: utf-8 -*-
"""產生 src/strokes.js：37 個注音符號的標準筆順。

資料來源：教育部《國字標準字體筆順學習網》注音筆順（https://stroke-order.learningweb.moe.edu.tw/phonetic.jsp），
創用 CC 姓名標示－非商業性－禁止改作 3.0 臺灣。tools/moe_strokes.json 是原始 XML 原封不動存下來的；
這裡只換成 SVG 路徑的寫法，座標、筆畫、順序都不改。

每一筆有兩樣東西：
- outline 這一筆的外框（2048×2048 的座標，跟網站一樣）
- track 書寫的軌跡：從起筆一路到收筆的點，每點帶筆寬（size）
動畫就是沿著 track 畫一條粗線，用 outline 裁切，一筆接一筆。

改這個檔再跑 `python tools/gen_strokes.py`。
"""
import json, os, re
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))


def num(v):
    f = float(v)
    return str(int(f)) if f == int(f) else ('%.2f' % f).rstrip('0')


def outline_path(el):
    parts = []
    for c in el:
        a = c.attrib
        if c.tag == 'MoveTo':
            if parts: parts.append('Z')
            parts.append(f"M{num(a['x'])} {num(a['y'])}")
        elif c.tag == 'LineTo':
            parts.append(f"L{num(a['x'])} {num(a['y'])}")
        elif c.tag == 'QuadTo':
            parts.append(f"Q{num(a['x1'])} {num(a['y1'])} {num(a['x2'])} {num(a['y2'])}")
        elif c.tag == 'CubicTo':
            parts.append(f"C{num(a['x1'])} {num(a['y1'])} {num(a['x2'])} {num(a['y2'])} {num(a['x3'])} {num(a['y3'])}")
        else:
            raise ValueError(c.tag)
    parts.append('Z')
    return ''.join(parts)


def main():
    raw = json.load(open(os.path.join(HERE, 'moe_strokes.json'), encoding='utf-8'))
    out = ['// 由 tools/gen_strokes.py 產生，不要手改。',
           '// 教育部《國字標準字體筆順學習網》注音筆順，CC BY-NC-ND 3.0 TW。座標 2048×2048。',
           '// STROKES[符號] = [{ d: 外框路徑, track: [[x, y, 筆寬], …] }, …]（照筆順），NOTES[符號] = 網站上的書寫說明',
           '', 'export const STROKES = {']
    notes = {}
    for ch, xml in raw.items():
        root = ET.fromstring(xml.encode('utf-8'))
        strokes = []
        for st in root.findall('Stroke'):
            d = outline_path(st.find('Outline'))
            track = [[num(p.attrib['x']), num(p.attrib['y']), num(p.attrib.get('size', '150'))] for p in st.find('Track')]
            strokes.append('{ d: \'%s\', track: [%s] }' % (d, ', '.join('[%s]' % ', '.join(t) for t in track)))
        out.append(f"  '{ch}': [\n    " + ',\n    '.join(strokes) + '\n  ],')
        if root.attrib.get('explanation'):
            notes[ch] = root.attrib['explanation']
    out.append('}')
    out.append('')
    out.append('export const STROKE_NOTES = {')
    for ch, n in notes.items():
        out.append(f"  '{ch}': '{n}',")
    out.append('}')
    open(os.path.join(HERE, '..', 'src', 'strokes.js'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print('symbols:', len(raw), 'notes:', len(notes))


if __name__ == '__main__':
    main()
