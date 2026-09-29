# 圖片插槽

把 PNG 放進這個資料夾，檔名照下面對，遊戲就會用圖片蓋掉向量圖。沒放的維持原樣。

這份檔案由 `tools/make_art_pack.py` 從 `tools/art_list.py` 產生，要改提示詞請改 `art_list.py` 再重跑。

## 已經有的

| 檔名 | 用途 |
|---|---|
| `scene.jpg` | 釣魚遊戲背景（左下角木碼頭，狗狗坐在上面） |
| `home.jpg` | 選人、首頁、結算的背景；也是其他背景還沒生之前的備用 |
| `dog-0.png` … `dog-5.png` | 六隻救援狗（透明背景 PNG）。dog-0 是其他五隻的參考圖 |
| `card-*.jpg`、`bg-*.jpg` | 首頁卡片、遊戲背景（不透明，存 JPG 比較小） |
| `icon-*.png` | 手機桌面圖示，`tools/make_icons.py` 從 dog-0 做出來 |

## 怎麼把生好的圖放進來

1. 生好的圖照下面的檔名改名（副檔名 jpg、png 都可以），丟進 `img/raw/`。
2. 在專案根目錄跑 `python tools/prep_images.py`，它會照檔名自動裁切、縮放、去背、切九宮格。
3. `npm run build`。

## 用 Gemini 生圖的訣竅

- **狗狗要用改圖**：上傳 `img/dog-0.png`，貼提示詞，請它「改這張圖」。只改毛色和裝備，姿勢和畫風才會一樣。
- **狗狗用藍底**：鬆餅狗是白毛，白底一去背會連毛一起不見，所以提示詞裡指定純藍底。
- **卡片、背景、詞的圖**：上傳 `img/home.jpg`，加一句「用這張圖的畫風」，整套才會統一。
- **比例**：Gemini 不一定照比例出圖，沒關係，處理工具會從中間裁；重要的東西放中間就好。
- **有字就重生**：生圖常冒出亂碼文字，有字的圖會很突兀。

風格基底（每條提示詞都已經加上）：

```
hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

## 第一步：隊長 dog-0

救援隊改成六種動物，畫風是水彩加彩色鉛筆的卡通貼紙風。先生隊長這張，畫風定了再做其他五位。不用上傳參考圖，直接貼提示詞。生好照檔名放進 img/raw/ 跑 prep_images.py，新的 dog-0 就換上去了。

### `dog-0`　警察柴犬（隊長，先生這張）

520×600，透明背景。參考圖：`None`。

```
A Shiba Inu puppy with cream and orange fur, standing on its hind legs and giving a cheerful salute with its right paw. It wears a soft round blue police cap with a small round golden team badge with a white bone and a little star on it on the front, and a blue vest with a thin white reflective stripe. Full body, centered, the character fills about 80 percent of the picture height, facing mostly toward the viewer so the face is clearly visible. cute cartoon baby animal character, hand-drawn watercolor and colored pencil illustration, soft pencil outlines, big friendly round eyes, gentle smile, children's picture book style, an ORIGINAL character design that does not resemble any existing cartoon, TV show or toy character, no paw print symbols, no shield shaped badges, no text, no letters, no numbers, no watermark. Put the character on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

## 其他五位救援隊員

小象、兔子、小熊、河狸、小貓。全部是原創角色，帽子、制服、隊徽都跟現有卡通錯開（網站是公開的）。上傳新的 img/dog-0.png 當畫風參考，請 Gemini 照同樣的畫風和大小重畫。每位的動物和動作都不一樣，但看起來像同一個畫家畫的。

### `dog-1`　消防象

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Use the attached picture only as a style reference. Draw a NEW character in exactly the same drawing style, the same line quality and coloring, the same size and framing as the reference, but with its own pose: a baby elephant with soft grey skin and big round ears, wearing a red firefighter helmet with a wide round brim and a red jacket with two yellow stripes, sitting and happily spraying a small arc of water from its raised trunk. It has a small round golden team badge with a white bone and a little star on it on its hat or vest. Full body, centered, the character fills about 80 percent of the picture height, facing mostly toward the viewer so the face is clearly visible. It must be an original character, not like any existing cartoon. Put the character on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

