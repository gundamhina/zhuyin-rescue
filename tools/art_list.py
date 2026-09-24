"""所有要用生圖工具生的圖，集中在這裡：檔名、尺寸、提示詞、參考圖。
img/README.md 和生圖清單網頁都由 tools/make_art_pack.py 從這裡產生；tools/prep_images.py 也照這裡的規格處理。
改提示詞就改這個檔，再跑一次 make_art_pack.py。
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 每張都加的風格基底（跟現在的碼頭、草原、第一隻狗同一套）
STYLE = ("hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, "
         "soft edges, warm natural light, gentle pastel colors, children's picture book mood, "
         "no text, no letters, no numbers, no watermark")

# 輸出規格：處理工具照這個裁切縮放
SPECS = {
    'bg': {'ratio': 3 / 2, 'size': (1536, 1024), 'label': '1536×1024，橫的 3:2'},
    'card': {'ratio': 3 / 4, 'size': (600, 800), 'label': '600×800，直的 3:4'},
    'dog': {'ratio': 13 / 15, 'size': (520, 600), 'label': '520×600，透明背景'},
    'sheet': {'ratio': 1, 'size': (384, 384), 'label': '切成每張 384×384，透明背景'},
}

# ---- 第一優先：五隻救援隊員。用 dog-0 當參考圖「改圖」，五隻才會像同一個畫家畫的 ----
DOG_EDIT = ("Edit the attached picture. Keep exactly the same puppy, the same sitting pose, the same fishing rod, "
            "the same proportions and the same painting style. Only change this: {change}. "
            "Put the puppy on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.")
DOGS = [
    ('dog-1', '消防狗', '#C8553D', "make the fur golden orange, and replace the blue police cap and vest with a red firefighter helmet and a red vest with a yellow stripe"),
    ('dog-2', '飛行狗', '#E39AA8', "make the fur light grey, and replace the blue police cap and vest with pink aviator goggles pushed up on the head and a pink pilot vest"),
    ('dog-3', '回收狗', '#6B9E6B', "make the fur dark chocolate brown, and replace the blue police cap and vest with a green cap and a green vest with a small leaf badge and a tool pocket"),
    ('dog-4', '工程狗', '#E0955B', "make the fur cream white with one brown ear, and replace the blue police cap and vest with an orange construction hard hat and an orange safety vest"),
    ('dog-5', '鬆餅狗', '#E8C86A', "make the fur fluffy white, and replace the blue police cap and vest with a tall yellow chef hat and a yellow apron"),
]

# ---- 第二優先：首頁七張卡片 ----
CARD_TAIL = "vertical 3:4 portrait format, one clear centered subject with big simple shapes, " + STYLE
CARDS = [
    ('card-fishing', '釣魚', "a small wooden pier over calm teal water on a sunny day, a fishing line dangling into the water where one big round shiny soap bubble floats, fluffy clouds"),
    ('card-whack', '打地鼠', "a sunny vegetable garden with three round dark soil holes in soft grass, one round cream-colored ball peeking out of the middle hole, carrot leaves and small flowers around"),
    ('card-memory', '翻牌', "four playing cards lying on a checked picnic blanket in the grass, two face down with a paw print on the back, two face up with plain white faces, a few daisies"),
    ('card-match', '連連看', "a small cork board with two picture cards pinned on it, one of a cat and one of an apple, joined by a red yarn string, soft light"),
    ('card-fill', '填空', "a wooden jigsaw puzzle board with one piece missing and that puzzle piece floating just above the gap with a soft glow"),
    ('card-write', '寫給狗狗看', "a small slate chalkboard on a wooden easel next to a fat yellow pencil and crayons, on a sunny windowsill"),
    ('card-speak', '唸給狗狗聽', "an old-fashioned round microphone on a little stand in a flower meadow, soft sound ripples and small musical notes floating out of it"),
]

# ---- 第三優先：遊戲背景。手機直拿時只看得到中間一段，中間又要夠安靜，遊戲的東西才看得清楚 ----
BG_TAIL = ("wide 3:2 landscape format, the middle of the picture is open and calm with little detail because game pieces are placed on top, "
           "the nicer details stay near the left and right edges, " + STYLE)
BGS = [
    ('bg-garden', '打地鼠', "a wide sunny vegetable garden meadow with a low wooden fence, sunflowers and bean poles at the far left and right, soft grass and brown earth across the lower half, distant hills and big clouds"),
    ('bg-room', '翻牌、連連看、填空、寫字、唸', "the cozy inside of a wooden treehouse classroom, sunlight through a round window with green leaves, bookshelves and potted plants at the left and right, a soft woven rug on the floor, warm and low contrast"),
    ('bg-shop', '狗狗商店', "a small cozy pet accessory shop, wooden shelves with colorful hats, scarves, bows and toys along the left and right walls, little bunting flags, warm afternoon light"),
]

# ---- 第四優先：74 個詞的圖。一次九張（3×3），處理工具會自動切開 ----
GLOSS = {
    '爸爸': 'dad',
    '媽媽': 'mom',
    '哥哥': 'older brother',
    '姐姐': 'older sister',
    '弟弟': 'little brother',
    '妹妹': 'little sister',
    '爺爺': 'grandpa',
    '奶奶': 'grandma',
    '阿姨': 'auntie',
    '叔叔': 'uncle',
    '小狗': 'puppy',
    '小貓': 'kitten',
    '小鳥': 'little bird',
    '小魚': 'little fish',
    '老虎': 'tiger',
    '獅子': 'lion',
    '大象': 'elephant',
    '兔子': 'rabbit',
    '猴子': 'monkey',
    '熊貓': 'panda',
    '青蛙': 'frog',
    '蝴蝶': 'butterfly',
    '蘋果': 'apple',
    '香蕉': 'banana',
    '西瓜': 'watermelon',
    '麵包': 'bread loaf',
    '牛奶': 'glass of milk',
    '雞蛋': 'egg',
    '餅乾': 'cookie',
    '糖果': 'wrapped candy',
    '蛋糕': 'slice of cake',
    '米飯': 'bowl of rice',
    '水果': 'bowl of mixed fruit',
    '草莓': 'strawberry',
    '眼睛': 'a pair of eyes',
    '鼻子': 'nose',
    '耳朵': 'ear',
    '嘴巴': 'smiling mouth',
    '頭髮': 'hair on a head, back view',
    '牙齒': 'tooth',
    '手指': 'hand pointing one finger',
    '腳丫': 'bare foot',
    '紅色': 'red paint blob',
    '黃色': 'yellow paint blob',
    '藍色': 'blue paint blob',
    '綠色': 'green paint blob',
    '白色': 'white paint blob on light grey',
    '黑色': 'black paint blob',
    '粉紅': 'pink paint blob',
    '紫色': 'purple paint blob',
    '吃飯': 'child eating rice with a spoon',
    '睡覺': 'child sleeping in bed',
    '洗澡': 'child in a bathtub with bubbles',
    '刷牙': 'child brushing teeth',
    '上學': 'child with backpack walking to school',
    '玩具': 'pile of toys',
    '書包': 'school backpack',
    '學校': 'school building',
    '老師': 'teacher at a blackboard',
    '朋友': 'two children holding hands',
    '太陽': 'sun',
    '月亮': 'crescent moon',
    '下雨': 'rain cloud with raindrops',
    '星星': 'star',
    '冰淇淋': 'ice cream cone',
    '巧克力': 'chocolate bar',
    '幼兒園': 'kindergarten building with playground',
    '腳踏車': 'bicycle',
    '洗衣機': 'washing machine',
    '電視機': 'television',
    '小白兔': 'white rabbit',
    '大野狼': 'grey wolf',
    '小汽車': 'small car',
    '溜滑梯': 'playground slide',
}


def words_in_order():
    # 詞照遊戲裡的順序（src/syllables.js 的 WORD_TEXT）
    m = open(os.path.join(ROOT, 'src', 'syllables.js'), encoding='utf-8').read()
    block = m[m.index('WORD_TEXT = {'):m.index('WORD_ICON = {')]
    return re.findall(r"^  '[^']+': '([^']+)',$", block, re.M)


def word_sheets():
    # 每九個詞一張九宮格；最後一張不滿九個就排成一列
    ws = words_in_order()
    out = []
    for i in range(0, len(ws), 9):
        chunk = ws[i:i + 9]
        rows, cols = (3, 3) if len(chunk) == 9 else (1, len(chunk))
        out.append({'name': 'words-%d' % (len(out) + 1), 'words': chunk, 'rows': rows, 'cols': cols})
    return out


def sheet_prompt(sheet):
    items = [GLOSS[w] for w in sheet['words']]
    common = ("with wide plain white gaps between them, on a plain pure white background. "
              "All the same size and the same style: " + STYLE + ". No borders, no labels. ")
    if sheet['rows'] == 1:
        return ("A single row of %d separate small illustrations side by side, " % len(items)) + common + \
            'Left to right: ' + '; '.join(items) + '.'
    rows = ' '.join('Row %d, left to right: %s.' % (r + 1, '; '.join(items[r * 3:r * 3 + 3])) for r in range(3))
    return "A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, " + common + rows


def all_items():
    # 整份清單，照優先順序。每項：group、file、title、kind（處理方式）、ref（要上傳的參考圖）、prompt
    items = []
    for f, name, color, change in DOGS:
        items.append({'group': 'dogs', 'file': f, 'title': name, 'kind': 'dog', 'color': color,
                      'ref': 'img/dog-0.png', 'prompt': DOG_EDIT.format(change=change)})
    for f, name, desc in CARDS:
        items.append({'group': 'cards', 'file': f, 'title': name, 'kind': 'card',
                      'ref': 'img/home.jpg', 'prompt': desc + ', ' + CARD_TAIL})
    for f, used, desc in BGS:
        items.append({'group': 'bgs', 'file': f, 'title': used, 'kind': 'bg',
                      'ref': 'img/home.jpg', 'prompt': desc + ', ' + BG_TAIL})
    for sh in word_sheets():
        items.append({'group': 'words', 'file': sh['name'], 'title': '、'.join(sh['words']), 'kind': 'sheet',
                      'ref': 'img/home.jpg', 'prompt': sheet_prompt(sh),
                      'words': sh['words'], 'rows': sh['rows'], 'cols': sh['cols']})
    return items
