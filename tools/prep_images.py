"""把生圖工具吐出來的圖整理成遊戲要的插槽檔。

最常用：批次處理（在專案根目錄）
  1. 生好的圖照清單上的檔名改名，丟進 img/raw/，例如 dog-1.jpg、card-fishing.png、bg-room.jpg、words-3.jpg
  2. python tools/prep_images.py
  3. npm run build

檔名開頭決定怎麼處理（規格在 tools/art_list.py）：
  scene、home、bg-*   背景：裁成橫的 3:2，縮到 1536×1024 → img/<名字>.png
  card-*              卡片：裁成直的 3:4，縮到 600×800 → img/<名字>.png
  dog-*               狗：去掉藍底（或白底、假透明格子），放進 13:15 透明畫布 → img/<名字>.png（520×600）
  words-N             詞的九宮格：自動切開、去白底，一個詞一張 → img/words/<國字>.png（384×384）
  word-<國字>         單一個詞的圖 → img/words/<國字>.png

單張處理（舊用法，還能用）：
  python tools/prep_images.py bg   img/raw/xxx.jpg home
  python tools/prep_images.py dog  img/raw/xxx.jpg dog-1
  python tools/prep_images.py card img/raw/xxx.jpg card-fishing
"""
import os
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import art_list  # noqa: E402

ROOT = art_list.ROOT
RAW = os.path.join(ROOT, 'img', 'raw')
IMG = os.path.join(ROOT, 'img')
EXTS = ('.png', '.jpg', '.jpeg', '.webp')


def crop_to(im, ratio, size):
    w, h = im.size
    if w / h > ratio:
        tw, th = int(h * ratio), h
    else:
        tw, th = w, int(w / ratio)
    left, top = (w - tw) // 2, (h - th) // 2
    return im.crop((left, top, left + tw, top + th)).resize(size, Image.LANCZOS)


def flood_from_border(cand):
    """cand 是「可能是背景」的布林圖；從四邊往裡長，連得到邊的才算背景。"""
    h, w = cand.shape
    seen = np.zeros_like(cand)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def background_mask(rgb, tight=False):
    """猜背景色（四邊的中位數），跟它很像、又連到邊的就是背景。
    tight=True：只認幾乎一模一樣的顏色（白底上有白色東西的時候用，不然會被吃掉）。
    假透明格子（白、淺灰交錯）也當背景。大圖先縮小算再放大，比較快。"""
    small = rgb
    if max(rgb.size) > 700:
        f = 700 / max(rgb.size)
        small = rgb.resize((int(rgb.width * f), int(rgb.height * f)), Image.BILINEAR)
    a = np.asarray(small).astype(np.int16)
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.abs(a - bg).max(axis=2)
    saturated_key = (bg.max() - bg.min()) > 80  # 藍底、綠底這種彩色背景
    if saturated_key:
        cand = dist < 70
    elif tight:
        cand = dist < 16
    else:
        neutral_light = ((a.max(axis=2) - a.min(axis=2)) < 22) & (a.min(axis=2) > 150)
        cand = (dist < 30) | neutral_light
    mask = flood_from_border(cand)
    m = Image.fromarray(np.where(mask, 255, 0).astype(np.uint8)).resize(rgb.size, Image.BILINEAR)
    return m, saturated_key, bg


def cut_out(im, tight=False):
    """回傳去背後的 RGBA。原本就有透明的 PNG 直接用。"""
    if im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] < 255:
        return im
    rgb = im.convert('RGB')
    bgmask, keyed, bg = background_mask(rgb, tight)
    alpha = Image.eval(bgmask, lambda v: 255 - v).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    rgba = Image.merge('RGBA', (*rgb.split(), alpha))
    if keyed:
        # 去掉邊緣殘留的背景色（藍底去完，毛的邊緣會帶一圈藍）
        arr = np.asarray(rgba).astype(np.int16)
        ch = int(np.argmax(bg))
        others = [c for c in range(3) if c != ch]
        edge = arr[..., 3] < 250
        cap = np.maximum(arr[..., others[0]], arr[..., others[1]])
        arr[..., ch] = np.where(edge, np.minimum(arr[..., ch], cap), arr[..., ch])
        rgba = Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA')
    return rgba