### `dog-2`　醫護兔

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Use the attached picture only as a style reference. Draw a NEW character in exactly the same drawing style, the same line quality and coloring, the same size and framing as the reference, but with its own pose: a fluffy white baby bunny with long upright ears, wearing a pink nurse cap with a small white heart and a pink vest, standing and holding a small pink first-aid box with a heart on it in both paws (no red cross symbol). It has a small round golden team badge with a white bone and a little star on it on its hat or vest. Full body, centered, the character fills about 80 percent of the picture height, facing mostly toward the viewer so the face is clearly visible. It must be an original character, not like any existing cartoon. Put the character on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

### `dog-3`　森林熊

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Use the attached picture only as a style reference. Draw a NEW character in exactly the same drawing style, the same line quality and coloring, the same size and framing as the reference, but with its own pose: a brown bear cub with round ears, wearing a green forest ranger hat with a leaf on it and a green vest, standing and looking through small binoculars held in both paws. It has a small round golden team badge with a white bone and a little star on it on its hat or vest. Full body, centered, the character fills about 80 percent of the picture height, facing mostly toward the viewer so the face is clearly visible. It must be an original character, not like any existing cartoon. Put the character on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

### `dog-4`　工程河狸

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Use the attached picture only as a style reference. Draw a NEW character in exactly the same drawing style, the same line quality and coloring, the same size and framing as the reference, but with its own pose: a baby beaver with brown fur, two big front teeth and a flat tail, wearing a round orange construction hard hat and an orange safety vest with reflective stripes, standing and proudly holding up a small wooden hammer in one paw. It has a small round golden team badge with a white bone and a little star on it on its hat or vest. Full body, centered, the character fills about 80 percent of the picture height, facing mostly toward the viewer so the face is clearly visible. It must be an original character, not like any existing cartoon. Put the character on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

### `dog-5`　廚師貓

520×600，透明背景。參考圖：`img/dog-0.png`。

```
Use the attached picture only as a style reference. Draw a NEW character in exactly the same drawing style, the same line quality and coloring, the same size and framing as the reference, but with its own pose: an orange tabby kitten with a striped tail, wearing a tall white chef hat and a yellow apron, standing and flipping a pancake in a small frying pan. It has a small round golden team badge with a white bone and a little star on it on its hat or vest. Full body, centered, the character fills about 80 percent of the picture height, facing mostly toward the viewer so the face is clearly visible. It must be an original character, not like any existing cartoon. Put the character on a plain solid bright blue background (pure #1E4BFF), no shadow, no gradient, no checkerboard pattern.
```

## 首頁的玩法卡片

首頁一打開就看到，現在是向量畫的卡片。上傳 img/home.jpg 當畫風參考，說「用這張圖的畫風」。

### `card-fishing`　釣魚

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
a small wooden pier over calm teal water on a sunny day, a fishing line dangling into the water where one big round shiny soap bubble floats, fluffy clouds, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-whack`　打地鼠

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
a sunny vegetable garden with three round dark soil holes in soft grass, one round cream-colored ball peeking out of the middle hole, carrot leaves and small flowers around, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-memory`　翻牌

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
four playing cards lying on a checked picnic blanket in the grass, two face down with a paw print on the back, two face up with plain white faces, a few daisies, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-match`　連連看

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
a small cork board with two picture cards pinned on it, one of a cat and one of an apple, joined by a red yarn string, soft light, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-fill`　填空

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
a wooden jigsaw puzzle board with one piece missing and that puzzle piece floating just above the gap with a soft glow, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-tone`　聲調填空

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
a row of four little wooden music bells on a windowsill, each a different height like steps going up and down, a small songbird perched on the tallest one, soft morning light, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-write`　寫給狗狗看

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
a small slate chalkboard on a wooden easel next to a fat yellow pencil and crayons, on a sunny windowsill, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-learn`　學寫字

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
a small wooden writing board on an easel with one big brush stroke glowing softly on it, a fat pencil with a tiny arrow ribbon, a few paper stars around, on a sunny windowsill, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `card-speak`　唸給狗狗聽

600×800，直的 3:4。參考圖：`img/home.jpg`。

```
an old-fashioned round microphone on a little stand in a flower meadow, soft sound ripples and small musical notes floating out of it, vertical 3:4 portrait format, one clear centered subject with big simple shapes, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

## 三張遊戲背景

現在除了釣魚，每個遊戲都借用首頁的草原。上傳 img/home.jpg 當畫風參考。手機直拿只看得到中間，所以中間要安靜。

