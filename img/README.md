# 圖片插槽

把 PNG 放進這個資料夾，檔名照下面對，遊戲就會用圖片蓋掉向量圖。沒放的維持原樣。

這份檔案由 `tools/make_art_pack.py` 從 `tools/art_list.py` 產生，要改提示詞請改 `art_list.py` 再重跑。

## 已經有的

| 檔名 | 用途 |
|---|---|
| `scene.png` | 釣魚遊戲背景（左下角木碼頭，狗狗坐在上面） |
| `home.png` | 選人、首頁、結算的背景；也是其他背景還沒生之前的備用 |
| `dog-0.png` | 警察狗（藍警帽）。其他五隻的參考圖 |
| `icon-*.png` | 手機桌面圖示，`tools/make_icons.py` 從 dog-0 做出來 |

## 怎麼把生好的圖放進來

1. 生好的圖照下面的檔名改名（副檔名 jpg、png 都可以），丟進 `img/raw/`。
2. 在專案根目錄跑 `python tools/prep_images.py`，它會照檔名自動裁切、縮放、去背、切九宮格。
3. `npm run build`。

## 用 Gemini 生圖的訣竅

- **狗狗要用改圖**：上傳 `img/dog-0.png`，貼提示詞，請它「改這張圖」。只改毛色和裝備，姿勢和畫風才會一樣。
- **狗狗用藍底**：鬆餅狗是白毛，白底一去背會連毛一起不見，所以提示詞裡指定純藍底。
- **卡片、背景、詞的圖**：上傳 `img/home.png`，加一句「用這張圖的畫風」，整套才會統一。
- **比例**：Gemini 不一定照比例出圖，沒關係，處理工具會從中間裁；重要的東西放中間就好。
- **有字就重生**：生圖常冒出亂碼文字，有字的圖會很突兀。

風格基底（每條提示詞都已經加上）：

```
hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

## 五隻救援隊員

現在五隻隊員是同一張圖的複本，只靠領巾分辨。最明顯、最值得先做。上傳 img/dog-0.png，請 Gemini「改這張圖」，五隻才會像同一個畫家畫的。

### `dog-1`　消防狗

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Edit the attached picture. Keep exactly the same puppy, the same sitting pose, the same fishing rod, the same proportions and the same painting style. Only change this: make the fur golden orange, and replace the blue police cap and vest with a red firefighter helmet and a red vest with a yellow stripe. Put the puppy on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

### `dog-2`　飛行狗

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Edit the attached picture. Keep exactly the same puppy, the same sitting pose, the same fishing rod, the same proportions and the same painting style. Only change this: make the fur light grey, and replace the blue police cap and vest with pink aviator goggles pushed up on the head and a pink pilot vest. Put the puppy on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

### `dog-3`　回收狗

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Edit the attached picture. Keep exactly the same puppy, the same sitting pose, the same fishing rod, the same proportions and the same painting style. Only change this: make the fur dark chocolate brown, and replace the blue police cap and vest with a green cap and a green vest with a small leaf badge and a tool pocket. Put the puppy on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

### `dog-4`　工程狗

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Edit the attached picture. Keep exactly the same puppy, the same sitting pose, the same fishing rod, the same proportions and the same painting style. Only change this: make the fur cream white with one brown ear, and replace the blue police cap and vest with an orange construction hard hat and an orange safety vest. Put the puppy on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

### `dog-5`　鬆餅狗

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Edit the attached picture. Keep exactly the same puppy, the same sitting pose, the same fishing rod, the same proportions and the same painting style. Only change this: make the fur fluffy white, and replace the blue police cap and vest with a tall yellow chef hat and a yellow apron. Put the puppy on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

## 首頁七張卡片

首頁一打開就看到，現在是向量畫的卡片。上傳 img/home.png 當畫風參考，說「用這張圖的畫風」。

### `card-fishing`　釣魚

600×800，直的 3:4。參考圖：`img/home.png`。

```
a small wooden pier over calm teal water on a sunny day, a fishing line dangling into the water where one big round shiny soap bubble floats, fluffy clouds, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-whack`　打地鼠

600×800，直的 3:4。參考圖：`img/home.png`。

```
a sunny vegetable garden with three round dark soil holes in soft grass, one round cream-colored ball peeking out of the middle hole, carrot leaves and small flowers around, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-memory`　翻牌

600×800，直的 3:4。參考圖：`img/home.png`。

```
four playing cards lying on a checked picnic blanket in the grass, two face down with a paw print on the back, two face up with plain white faces, a few daisies, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-match`　連連看

600×800，直的 3:4。參考圖：`img/home.png`。

```
a small cork board with two picture cards pinned on it, one of a cat and one of an apple, joined by a red yarn string, soft light, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-fill`　填空

600×800，直的 3:4。參考圖：`img/home.png`。

```
a wooden jigsaw puzzle board with one piece missing and that puzzle piece floating just above the gap with a soft glow, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-write`　寫給狗狗看

600×800，直的 3:4。參考圖：`img/home.png`。

```
a small slate chalkboard on a wooden easel next to a fat yellow pencil and crayons, on a sunny windowsill, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-speak`　唸給狗狗聽

600×800，直的 3:4。參考圖：`img/home.png`。

```
an old-fashioned round microphone on a little stand in a flower meadow, soft sound ripples and small musical notes floating out of it, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