def fit_square(rgba, size, pad=0.08):
    box = rgba.getchannel('A').getbbox()
    if not box:
        return Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rgba = rgba.crop(box)
    inner = int(size * (1 - 2 * pad))
    f = min(inner / rgba.width, inner / rgba.height)
    rgba = rgba.resize((max(1, int(rgba.width * f)), max(1, int(rgba.height * f))), Image.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    canvas.paste(rgba, ((size - rgba.width) // 2, (size - rgba.height) // 2), rgba)
    return canvas


def prep_dog(src, out):
    rgba = cut_out(Image.open(src))
    rgba = rgba.crop(rgba.getchannel('A').getbbox())
    cw, ch = rgba.size
    scale = min(1300 / cw, 1500 / ch)
    rgba = rgba.resize((int(cw * scale), int(ch * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', (1300, 1500), (0, 0, 0, 0))
    canvas.paste(rgba, ((1300 - rgba.width) // 2, 1500 - rgba.height), rgba)
    canvas.resize((520, 600), Image.LANCZOS).save(out, optimize=True)


def find_cuts(profile, parts):
    """在 profile（每一欄或每一列有多少前景）裡找 parts-1 個切點：每個預期位置附近，前景最少的那段空白的正中間。"""
    n = len(profile)
    cuts = []
    for k in range(1, parts):
        target = n * k / parts
        lo, hi = int(target - n / parts * 0.4), int(target + n / parts * 0.4)
        window = profile[lo:hi]
        low = window.min()
        idx = np.nonzero(window <= low + max(1, low * 0.05))[0]
        # 連續的一段取最長的，切在它中間
        runs, start = [], idx[0]
        for a, b in zip(idx, idx[1:]):
            if b != a + 1:
                runs.append((start, a))
                start = b
        runs.append((start, idx[-1]))
        s, e = max(runs, key=lambda r: r[1] - r[0])
        cuts.append(lo + (s + e) // 2)
    return [0] + cuts + [n]


def prep_sheet(src, item):
    rgb = Image.open(src).convert('RGB')
    rows, cols = item['rows'], item['cols']
    bgmask, _, _ = background_mask(rgb, tight=True)
    fg = np.asarray(bgmask) < 128
    xs = find_cuts(fg.sum(axis=0), cols)
    ys = find_cuts(fg.sum(axis=1), rows)
    os.makedirs(os.path.join(IMG, 'words'), exist_ok=True)
    written = []
    for r in range(rows):
        for c in range(cols):
            i = r * cols + c
            if i >= len(item['words']):
                break
            cell = rgb.crop((xs[c], ys[r], xs[c + 1], ys[r + 1]))
            out = os.path.join(IMG, 'words', item['words'][i] + '.png')
            fit_square(cut_out(cell, tight=True), 384).save(out, optimize=True)
            written.append(item['words'][i])
    return written


def prep_word(src, word):
    os.makedirs(os.path.join(IMG, 'words'), exist_ok=True)
    out = os.path.join(IMG, 'words', word + '.png')
    fit_square(cut_out(Image.open(src), tight=True), 384).save(out, optimize=True)
    return out


def process(src, stem):
    """照檔名開頭處理一張圖，回傳一行說明；認不得的檔名回傳 None。"""
    items = {it['file']: it for it in art_list.all_items()}
    if stem in ('scene', 'home') or stem.startswith('bg-'):
        spec = art_list.SPECS['bg']
        crop_to(Image.open(src).convert('RGB'), spec['ratio'], spec['size']).save(os.path.join(IMG, stem + '.png'), optimize=True)
        return f'背景 → img/{stem}.png'
    if stem.startswith('card-'):
        spec = art_list.SPECS['card']
        crop_to(Image.open(src).convert('RGB'), spec['ratio'], spec['size']).save(os.path.join(IMG, stem + '.png'), optimize=True)
        return f'卡片 → img/{stem}.png'
    if stem.startswith('dog-'):
        prep_dog(src, os.path.join(IMG, stem + '.png'))
        return f'狗狗 → img/{stem}.png'
    if stem.startswith('words-') and stem in items:
        written = prep_sheet(src, items[stem])
        return f'九宮格 → img/words/ 共 {len(written)} 張：' + '、'.join(written)
    if stem.startswith('word-'):
        return '詞 → ' + os.path.relpath(prep_word(src, stem[5:]), ROOT)
    return None


def batch():
    if not os.path.isdir(RAW):
        print('找不到 img/raw/ 資料夾')
        return
    files = sorted(f for f in os.listdir(RAW) if f.lower().endswith(EXTS))
    done, skipped = 0, []
    for f in files:
        stem = os.path.splitext(f)[0]
        msg = process(os.path.join(RAW, f), stem)
        if msg:
            print('✔', f, '→', msg.split('→', 1)[1].strip() if '→' in msg else msg)
            done += 1
        else:
            skipped.append(f)
    print(f'\n處理了 {done} 張。')
    if skipped:
        print('這些檔名認不得，沒處理（照清單上的檔名改名再跑一次）：')
        for f in skipped:
            print('  ', f)


def main():
    if len(sys.argv) == 1:
        return batch()
    if len(sys.argv) != 4 or sys.argv[1] not in ('bg', 'dog', 'card'):
        print(__doc__)
        sys.exit(1)
    kind, src, name = sys.argv[1:]
    prefix = {'bg': 'bg-', 'card': 'card-', 'dog': 'dog-'}[kind]
    stem = name if name in ('scene', 'home') or name.startswith(prefix) else prefix + name
    print(process(src, stem))


if __name__ == '__main__':
    main()