### `bg-garden`　打地鼠

1536×1024，橫的 3:2。參考圖：`img/home.jpg`。

```
a wide sunny vegetable garden meadow with a low wooden fence, sunflowers and bean poles at the far left and right, soft grass and brown earth across the lower half, distant hills and big clouds, wide 3:2 landscape format, the middle of the picture is open and calm with little detail because game pieces are placed on top, the nicer details stay near the left and right edges, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `bg-room`　翻牌、連連看、填空、寫字、唸

1536×1024，橫的 3:2。參考圖：`img/home.jpg`。

```
the cozy inside of a wooden treehouse classroom, sunlight through a round window with green leaves, bookshelves and potted plants at the left and right, a soft woven rug on the floor, warm and low contrast, wide 3:2 landscape format, the middle of the picture is open and calm with little detail because game pieces are placed on top, the nicer details stay near the left and right edges, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

### `bg-shop`　狗狗商店

1536×1024，橫的 3:2。參考圖：`img/home.jpg`。

```
a small cozy pet accessory shop, wooden shelves with colorful hats, scarves, bows and toys along the left and right walls, little bunting flags, warm afternoon light, wide 3:2 landscape format, the middle of the picture is open and calm with little detail because game pieces are placed on top, the nicer details stay near the left and right edges, hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark
```

## 詞的圖

連連看和填空的圖，現在是表情符號。一次生九張，處理工具會自動切開。上傳 img/home.jpg 當畫風參考。生出來請確認九個東西的順序跟下面列的一樣。

### `words-1`　爸爸、媽媽、哥哥、姐姐、弟弟、妹妹、爺爺、奶奶、阿姨

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：爸爸、媽媽、哥哥、姐姐、弟弟、妹妹、爺爺、奶奶、阿姨。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: dad; mom; older brother. Row 2, left to right: older sister; little brother; little sister. Row 3, left to right: grandpa; grandma; auntie.
```

### `words-2`　叔叔、小狗、小貓、小鳥、小魚、老虎、獅子、大象、兔子

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：叔叔、小狗、小貓、小鳥、小魚、老虎、獅子、大象、兔子。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: uncle; puppy; kitten. Row 2, left to right: little bird; little fish; tiger. Row 3, left to right: lion; elephant; rabbit.
```

### `words-3`　猴子、熊貓、青蛙、蝴蝶、蘋果、香蕉、西瓜、麵包、牛奶

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：猴子、熊貓、青蛙、蝴蝶、蘋果、香蕉、西瓜、麵包、牛奶。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: monkey; panda; frog. Row 2, left to right: butterfly; apple; banana. Row 3, left to right: watermelon; bread loaf; glass of milk.
```

### `words-4`　雞蛋、餅乾、糖果、蛋糕、米飯、水果、草莓、眼睛、鼻子

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：雞蛋、餅乾、糖果、蛋糕、米飯、水果、草莓、眼睛、鼻子。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: egg; cookie; wrapped candy. Row 2, left to right: slice of cake; bowl of rice; bowl of mixed fruit. Row 3, left to right: strawberry; a pair of eyes; nose.
```

### `words-5`　耳朵、嘴巴、頭髮、牙齒、手指、腳丫、紅色、黃色、藍色

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：耳朵、嘴巴、頭髮、牙齒、手指、腳丫、紅色、黃色、藍色。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: ear; smiling mouth; hair on a head, back view. Row 2, left to right: tooth; hand pointing one finger; bare foot. Row 3, left to right: red paint blob; yellow paint blob; blue paint blob.
```

### `words-6`　綠色、白色、黑色、粉紅、紫色、吃飯、睡覺、洗澡、刷牙

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：綠色、白色、黑色、粉紅、紫色、吃飯、睡覺、洗澡、刷牙。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: green paint blob; white paint blob on light grey; black paint blob. Row 2, left to right: pink paint blob; purple paint blob; child eating rice with a spoon. Row 3, left to right: child sleeping in bed; child in a bathtub with bubbles; child brushing teeth.
```

