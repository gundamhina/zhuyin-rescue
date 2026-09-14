# 圖片插槽

把 PNG 放進這個資料夾，檔名照下面對，遊戲就會用圖片蓋掉向量圖。沒放的維持向量版。放好後跑 `npm run build`。

生圖工具吐出來的原檔（JPG、尺寸不對、假透明格子背景）先丟進 `raw/`，再用 `tools/prep_images.py` 轉成插槽檔，用法寫在那個檔案開頭。已處理：`scene.png`、`home.png`、`dog-0.png`。`dog-1`～`dog-5` 目前是 `dog-0` 的複本佔位，之後有各自的圖再蓋掉。

| 檔名 | 尺寸 | 用途 | 背景 |
|---|---|---|---|
| `scene.png` | 1200×800 | 釣魚遊戲背景（天空、遠山、海、左下角要留木碼頭，碼頭面約在 y=524–566、x=0–410） | 不透明 |
| `home.png` | 1200×800 | 首頁、選人、結算的背景（天空、雲、草原，下方 1/4 是草地） | 不透明 |
| `dog-0.png` … `dog-5.png` | 260×300 | 六隻救援狗，坐姿、面向前、右手拿釣竿往右上舉。0 藍警帽、1 紅消防帽、2 粉飛行護目鏡、3 綠回收工具、4 橘工程帽、5 黃鬆餅圍裙 | 透明 |
| `card-fishing.png` | 300×400 | 首頁釣魚卡插圖 | 不透明 |
| `card-feeding.png` | 300×400 | 首頁餵狗狗卡插圖 | 不透明 |
| `card-memory.png` | 300×400 | 首頁翻牌卡插圖 | 不透明 |

## 生圖提示詞（英文，貼進 Midjourney / DALL·E / Stable Diffusion）

風格基底，每張都加：

```
hand-painted anime background in the style of a 1990s Japanese animated film, soft watercolor gouache textures, warm natural light, lush greens, cumulus clouds with shaded undersides, gentle pastel sky, no text, no characters, children's picture book mood
```

scene.png：

```
[風格基底], a small weathered wooden fishing pier on the lower left reaching into a calm teal sea, rolling green hills with bushes in the distance, a small red buoy and a blue bucket on the pier, late morning, wide 3:2 composition, the sea occupies the lower right two thirds --ar 3:2
```

home.png：

```
[風格基底], a wide summer meadow with wildflowers in the foreground, distant soft hills, big fluffy clouds, the lower quarter is grass, the upper three quarters are open sky, wide 3:2 composition --ar 3:2
```

dog-N.png（把顏色和裝備換掉，六張）：

```
a cute cartoon puppy sitting and facing the viewer, brown fur with cream muzzle, floppy ears, big round eyes, wearing a [blue police cap and blue vest], holding a wooden fishing rod raised to the upper right, hand-painted anime style like a 1990s Japanese animated film, soft shading, full body, centered, transparent background, no text --ar 13:15
```

六隻的裝備：
1. `dog-0` blue police cap and blue vest
2. `dog-1` red firefighter helmet and red vest
3. `dog-2` pink aviator goggles on head and pink vest
4. `dog-3` green cap and green recycling vest with tools
5. `dog-4` orange construction hard hat and orange vest
6. `dog-5` yellow chef hat and yellow apron

card-*.png：

```
[風格基底], [a wooden pier with a fishing rod and a floating bubble on teal water / a happy puppy in front of a red food bowl with a bone-shaped biscuit / four colorful playing cards face down on green grass], vertical 3:4 composition, simple, big shapes --ar 3:4
```

## 注意

- 狗狗一定要透明背景 PNG，不然會有一塊方形底色。
- 生出來的圖如果有文字或水印，裁掉再放。
- 這些圖只在自己家裡用，不對外發布。


## 詞的圖：`img/words/`

連連看和填空用。檔名是詞的國字，例如 `img/words/牙齒.png`，256×256、透明背景。沒放的詞退回表情符號。

風格提示詞（每張都加）：

```
a single simple object icon for a children's picture book, hand-painted watercolor gouache look like a 1990s Japanese animated film, soft edges, warm light, centered, plain transparent background, no text, no border --ar 1:1
```

| 檔名 | 畫什麼 |
|---|---|
| `爸爸.png` | dad |
| `媽媽.png` | mom |
| `哥哥.png` | older brother |
| `姐姐.png` | older sister |
| `弟弟.png` | little brother |
| `妹妹.png` | little sister |
| `爺爺.png` | grandpa |
| `奶奶.png` | grandma |
| `阿姨.png` | auntie |
| `叔叔.png` | uncle |
| `小狗.png` | puppy |
| `小貓.png` | kitten |
| `小鳥.png` | little bird |
| `小魚.png` | little fish |
| `老虎.png` | tiger |
| `獅子.png` | lion |
| `大象.png` | elephant |
| `兔子.png` | rabbit |
| `猴子.png` | monkey |
| `熊貓.png` | panda |
| `青蛙.png` | frog |
| `蝴蝶.png` | butterfly |
| `蘋果.png` | apple |
| `香蕉.png` | banana |
| `西瓜.png` | watermelon |
| `麵包.png` | bread loaf |
| `牛奶.png` | glass of milk |
| `雞蛋.png` | egg |
| `餅乾.png` | cookie |
| `糖果.png` | wrapped candy |
| `蛋糕.png` | slice of cake |
| `米飯.png` | bowl of rice |
| `水果.png` | bowl of mixed fruit |
| `草莓.png` | strawberry |
| `眼睛.png` | a pair of eyes |
| `鼻子.png` | nose |
| `耳朵.png` | ear |
| `嘴巴.png` | smiling mouth |
| `頭髮.png` | hair on a head, back view |
| `牙齒.png` | tooth |
| `手指.png` | hand pointing one finger |
| `腳丫.png` | bare foot |
| `紅色.png` | red paint blob |
| `黃色.png` | yellow paint blob |
| `藍色.png` | blue paint blob |
| `綠色.png` | green paint blob |
| `白色.png` | white paint blob on light grey |
| `黑色.png` | black paint blob |
| `粉紅.png` | pink paint blob |
| `紫色.png` | purple paint blob |
| `吃飯.png` | child eating rice with a spoon |
| `睡覺.png` | child sleeping in bed |
| `洗澡.png` | child in a bathtub with bubbles |
| `刷牙.png` | child brushing teeth |
| `上學.png` | child with backpack walking to school |
| `玩具.png` | pile of toys |
| `書包.png` | school backpack |
| `學校.png` | school building |
| `老師.png` | teacher at a blackboard |
| `朋友.png` | two children holding hands |
| `太陽.png` | sun |
| `月亮.png` | crescent moon |
| `下雨.png` | rain cloud with raindrops |
| `星星.png` | star |
| `冰淇淋.png` | ice cream cone |
| `巧克力.png` | chocolate bar |
| `幼兒園.png` | kindergarten building with playground |
| `腳踏車.png` | bicycle |
| `洗衣機.png` | washing machine |
| `電視機.png` | television |
| `小白兔.png` | white rabbit |
| `大野狼.png` | grey wolf |
| `小汽車.png` | small car |
| `溜滑梯.png` | playground slide |
