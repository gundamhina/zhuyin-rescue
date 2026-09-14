# 從 img/dog-0.png 做手機桌面圖示：天空色圓角方塊，狗狗置中。
# 用法：python tools/make_icons.py  → img/icon-192.png、icon-512.png、icon-maskable-512.png
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'img')
SKY_TOP = (150, 200, 230)
SKY_BOTTOM = (110, 170, 130)


def sky(size):
    im = Image.new('RGBA', (size, size))
    d = ImageDraw.Draw(im)
    for y in range(size):
        t = y / (size - 1)
        c = tuple(int(SKY_TOP[i] * (1 - t) + SKY_BOTTOM[i] * t) for i in range(3)) + (255,)
        d.line([(0, y), (size, y)], fill=c)
    return im


def icon(size, dog_ratio, radius_ratio):
    base = sky(size)
    dog = Image.open(os.path.join(IMG, 'dog-0.png')).convert('RGBA')
    h = int(size * dog_ratio)
    w = int(dog.width * h / dog.height)
    dog = dog.resize((w, h), Image.LANCZOS)
    base.alpha_composite(dog, ((size - w) // 2, size - h - int(size * 0.04)))
    if radius_ratio:
        mask = Image.new('L', (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255)
        out = Image.new('RGBA', (size, size))
        out.paste(base, mask=mask)
        return out
    return base


icon(192, 0.82, 0.2).save(os.path.join(IMG, 'icon-192.png'))
icon(512, 0.82, 0.2).save(os.path.join(IMG, 'icon-512.png'))
icon(512, 0.62, 0).save(os.path.join(IMG, 'icon-maskable-512.png'))  # 可遮罩版：不裁圓角、狗狗縮小留安全區
print('icons ok')