### `words-7`　上學、玩具、書包、學校、老師、朋友、太陽、月亮、下雨

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：上學、玩具、書包、學校、老師、朋友、太陽、月亮、下雨。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: child with backpack walking to school; pile of toys; school backpack. Row 2, left to right: school building; teacher at a blackboard; two children holding hands. Row 3, left to right: sun; crescent moon; rain cloud with raindrops.
```

### `words-8`　星星、冰淇淋、巧克力、幼兒園、腳踏車、洗衣機、電視機、小白兔、大野狼

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：星星、冰淇淋、巧克力、幼兒園、腳踏車、洗衣機、電視機、小白兔、大野狼。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: star; ice cream cone; chocolate bar. Row 2, left to right: kindergarten building with playground; bicycle; washing machine. Row 3, left to right: television; white rabbit; grey wolf.
```

### `words-9`　小汽車、溜滑梯、火車、飛機、輪船、帆船、機車、卡車、警車

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：小汽車、溜滑梯、火車、飛機、輪船、帆船、機車、卡車、警車。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: small car; playground slide; steam train. Row 2, left to right: airplane; big ship; sailboat. Row 3, left to right: scooter; truck; police car.
```

### `words-10`　火箭、捷運、救護車、消防車、直升機、計程車、小雞、小豬、小馬

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：火箭、捷運、救護車、消防車、直升機、計程車、小雞、小豬、小馬。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: rocket; metro train; ambulance. Row 2, left to right: fire engine; helicopter; yellow taxi. Row 3, left to right: baby chick; piglet; pony.
```

### `words-11`　乳牛、綿羊、鴨子、老鼠、蜜蜂、螞蟻、企鵝、烏龜、斑馬

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：乳牛、綿羊、鴨子、老鼠、蜜蜂、螞蟻、企鵝、烏龜、斑馬。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: dairy cow; fluffy sheep; duck. Row 2, left to right: little mouse; honeybee; ant. Row 3, left to right: penguin; turtle; zebra.
```

### `words-12`　章魚、鯨魚、恐龍、狐狸、刺蝟、長頸鹿、無尾熊、麵條、披薩

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：章魚、鯨魚、恐龍、狐狸、刺蝟、長頸鹿、無尾熊、麵條、披薩。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: octopus; whale; friendly dinosaur. Row 2, left to right: fox; hedgehog; giraffe. Row 3, left to right: koala; bowl of noodles; slice of pizza.
```

### `words-13`　漢堡、薯條、飯糰、壽司、餃子、蜂蜜、棒棒糖、爆米花、甜甜圈

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：漢堡、薯條、飯糰、壽司、餃子、蜂蜜、棒棒糖、爆米花、甜甜圈。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: hamburger; french fries; rice ball. Row 2, left to right: sushi; dumplings; honey pot. Row 3, left to right: lollipop; popcorn; donut.
```

### `words-14`　橘子、檸檬、鳳梨、桃子、櫻桃、玉米、番茄、蘑菇、茄子

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：橘子、檸檬、鳳梨、桃子、櫻桃、玉米、番茄、蘑菇、茄子。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: orange (fruit); lemon; pineapple. Row 2, left to right: peach; cherries; corn cob. Row 3, left to right: tomato; mushroom; eggplant.
```

### `words-15`　紅蘿蔔、衣服、褲子、裙子、帽子、鞋子、襪子、手套、圍巾

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：紅蘿蔔、衣服、褲子、裙子、帽子、鞋子、襪子、手套、圍巾。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: carrot; t-shirt; trousers. Row 2, left to right: dress; sun hat; sneakers. Row 3, left to right: socks; mittens; knitted scarf.
```

### `words-16`　雨傘、眼鏡、靴子、外套、鬧鐘、電話、手機、電腦、燈泡

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：雨傘、眼鏡、靴子、外套、鬧鐘、電話、手機、電腦、燈泡。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: umbrella; eyeglasses; rain boots. Row 2, left to right: coat; alarm clock; old telephone. Row 3, left to right: mobile phone; laptop computer; light bulb.
```

### `words-17`　鑰匙、剪刀、鉛筆、書本、鈴鐺、蠟燭、馬桶、氣球、禮物

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：鑰匙、剪刀、鉛筆、書本、鈴鐺、蠟燭、馬桶、氣球、禮物。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: key; scissors; pencil. Row 2, left to right: open book; bell; candle. Row 3, left to right: toilet; balloon; gift box.
```

### `words-18`　花朵、大樹、小草、葉子、楓葉、高山、火山、大海、沙灘

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：花朵、大樹、小草、葉子、楓葉、高山、火山、大海、沙灘。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: tulip flower; big tree; little sprout. Row 2, left to right: green leaves; red maple leaf; mountain. Row 3, left to right: volcano; sea waves; sandy beach.
```

