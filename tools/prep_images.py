"""把生圖工具吐出來的圖整理成遊戲要的插槽檔。

用法（在專案根目錄）：
  python tools/prep_images.py bg   img/raw/xxx.jpg scene     # 背景：裁 3:2，縮到 1200×800 → img/scene.png
  python tools/prep_images.py bg   img/raw/xxx.jpg home
  python tools/prep_images.py dog  img/raw/xxx.jpg dog-1     # 狗：去掉假的格子背景，放進 13:15 畫布 → img/dog-1.png
  python tools/prep_images.py card img/raw/xxx.jpg card-feeding  # 卡片：裁 3:4，縮到 300×400

狗的去背只認「白／淺灰的格子」那種假透明背景，也接受真正透明的 PNG。
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter


def crop_to(im, ratio, size):
    w, h = im.size
    if w / h > ratio:
        tw, th = int(h * ratio), h
    else:
        tw, th = w, int(w / ratio)
    left, top = (w - tw) // 2, (h - th) // 2
    return im.crop((left, top, left + tw, top + th)).resize(size, Image.LANCZOS)


def remove_checker(im, min_component=1500):
    """白／淺灰、無彩度、成片的區塊當背景，回傳 alpha 遮罩。"""
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    h, w, _ = a.shape
    mx, mn = a.max(axis=2), a.min(axis=2)
    bg_color = ((mx - mn) < 22) & (mn > 150)
    label = np.zeros((h, w), np.int32)
    sizes = {}
    cur = 0
    for y0, x0 in zip(*np.nonzero(bg_color)):
        if label[y0, x0]:
            continue
        cur += 1
        n = 0
        q = deque([(y0, x0)])
        label[y0, x0] = cur
        while q:
            y, x = q.popleft()
            n += 1
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < h and 0 <= nx < w and bg_color[ny, nx] and not label[ny, nx]:
                    label[ny, nx] = cur
                    q.append((ny, nx))
        sizes[cur] = n
    big = [k for k, v in sizes.items() if v > min_component]
    bg = np.isin(label, big)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    return Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))


def prep_dog(src, out):
    im = Image.open(src)
    if im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] < 255:
        rgba = im  # 本來就有透明
    else:
        rgb = im.convert('RGB')
        rgba = Image.merge('RGBA', (*rgb.split(), remove_checker(rgb)))
    rgba = rgba.crop(rgba.getchannel('A').getbbox())
    cw, ch = rgba.size
    scale = min(1300 / cw, 1500 / ch)
    rgba = rgba.resize((int(cw * scale), int(ch * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', (1300, 1500), (0, 0, 0, 0))
    canvas.paste(rgba, ((1300 - rgba.width) // 2, 1500 - rgba.height), rgba)
    canvas.resize((520, 600), Image.LANCZOS).save(out, optimize=True)


def main():
    if len(sys.argv) != 4 or sys.argv[1] not in ('bg', 'dog', 'card'):
        print(__doc__)
        sys.exit(1)
    kind, src, name = sys.argv[1:]
    out = f'img/{name}.png'
    if kind == 'bg':
        crop_to(Image.open(src).convert('RGB'), 1.5, (1200, 800)).save(out, optimize=True)
    elif kind == 'card':
        crop_to(Image.open(src).convert('RGB'), 0.75, (300, 400)).save(out, optimize=True)
    else:
        prep_dog(src, out)
    print('寫入', out)


if __name__ == '__main__':
    main()
