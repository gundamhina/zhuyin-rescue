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


## 部署到 GitHub Pages（目前用這個）

repo 設成公開後，`.github/workflows/pages.yml` 會在每次 push master 時跑測試、build、部署到 https://gundamhina.github.io/zhuyin-rescue/ 。第一次跑會自動把 Pages 打開；如果沒有，到 repo 的 Settings → Pages，Source 選 GitHub Actions。