### `words-19`　貝殼、彩虹、閃電、雪人、向日葵、仙人掌、跑步、游泳、唱歌

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：貝殼、彩虹、閃電、雪人、向日葵、仙人掌、跑步、游泳、唱歌。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: seashell; rainbow; lightning bolt. Row 2, left to right: snowman; sunflower; cactus. Row 3, left to right: child running; child swimming; child singing with a microphone.
```

### `words-20`　跳舞、畫畫、釣魚、洗手、拍手、揮手、哭泣、生氣、足球

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：跳舞、畫畫、釣魚、洗手、拍手、揮手、哭泣、生氣、足球。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: child dancing; child painting with a palette; fishing rod catching a fish. Row 2, left to right: washing hands with soap; clapping hands; waving hand. Row 3, left to right: crying child; angry child; soccer ball.
```

### `words-21`　籃球、醫生、警察、廚師、農夫、公主、國王、小丑、巫師

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：籃球、醫生、警察、廚師、農夫、公主、國王、小丑、巫師。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: basketball; doctor; police officer. Row 2, left to right: chef; farmer; princess. Row 3, left to right: king; clown; friendly wizard.
```

### `words-22`　消防員、太空人、螃蟹、海豚、鯊魚、瓢蟲、蝸牛、毛毛蟲、蜘蛛

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：消防員、太空人、螃蟹、海豚、鯊魚、瓢蟲、蝸牛、毛毛蟲、蜘蛛。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: firefighter; astronaut; crab. Row 2, left to right: dolphin; shark; ladybug. Row 3, left to right: snail; caterpillar; spider.
```

### `words-23`　蚊子、蟋蟀、老鷹、鸚鵡、天鵝、鴿子、袋鼠、河馬、犀牛

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：蚊子、蟋蟀、老鷹、鸚鵡、天鵝、鴿子、袋鼠、河馬、犀牛。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: mosquito; cricket; eagle. Row 2, left to right: parrot; swan; dove. Row 3, left to right: kangaroo; hippo; rhinoceros.
```

### `words-24`　駱駝、松鼠、蝙蝠、鱷魚、山羊、鋼琴、吉他、小提琴、喇叭

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：駱駝、松鼠、蝙蝠、鱷魚、山羊、鋼琴、吉他、小提琴、喇叭。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: camel; squirrel; bat. Row 2, left to right: crocodile; goat; piano. Row 3, left to right: guitar; violin; trumpet.
```

### `words-25`　麥克風、音樂、耳機、網球、排球、棒球、羽球、滑雪、衝浪

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：麥克風、音樂、耳機、網球、排球、棒球、羽球、滑雪、衝浪。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: microphone; musical notes; headphones. Row 2, left to right: tennis ball; volleyball; baseball. Row 3, left to right: badminton shuttlecock and racket; skiing child; surfing child.
```

### `words-26`　溜冰、滑板、拳擊、風箏、拼圖、骰子、積木、帳篷、摩天輪

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：溜冰、滑板、拳擊、風箏、拼圖、骰子、積木、帳篷、摩天輪。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: ice skate; skateboard; boxing glove. Row 2, left to right: kite; jigsaw puzzle piece; dice. Row 3, left to right: toy building blocks; tent; ferris wheel.
```

### `words-27`　城堡、皇冠、寶石、生日、聖誕樹、煙火、燈籠、紅包、南瓜

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：城堡、皇冠、寶石、生日、聖誕樹、煙火、燈籠、紅包、南瓜。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: castle; crown; gem. Row 2, left to right: birthday cake with candles; christmas tree; fireworks. Row 3, left to right: red paper lantern; red envelope; pumpkin.
```

### `words-28`　雲朵、雪花、颱風、冰塊、火焰、水滴、松樹、玫瑰、沙漠

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：雲朵、雪花、颱風、冰塊、火焰、水滴、松樹、玫瑰、沙漠。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: fluffy cloud; snowflake; typhoon swirl. Row 2, left to right: ice cube; flame; water drop. Row 3, left to right: pine tree; rose; desert with cactus.
```

