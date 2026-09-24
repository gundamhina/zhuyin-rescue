"""從 tools/art_list.py 產生生圖清單：
  img/README.md             專案裡的說明（檔名、尺寸、提示詞）
  <輸出資料夾>/art-pack.html  一頁式清單：提示詞一鍵複製、勾選做完的（記在瀏覽器）

用法：python tools/make_art_pack.py [輸出資料夾，預設 img/]
"""
import base64
import io
import json
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import art_list  # noqa: E402

ROOT = art_list.ROOT

GROUPS = [
    ('dogs', '五隻救援隊員', '現在五隻隊員是同一張圖的複本，只靠領巾分辨。最明顯、最值得先做。',
     '上傳 img/dog-0.png，請 Gemini「改這張圖」，五隻才會像同一個畫家畫的。'),
    ('cards', '首頁七張卡片', '首頁一打開就看到，現在是向量畫的卡片。',
     '上傳 img/home.jpg 當畫風參考，說「用這張圖的畫風」。'),
    ('bgs', '三張遊戲背景', '現在除了釣魚，每個遊戲都借用首頁的草原。',
     '上傳 img/home.jpg 當畫風參考。手機直拿只看得到中間，所以中間要安靜。'),
    ('words', '191 個詞的圖', '連連看和填空的圖，現在是表情符號。一次生九張，處理工具會自動切開。',
     '上傳 img/home.jpg 當畫風參考。生出來請確認九個東西的順序跟下面列的一樣。'),
]


def thumb(path, max_side, fmt):
    im = Image.open(os.path.join(ROOT, path))
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    buf = io.BytesIO()
    if fmt == 'JPEG':
        im.convert('RGB').save(buf, 'JPEG', quality=82)
        mime = 'image/jpeg'
    else:
        im.save(buf, 'PNG', optimize=True)
        mime = 'image/png'
    return f'data:{mime};base64,' + base64.b64encode(buf.getvalue()).decode()


def spec_label(kind):
    return art_list.SPECS[kind]['label']


def write_readme(items):
    lines = [
        '# 圖片插槽',
        '',
        '把 PNG 放進這個資料夾，檔名照下面對，遊戲就會用圖片蓋掉向量圖。沒放的維持原樣。',
        '',
        '這份檔案由 `tools/make_art_pack.py` 從 `tools/art_list.py` 產生，要改提示詞請改 `art_list.py` 再重跑。',
        '',
        '## 已經有的',
        '',
        '| 檔名 | 用途 |',
        '|---|---|',
        '| `scene.jpg` | 釣魚遊戲背景（左下角木碼頭，狗狗坐在上面） |',
        '| `home.jpg` | 選人、首頁、結算的背景；也是其他背景還沒生之前的備用 |',
        '| `dog-0.png` … `dog-5.png` | 六隻救援狗（透明背景 PNG）。dog-0 是其他五隻的參考圖 |',
        '| `card-*.jpg`、`bg-*.jpg` | 首頁卡片、遊戲背景（不透明，存 JPG 比較小） |',
        '| `icon-*.png` | 手機桌面圖示，`tools/make_icons.py` 從 dog-0 做出來 |',
        '',
        '## 怎麼把生好的圖放進來',
        '',
        '1. 生好的圖照下面的檔名改名（副檔名 jpg、png 都可以），丟進 `img/raw/`。',
        '2. 在專案根目錄跑 `python tools/prep_images.py`，它會照檔名自動裁切、縮放、去背、切九宮格。',
        '3. `npm run build`。',
        '',
        '## 用 Gemini 生圖的訣竅',
        '',
        '- **狗狗要用改圖**：上傳 `img/dog-0.png`，貼提示詞，請它「改這張圖」。只改毛色和裝備，姿勢和畫風才會一樣。',
        '- **狗狗用藍底**：鬆餅狗是白毛，白底一去背會連毛一起不見，所以提示詞裡指定純藍底。',
        '- **卡片、背景、詞的圖**：上傳 `img/home.jpg`，加一句「用這張圖的畫風」，整套才會統一。',
        '- **比例**：Gemini 不一定照比例出圖，沒關係，處理工具會從中間裁；重要的東西放中間就好。',
        '- **有字就重生**：生圖常冒出亂碼文字，有字的圖會很突兀。',
        '',
        '風格基底（每條提示詞都已經加上）：',
        '',
        '```',
        art_list.STYLE,
        '```',
        '',
    ]
    for gid, gname, why, how in GROUPS:
        lines += [f'## {gname}', '', why + how, '']
        for it in [i for i in items if i['group'] == gid]:
            lines.append(f"### `{it['file']}`　{it['title']}")
            lines.append('')
            lines.append(f"{spec_label(it['kind'])}。參考圖：`{it['ref']}`。")
            if it['kind'] == 'sheet':
                lines.append('')
                layout = '三行三列' if it['rows'] == 3 else '一列'
                lines.append(f"{layout}，由左到右、由上到下：" + '、'.join(it['words']) + '。切開後存成 `img/words/<國字>.png`。')
            lines += ['', '```', it['prompt'], '```', '']
    lines += [
        '## 注意',
        '',
        '- 生出來的圖如果有文字或水印，重生或裁掉再放。',
        '- 這些圖只在自己家裡用，不對外發布。',
        '',
    ]
    open(os.path.join(ROOT, 'img', 'README.md'), 'w', encoding='utf-8').write('\n'.join(lines))


def write_html(items, out_dir):
    data = {
        'groups': [{'id': g, 'name': n, 'why': w, 'how': h} for g, n, w, h in GROUPS],
        'items': [{**it, 'spec': spec_label(it['kind'])} for it in items],
        'refs': {
            'img/dog-0.png': thumb('img/dog-0.png', 220, 'PNG'),
            'img/home.jpg': thumb('img/home.jpg', 360, 'JPEG'),
        },
    }
    tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'art_pack_template.html'), encoding='utf-8').read()
    html = tpl.replace('/*__DATA__*/null', json.dumps(data, ensure_ascii=False))
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, 'art-pack.html')
    open(path, 'w', encoding='utf-8').write(html)
    return path


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'img')
    items = art_list.all_items()
    write_readme(items)
    path = write_html(items, out_dir)
    print('寫入 img/README.md 與', path, f'（共 {len(items)} 張要生）')


if __name__ == '__main__':
    main()