## 三張遊戲背景

現在除了釣魚，每個遊戲都借用首頁的草原。上傳 img/home.png 當畫風參考。手機直拿只看得到中間，所以中間要安靜。

### `bg-garden`　打地鼠

1536×1024，橫的 3:2。參考圖：`img/home.png`。

```
a wide sunny vegetable garden meadow with a low wooden fence, sunflowers and bean poles at the far left and right, soft grass and brown earth across the lower half, distant hills and big clouds, wide 3:2 landscape format, the middle of the picture is open and calm with little detail because game pieces are placed on top, the nicer details stay near the left and right edges, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `bg-room`　翻牌、連連看、填空、寫字、唸

1536×1024，橫的 3:2。參考圖：`img/home.png`。

```
the cozy inside of a wooden treehouse classroom, sunlight through a round window with green leaves, bookshelves and potted plants at the left and right, a soft woven rug on the floor, warm and low contrast, wide 3:2 landscape format, the middle of the picture is open and calm with little detail because game pieces are placed on top, the nicer details stay near the left and right edges, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `bg-shop`　狗狗商店

1536×1024，橫的 3:2。參考圖：`img/home.png`。

```
a small cozy pet accessory shop, wooden shelves with colorful hats, scarves, bows and toys along the left and right walls, little bunting flags, warm afternoon light, wide 3:2 landscape format, the middle of the picture is open and calm with little detail because game pieces are placed on top, the nicer details stay near the left and right edges, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

## 74 個詞的圖

連連看和填空的圖，現在是表情符號。一次生九張，處理工具會自動切開。上傳 img/home.png 當畫風參考。生出來請確認九個東西的順序跟下面列的一樣。

### `words-1`　爸爸、媽媽、哥哥、姐姐、弟弟、妹妹、爺爺、奶奶、阿姨

切成每張 384×384，透明背景。參考圖：`img/home.png`。

三行三列，由左到右、由上到下：爸爸、媽媽、哥哥、姐姐、弟弟、妹妹、爺爺、奶奶、阿姨。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: dad; mom; older brother. Row 2, left to right: older sister; little brother; little sister. Row 3, left to right: grandpa; grandma; auntie.
```

### `words-2`　叔叔、小狗、小貓、小鳥、小魚、老虎、獅子、大象、兔子

切成每張 384×384，透明背景。參考圖：`img/home.png`。