### `words-29`　流星、地球、牛排、熱狗、三明治、布丁、咖啡、果汁、火鍋

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：流星、地球、牛排、熱狗、三明治、布丁、咖啡、果汁、火鍋。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: shooting star; planet earth; steak. Row 2, left to right: hot dog; sandwich; pudding. Row 3, left to right: cup of coffee; juice box; hot pot.
```

### `words-30`　便當、咖哩、沙拉、起司、湯匙、筷子、叉子、刀子、奶瓶

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：便當、咖哩、沙拉、起司、湯匙、筷子、叉子、刀子、奶瓶。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: bento box; curry rice; salad bowl. Row 2, left to right: cheese; spoon; chopsticks. Row 3, left to right: fork; kitchen knife; baby bottle.
```

### `words-31`　芒果、椰子、馬鈴薯、地瓜、辣椒、大蒜、洋蔥、花生、栗子

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：芒果、椰子、馬鈴薯、地瓜、辣椒、大蒜、洋蔥、花生、栗子。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: mango; coconut; potato. Row 2, left to right: sweet potato; red chili pepper; garlic. Row 3, left to right: onion; peanuts; chestnut.
```

### `words-32`　梨子、沙發、椅子、大門、掃把、相機、電池、信封、月曆

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：梨子、沙發、椅子、大門、掃把、相機、電池、信封、月曆。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: pear; sofa; chair. Row 2, left to right: door; broom; camera. Row 3, left to right: battery; envelope; calendar.
```

### `words-33`　地圖、手錶、床鋪、護士、畫家、歌手、科學家、工人、偵探

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：地圖、手錶、床鋪、護士、畫家、歌手、科學家、工人、偵探。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: map; wristwatch; bed. Row 2, left to right: nurse; painter; singer. Row 3, left to right: scientist; construction worker; detective.
```

### `words-34`　天使、美人魚、超人、精靈、機器人、大笑、害怕、驚訝、思考

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：天使、美人魚、超人、精靈、機器人、大笑、害怕、驚訝、思考。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: angel; mermaid; superhero. Row 2, left to right: elf; robot; laughing face. Row 3, left to right: scared face; surprised face; thinking face.
```

### `words-35`　發燒、擁抱、愛心、噴嚏、醫院、房子、郵局、銀行、工廠

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：發燒、擁抱、愛心、噴嚏、醫院、房子、郵局、銀行、工廠。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: face with thermometer; hugging face; red heart. Row 2, left to right: sneezing face; hospital; house. Row 3, left to right: post office; bank; factory.
```

### `words-36`　教堂、紅綠燈、加油站、飛碟、拖拉機、纜車、魷魚、龍蝦、熱帶魚

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：教堂、紅綠燈、加油站、飛碟、拖拉機、纜車、魷魚、龍蝦、熱帶魚。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: church; traffic light; gas station. Row 2, left to right: flying saucer; tractor; cable car. Row 3, left to right: squid; lobster; tropical fish.
```

### `words-37`　河豚、麋鹿、獵豹、哈密瓜、綠茶、月餅、刨冰、鹽巴、奶油

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：河豚、麋鹿、獵豹、哈密瓜、綠茶、月餅、刨冰、鹽巴、奶油。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: pufferfish; deer with antlers; cheetah. Row 2, left to right: melon; cup of green tea; mooncake. Row 3, left to right: shaved ice dessert; salt shaker; butter.
```

### `words-38`　青菜、汽水、蠟筆、毛筆、原子筆、迴紋針、放大鏡、望遠鏡、顯微鏡

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：青菜、汽水、蠟筆、毛筆、原子筆、迴紋針、放大鏡、望遠鏡、顯微鏡。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: leafy green vegetable; soda cup with straw; crayon. Row 2, left to right: paintbrush; pen; paperclip. Row 3, left to right: magnifying glass; telescope; microscope.
```

### `words-39`　磁鐵、鐵鎚、收音機、衛生紙、海綿、口罩、藥丸、針筒、繃帶

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：磁鐵、鐵鎚、收音機、衛生紙、海綿、口罩、藥丸、針筒、繃帶。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: horseshoe magnet; hammer; radio. Row 2, left to right: toilet paper roll; sponge; face with mask. Row 3, left to right: pill; syringe; adhesive bandage.
```

### `words-40`　聽診器、錢包、鈔票、手提包、高跟鞋、涼鞋、領帶、泳衣、口紅

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：聽診器、錢包、鈔票、手提包、高跟鞋、涼鞋、領帶、泳衣、口紅。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: stethoscope; purse; banknote. Row 2, left to right: handbag; high heel shoe; sandal. Row 3, left to right: shirt and necktie; swimsuit; lipstick.
```

