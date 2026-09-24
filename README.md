# 注音救援隊

給 5 歲孩子練注音的網頁遊戲：聽一個音，從幾個符號裡選出對的。會依她的弱點自動調整出題，家長可以看進度、調難度。

## 玩

把 `dist` 整個資料夾複製到要玩的電腦，用 Chrome 開 `dist/index.html`。不用安裝、不用網路。`index.html` 旁邊的 `audio`、`img` 資料夾要一起帶著。

- 第一次進去先新增一個人，之後開機直接進上次那個人的首頁。
- 七個玩法：釣魚（聽音點泡泡）、打地鼠（聽音拍冒出來的符號）、翻牌（配對複習，不記進度）、連連看（詞的注音連到圖）、填空（詞的注音少一個音節，拖對的進去）、寫給狗狗看（低階描寫、高階聽寫，筆跡跟這題的候選符號比對）、唸給狗狗聽（看符號唸出來，用 Chrome 語音辨識，要連網，只記唸對）。詞只出現在連連看、填空、唸給狗狗聽。連連看和填空點圖會唸那個詞；詞的圖放 `img/words/<國字>.png`，沒放就用表情符號。
- 內容 19 組：37 個符號、22 個結合韻、72 個拼讀字（帶聲調）。
- 右上角齒輪 2 秒內連點三下進家長區：進度、難度、練習範圍、使用者管理、匯出匯入。
- 進度存在那台電腦的 Chrome 裡，換電腦要用家長區的匯出／匯入。

## 開發

```bash
npm test          # 單元測試（node 內建 test runner，零相依）
npm run build     # 把 src/ 合成 dist/index.html，並複製 audio/、img/
```

`src/` 是分檔的原始碼，`dist/` 是交付物。發音檔在 `audio/`（教育部手冊官方錄音，CC BY 4.0），圖在 `img/`（生圖後用 `tools/prep_images.py` 整理）。設計文件在 `docs/superpowers/specs/`。


## 部署到 Northflank

根目錄的 `Dockerfile` 兩段式：node 跑 `npm run build` 合成 `dist/`，再用 nginx 端出來，聽 8080。nginx 設定在 `deploy/nginx.conf`（index.html 不快取，錄音和圖片快取 30 天）。

Northflank 上建服務：Combined service → Git repo 選 `gundamhina/zhuyin-rescue`、分支 `master` → Build type 選 Dockerfile（路徑 `/Dockerfile`）→ Networking 加一個 port `8080`、HTTP、Public → 最小的 compute plan 就夠。之後每次 push master 會自動重建。

注意：存檔在瀏覽器 localStorage，綁網址。從本機 `dist/index.html` 換到 Northflank 網址時，先在舊的那邊家長區「匯出」，到新網址「匯入」。語音辨識要 HTTPS，Northflank 給的網址本來就是。


## 體驗

- **手感**：答對時星星從答對的東西爆開、骨頭飛進上方計數器、手機輕震。連續第一次就答對會出現火焰加數字，連 3 題多 2 根、連 5 題再多 3 根。特效在 `src/fx.js`。
- **教學**：每個玩法第一次玩先放小手示範動畫，按播放鍵才開始；遊戲左上的「？」可以再看。動畫在 `src/tutorial.js`，樣式在 `style.css` 的 `.tut-*`。
- **每日目標**：首頁上方火焰是連續天數，三個腳印是今天玩了幾局（翻牌不算），蓋滿開寶箱拿骨頭（30 根起，連續每天多 5 根，最多 60）。
- **今天推薦**：首頁發光的那張卡，是今天練最少的那一軌。
- **背景音樂**：只在選人、首頁、商店、結算放，進遊戲就停；首頁左下角可以關。

## 骨頭與商店

答對賺骨頭（第一次就對 2 根、重試才對 1 根、玩完一局送 3 根），首頁上方「商店」用骨頭買東西。翻牌是純遊玩，不算進星星和難度，骨頭只有配對一對 1 根。商店兩個分頁：

- **配件** 十六件（60～550 根），分頭上、臉上、脖子、背後，每個部位戴一件，戴在她的狗狗身上，首頁、遊戲、結算都看得到。表在 `src/art.js` 的 `ACCESSORIES`，每件是畫在狗狗 260×300 框裡的 SVG（背後那三件畫到框外才露得出來）。
- **救援隊員** 另外五隻狗狗，600 到 1800 根。買回家後站在首頁草地上，結算時一起跳舞。

商店畫面在 `src/shop.js`，家長區可以加減骨頭。六隻狗的 PNG 現在都是同一張複本，所以隊員多畫一條隊色領巾才分得出來；`img/dog-1.png` 到 `dog-5.png` 換成各自的圖之後，把 `dogSvg` 的 `mate` 領巾拿掉就好。

## 手機

舞台會跟著螢幕比例變形，不留邊：橫的高固定 800、寬 1200～1800，畫面元素排在正中央 1200×800 的 `.frame` 裡，背景鋪滿整個舞台；直的寬固定 800、高 1100～1800，每個畫面另有直版排法（CSS 的 `#stage.portrait` 加上各遊戲的 `layout()`）。舞台大小在 `STAGE`（ui.js），也寫成 CSS 變數 `--W`、`--H`。座標換算一律用 `stagePoint()`／`framePoint()`。背景用 `bgHtml()` 產生、`layoutBg()` 定位：草原蓋滿舞台，碼頭那張橫的靠左蓋滿、直的放大到占畫面下半貼左下、上面補天空色（釣魚的狗狗跟碼頭放在同一層，一起縮放）。手機碰畫面會進全螢幕（Android Chrome）。要更像 app 就用瀏覽器選單「加到主畫面」，`src/manifest.webmanifest` 設了全螢幕與橫向，圖示由 `tools/make_icons.py` 從 dog-0 做出來。

## 部署到 GitHub Pages（目前用這個）

repo 設成公開後，`.github/workflows/pages.yml` 會在每次 push master 時跑測試、build、部署到 https://gundamhina.github.io/zhuyin-rescue/ 。第一次跑會自動把 Pages 打開；如果沒有，到 repo 的 Settings → Pages，Source 選 GitHub Actions。