三行三列，由左到右、由上到下：叔叔、小狗、小貓、小鳥、小魚、老虎、獅子、大象、兔子。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: uncle; puppy; kitten. Row 2, left to right: little bird; little fish; tiger. Row 3, left to right: lion; elephant; rabbit.
```

### `words-3`　猴子、熊貓、青蛙、蝴蝶、蘋果、香蕉、西瓜、麵包、牛奶

切成每張 384×384，透明背景。參考圖：`img/home.png`。

三行三列，由左到右、由上到下：猴子、熊貓、青蛙、蝴蝶、蘋果、香蕉、西瓜、麵包、牛奶。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: monkey; panda; frog. Row 2, left to right: butterfly; apple; banana. Row 3, left to right: watermelon; bread loaf; glass of milk.
```

### `words-4`　雞蛋、餅乾、糖果、蛋糕、米飯、水果、草莓、眼睛、鼻子

切成每張 384×384，透明背景。參考圖：`img/home.png`。

三行三列，由左到右、由上到下：雞蛋、餅乾、糖果、蛋糕、米飯、水果、草莓、眼睛、鼻子。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: egg; cookie; wrapped candy. Row 2, left to right: slice of cake; bowl of rice; bowl of mixed fruit. Row 3, left to right: strawberry; a pair of eyes; nose.
```

### `words-5`　耳朵、嘴巴、頭髮、牙齒、手指、腳丫、紅色、黃色、藍色

切成每張 384×384，透明背景。參考圖：`img/home.png`。

三行三列，由左到右、由上到下：耳朵、嘴巴、頭髮、牙齒、手指、腳丫、紅色、黃色、藍色。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: ear; smiling mouth; hair on a head, back view. Row 2, left to right: tooth; hand pointing one finger; bare foot. Row 3, left to right: red paint blob; yellow paint blob; blue paint blob.
```

### `words-6`　綠色、白色、黑色、粉紅、紫色、吃飯、睡覺、洗澡、刷牙

切成每張 384×384，透明背景。參考圖：`img/home.png`。

三行三列，由左到右、由上到下：綠色、白色、黑色、粉紅、紫色、吃飯、睡覺、洗澡、刷牙。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: green paint blob; white paint blob on light grey; black paint blob. Row 2, left to right: pink paint blob; purple paint blob; child eating rice with a spoon. Row 3, left to right: child sleeping in bed; child in a bathtub with bubbles; child brushing teeth.
```

### `words-7`　上學、玩具、書包、學校、老師、朋友、太陽、月亮、下雨

切成每張 384×384，透明背景。參考圖：`img/home.png`。

三行三列，由左到右、由上到下：上學、玩具、書包、學校、老師、朋友、太陽、月亮、下雨。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: child with backpack walking to school; pile of toys; school backpack. Row 2, left to right: school building; teacher at a blackboard; two children holding hands. Row 3, left to right: sun; crescent moon; rain cloud with raindrops.
```

### `words-8`　星星、冰淇淋、巧克力、幼兒園、腳踏車、洗衣機、電視機、小白兔、大野狼

切成每張 384×384，透明背景。參考圖：`img/home.png`。

三行三列，由左到右、由上到下：星星、冰淇淋、巧克力、幼兒園、腳踏車、洗衣機、電視機、小白兔、大野狼。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: star; ice cream cone; chocolate bar. Row 2, left to right: kindergarten building with playground; bicycle; washing machine. Row 3, left to right: television; white rabbit; grey wolf.
```

### `words-9`　小汽車、溜滑梯

切成每張 384×384，透明背景。參考圖：`img/home.png`。

一列，由左到右、由上到下：小汽車、溜滑梯。切開後存成 `img/words/<國字>.png`。

```
A single row of 2 separate small illustrations side by side, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Left to right: small car; playground slide.
```

## 注意

- 生出來的圖如果有文字或水印，重生或裁掉再放。
- 這些圖只在自己家裡用，不對外發布。