### `words-41`　戒指、安全帽、電車、賽車、吉普車、獨木舟、快艇、貨車、降落傘

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：戒指、安全帽、電車、賽車、吉普車、獨木舟、快艇、貨車、降落傘。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: ring; rescue helmet; tram. Row 2, left to right: racing car; jeep; canoe. Row 3, left to right: speedboat; truck; parachute.
```

### `words-42`　火車站、郵輪、龍捲風、稻穗、滿月、銀河、噴泉、寺廟、鐵塔

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：火車站、郵輪、龍捲風、稻穗、滿月、銀河、噴泉、寺廟、鐵塔。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: train station; cruise ship; tornado. Row 2, left to right: rice stalks; full moon; milky way. Row 3, left to right: fountain; temple; tall tower.
```

### `words-43`　旅館、商店、石像、鬼魂、衛兵、飛行員、法官、學生、老人

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：旅館、商店、石像、鬼魂、衛兵、飛行員、法官、學生、老人。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: hotel; store; stone statue. Row 2, left to right: friendly ghost; guard; pilot. Row 3, left to right: judge; student; old person.
```

### `words-44`　新娘、新郎、走路、舉手、鞠躬、寫字、握手、祈禱、攀岩

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：新娘、新郎、走路、舉手、鞠躬、寫字、握手、祈禱、攀岩。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: bride; groom; walking person. Row 2, left to right: raising hand; bowing person; writing hand. Row 3, left to right: handshake; praying hands; rock climbing.
```

### `words-45`　肌肉、舌頭、大腦、骨頭、撲克牌、保齡球、獎牌、金牌、鞭炮

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：肌肉、舌頭、大腦、骨頭、撲克牌、保齡球、獎牌、金牌、鞭炮。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: flexed arm muscle; tongue; brain. Row 2, left to right: bone; playing card; bowling. Row 3, left to right: medal; gold medal; firecracker.
```

### `words-46`　電影、門票、國旗、水母、海豹、珊瑚、蟑螂、蚯蚓、甲蟲

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：電影、門票、國旗、水母、海豹、珊瑚、蟑螂、蚯蚓、甲蟲。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: movie clapperboard; ticket; flags. Row 2, left to right: jellyfish; seal; coral. Row 3, left to right: cockroach; earthworm; beetle.
```

### `words-47`　烏鴉、驢子、狗熊、茶壺、鏡子、窗戶、牙刷、梳子、扇子

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：烏鴉、驢子、狗熊、茶壺、鏡子、窗戶、牙刷、梳子、扇子。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: crow; donkey; bear. Row 2, left to right: teapot; mirror; window. Row 3, left to right: toothbrush; comb; folding fan.
```

### `words-48`　拖鞋、梯子、鋸子、盆栽、石頭、木頭、奶茶、硬幣、救生圈

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

三行三列，由左到右、由上到下：拖鞋、梯子、鋸子、盆栽、石頭、木頭、奶茶、硬幣、救生圈。切開後存成 `img/words/<國字>.png`。

```
A 3 by 3 grid of nine separate small illustrations, each centered in its own cell, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Row 1, left to right: flip-flop slippers; ladder; saw. Row 2, left to right: potted plant; rock; wood log. Row 3, left to right: bubble tea; coin; life ring.
```

### `words-49`　泡泡、羽毛、翅膀、手風琴、橄欖

切成每張 384×384，透明背景。參考圖：`img/home.jpg`。

一列，由左到右、由上到下：泡泡、羽毛、翅膀、手風琴、橄欖。切開後存成 `img/words/<國字>.png`。

```
A single row of 5 separate small illustrations side by side, with wide plain white gaps between them, on a plain pure white background. All the same size and the same style: hand-painted watercolor and gouache illustration in the style of a 1990s Japanese animated film, soft edges, warm natural light, gentle pastel colors, children's picture book mood, no text, no letters, no numbers, no watermark. No borders, no labels. Left to right: bubbles; feather; wing; accordion; olives.
```

## 注意

- 生出來的圖如果有文字或水印，重生或裁掉再放。
- 網站是公開的：不要生任何現有卡通的角色、名字或標誌（例如汪汪隊的爪印盾牌徽章）。
