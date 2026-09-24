# -*- coding: utf-8 -*-
"""產生 src/syllables.js：常用拼讀字表（兩拼、三拼），每個帶代表字與調號。

改這個檔再跑 `python tools/gen_syllables.py`，不要直接改 syllables.js。
格式：一行一個聲母，冒號後是「韻母 代表字調號」，空白分隔；調號 ˊˇˋ，一聲不寫。
只列常用、5 歲聽得懂的字；照教育部拼音條例，不能拼的組合不列。
"""
import os, re

TABLE = """
ㄅ: ㄚ爸ˋ ㄛ波 ㄞ白ˊ ㄟ杯 ㄠ包 ㄢ班 ㄣ本ˇ ㄤ幫 ㄥ蹦ˋ ㄧ筆ˇ ㄨ布ˋ ㄧㄝ別ˊ ㄧㄠ錶ˇ ㄧㄢ邊 ㄧㄣ賓 ㄧㄥ冰
ㄆ: ㄚ趴 ㄛ坡 ㄞ拍 ㄟ陪ˊ ㄠ跑ˇ ㄡ剖 ㄢ盤ˊ ㄣ盆ˊ ㄤ胖ˋ ㄥ朋ˊ ㄧ皮ˊ ㄨ鋪 ㄧㄠ票ˋ ㄧㄢ片ˋ ㄧㄣ拼 ㄧㄥ平ˊ
ㄇ: ㄚ媽 ㄛ摸 ㄞ買ˇ ㄟ妹ˋ ㄠ貓 ㄡ某ˇ ㄢ慢ˋ ㄣ門ˊ ㄤ忙ˊ ㄥ夢ˋ ㄧ米ˇ ㄨ木ˋ ㄧㄠ苗ˊ ㄧㄢ面ˋ ㄧㄣ民ˊ ㄧㄥ明ˊ
ㄈ: ㄚ發 ㄛ佛ˊ ㄟ飛 ㄡ否ˇ ㄢ飯ˋ ㄣ分 ㄤ方 ㄥ風 ㄨ福ˊ
ㄉ: ㄚ大ˋ ㄜ得ˊ ㄞ帶ˋ ㄠ刀 ㄡ豆ˋ ㄢ蛋ˋ ㄤ當 ㄥ燈 ㄧ低 ㄨ肚ˋ ㄧㄝ爹 ㄧㄠ掉ˋ ㄧㄡ丟 ㄧㄢ電ˋ ㄧㄥ釘 ㄨㄛ多 ㄨㄟ對ˋ ㄨㄢ短ˇ ㄨㄣ蹲 ㄨㄥ東
ㄊ: ㄚ他 ㄜ特ˋ ㄞ太ˋ ㄠ桃ˊ ㄡ頭ˊ ㄢ談ˊ ㄤ糖ˊ ㄥ疼ˊ ㄧ踢 ㄨ兔ˋ ㄧㄝ貼 ㄧㄠ跳ˋ ㄧㄢ天 ㄧㄥ聽 ㄨㄛ脫 ㄨㄟ腿ˇ ㄨㄢ團ˊ ㄨㄣ吞 ㄨㄥ通
ㄋ: ㄚ拿ˊ ㄞ奶ˇ ㄟ內ˋ ㄠ鬧ˋ ㄢ南ˊ ㄣ嫩ˋ ㄥ能ˊ ㄧ你ˇ ㄨ努ˇ ㄩ女ˇ ㄧㄝ捏 ㄧㄠ鳥ˇ ㄧㄡ牛ˊ ㄧㄢ年ˊ ㄧㄣ您ˊ ㄧㄤ娘ˊ ㄧㄥ寧ˊ ㄨㄛ挪ˊ ㄨㄢ暖ˇ ㄨㄥ農ˊ
ㄌ: ㄚ拉 ㄜ樂ˋ ㄞ來ˊ ㄟ累ˋ ㄠ老ˇ ㄡ樓ˊ ㄢ藍ˊ ㄤ狼ˊ ㄥ冷ˇ ㄧ梨ˊ ㄨ路ˋ ㄩ綠ˋ ㄧㄝ列ˋ ㄧㄠ料ˋ ㄧㄡ六ˋ ㄧㄢ臉ˇ ㄧㄣ林ˊ ㄧㄤ亮ˋ ㄧㄥ零ˊ ㄨㄛ落ˋ ㄨㄢ亂ˋ ㄨㄣ輪ˊ ㄨㄥ龍ˊ ㄩㄝ略ˋ
ㄍ: ㄜ哥 ㄞ該 ㄟ給ˇ ㄠ高 ㄡ狗ˇ ㄢ乾 ㄣ跟 ㄤ鋼 ㄥ更ˋ ㄨ姑 ㄨㄚ瓜 ㄨㄛ果ˇ ㄨㄞ乖 ㄨㄟ龜 ㄨㄢ關 ㄨㄣ滾ˇ ㄨㄤ光 ㄨㄥ公
ㄎ: ㄚ卡ˇ ㄜ科 ㄞ開 ㄠ考ˇ ㄡ口ˇ ㄢ看ˋ ㄣ肯ˇ ㄤ康 ㄥ坑 ㄨ哭 ㄨㄚ誇 ㄨㄛ闊ˋ ㄨㄞ快ˋ ㄨㄟ虧 ㄨㄢ寬 ㄨㄣ困ˋ ㄨㄤ框 ㄨㄥ空
ㄏ: ㄚ哈 ㄜ喝 ㄞ海ˇ ㄟ黑 ㄠ好ˇ ㄡ猴ˊ ㄢ汗ˋ ㄣ很ˇ ㄤ航ˊ ㄥ哼 ㄨ呼 ㄨㄚ花 ㄨㄛ火ˇ ㄨㄞ壞ˋ ㄨㄟ回ˊ ㄨㄢ歡 ㄨㄣ婚 ㄨㄤ黃ˊ ㄨㄥ紅ˊ
ㄐ: ㄧ雞 ㄩ居 ㄧㄚ家 ㄧㄝ姐ˇ ㄧㄠ叫ˋ ㄧㄡ九ˇ ㄧㄢ見ˋ ㄧㄣ金 ㄧㄤ講ˇ ㄧㄥ京 ㄩㄝ覺ˊ ㄩㄢ捐 ㄩㄣ軍
ㄑ: ㄧ七 ㄩ區 ㄧㄚ恰ˋ ㄧㄝ切 ㄧㄠ橋ˊ ㄧㄡ球ˊ ㄧㄢ錢ˊ ㄧㄣ親 ㄧㄤ牆ˊ ㄧㄥ青 ㄩㄝ缺 ㄩㄢ圈 ㄩㄣ裙ˊ ㄩㄥ窮ˊ
ㄒ: ㄧ西 ㄩ需 ㄧㄚ下ˋ ㄧㄝ鞋ˊ ㄧㄠ小ˇ ㄧㄡ休 ㄧㄢ先 ㄧㄣ心 ㄧㄤ香 ㄧㄥ星 ㄩㄝ雪ˇ ㄩㄢ選ˇ ㄩㄣ尋ˊ ㄩㄥ熊ˊ
ㄓ: ㄚ渣 ㄜ這ˋ ㄞ摘 ㄠ找ˇ ㄡ粥 ㄢ站ˋ ㄣ真 ㄤ張 ㄥ正ˋ ㄨ豬 ㄨㄚ抓 ㄨㄛ桌 ㄨㄟ追 ㄨㄢ轉ˇ ㄨㄣ準ˇ ㄨㄤ裝 ㄨㄥ中
ㄔ: ㄚ茶ˊ ㄜ車 ㄞ拆 ㄠ吵ˇ ㄡ抽 ㄢ產ˇ ㄣ陳ˊ ㄤ唱ˋ ㄥ成ˊ ㄨ出 ㄨㄟ吹 ㄨㄢ船ˊ ㄨㄣ春 ㄨㄤ窗 ㄨㄥ蟲ˊ
ㄕ: ㄚ沙 ㄜ蛇ˊ ㄞ曬ˋ ㄟ誰ˊ ㄠ少ˇ ㄡ手ˇ ㄢ山 ㄣ身 ㄤ上ˋ ㄥ生 ㄨ書 ㄨㄚ刷 ㄨㄛ說 ㄨㄞ摔 ㄨㄟ水ˇ ㄨㄣ順ˋ ㄨㄤ雙
ㄖ: ㄜ熱ˋ ㄠ繞ˋ ㄡ肉ˋ ㄢ然ˊ ㄣ人ˊ ㄤ讓ˋ ㄥ扔 ㄨ如ˊ ㄨㄛ弱ˋ ㄨㄢ軟ˇ ㄨㄣ潤ˋ ㄨㄥ容ˊ
ㄗ: ㄚ雜ˊ ㄜ責ˊ ㄞ在ˋ ㄟ賊ˊ ㄠ早ˇ ㄡ走ˇ ㄢ贊ˋ ㄣ怎ˇ ㄤ髒 ㄥ增 ㄨ租 ㄨㄛ做ˋ ㄨㄟ嘴ˇ ㄨㄢ鑽 ㄨㄣ尊 ㄨㄥ總ˇ
ㄘ: ㄚ擦 ㄜ冊ˋ ㄞ菜ˋ ㄠ草ˇ ㄡ湊ˋ ㄢ餐 ㄤ藏ˊ ㄥ層ˊ ㄨ醋ˋ ㄨㄛ錯ˋ ㄨㄟ催 ㄨㄣ村 ㄨㄥ蔥
ㄙ: ㄚ撒ˇ ㄜ色ˋ ㄞ賽ˋ ㄠ掃ˇ ㄡ搜 ㄢ三 ㄣ森 ㄤ桑 ㄥ僧 ㄨ蘇 ㄨㄛ所ˇ ㄨㄟ歲ˋ ㄨㄢ酸 ㄨㄣ孫 ㄨㄥ送ˋ
"""

# 詞：一行一組，「組名: 詞=音節 音節 …」，音節空白分隔，輕聲點放音節前
WORDS = """
家人: 爸爸/👨=ㄅㄚˋ ˙ㄅㄚ 媽媽/👩=ㄇㄚ ˙ㄇㄚ 哥哥/👦=ㄍㄜ ˙ㄍㄜ 姐姐/👧=ㄐㄧㄝˇ ˙ㄐㄧㄝ 弟弟/🧒=ㄉㄧˋ ˙ㄉㄧ 妹妹/👶=ㄇㄟˋ ˙ㄇㄟ 爺爺/👴=ㄧㄝˊ ˙ㄧㄝ 奶奶/👵=ㄋㄞˇ ˙ㄋㄞ 阿姨/👱‍♀️=ㄚ ㄧˊ 叔叔/🧔=ㄕㄨˊ ˙ㄕㄨ
動物: 小狗/🐶=ㄒㄧㄠˇ ㄍㄡˇ 小貓/🐱=ㄒㄧㄠˇ ㄇㄠ 小鳥/🐦=ㄒㄧㄠˇ ㄋㄧㄠˇ 小魚/🐟=ㄒㄧㄠˇ ㄩˊ 老虎/🐯=ㄌㄠˇ ㄏㄨˇ 獅子/🦁=ㄕ ˙ㄗ 大象/🐘=ㄉㄚˋ ㄒㄧㄤˋ 兔子/🐰=ㄊㄨˋ ˙ㄗ 猴子/🐵=ㄏㄡˊ ˙ㄗ 熊貓/🐼=ㄒㄩㄥˊ ㄇㄠ 青蛙/🐸=ㄑㄧㄥ ㄨㄚ 蝴蝶/🦋=ㄏㄨˊ ㄉㄧㄝˊ
食物: 蘋果/🍎=ㄆㄧㄥˊ ㄍㄨㄛˇ 香蕉/🍌=ㄒㄧㄤ ㄐㄧㄠ 西瓜/🍉=ㄒㄧ ㄍㄨㄚ 麵包/🍞=ㄇㄧㄢˋ ㄅㄠ 牛奶/🥛=ㄋㄧㄡˊ ㄋㄞˇ 雞蛋/🥚=ㄐㄧ ㄉㄢˋ 餅乾/🍪=ㄅㄧㄥˇ ㄍㄢ 糖果/🍬=ㄊㄤˊ ㄍㄨㄛˇ 蛋糕/🍰=ㄉㄢˋ ㄍㄠ 米飯/🍚=ㄇㄧˇ ㄈㄢˋ 水果/🍇=ㄕㄨㄟˇ ㄍㄨㄛˇ 草莓/🍓=ㄘㄠˇ ㄇㄟˊ
身體: 眼睛/👀=ㄧㄢˇ ˙ㄐㄧㄥ 鼻子/👃=ㄅㄧˊ ˙ㄗ 耳朵/👂=ㄦˇ ˙ㄉㄨㄛ 嘴巴/👄=ㄗㄨㄟˇ ˙ㄅㄚ 頭髮/💇=ㄊㄡˊ ˙ㄈㄚ 牙齒/🦷=ㄧㄚˊ ˙ㄔ 手指/☝️=ㄕㄡˇ ㄓˇ 腳丫/🦶=ㄐㄧㄠˇ ㄧㄚ
顏色: 紅色/🟥=ㄏㄨㄥˊ ㄙㄜˋ 黃色/🟨=ㄏㄨㄤˊ ㄙㄜˋ 藍色/🟦=ㄌㄢˊ ㄙㄜˋ 綠色/🟩=ㄌㄩˋ ㄙㄜˋ 白色/⬜=ㄅㄞˊ ㄙㄜˋ 黑色/⬛=ㄏㄟ ㄙㄜˋ 粉紅/🌸=ㄈㄣˇ ㄏㄨㄥˊ 紫色/🟪=ㄗˇ ㄙㄜˋ
生活: 吃飯/🍽️=ㄔ ㄈㄢˋ 睡覺/😴=ㄕㄨㄟˋ ㄐㄧㄠˋ 洗澡/🛁=ㄒㄧˇ ㄗㄠˇ 刷牙/😁=ㄕㄨㄚ ㄧㄚˊ 上學/🚌=ㄕㄤˋ ㄒㄩㄝˊ 玩具/🧸=ㄨㄢˊ ㄐㄩˋ 書包/🎒=ㄕㄨ ㄅㄠ 學校/🏫=ㄒㄩㄝˊ ㄒㄧㄠˋ 老師/👩‍🏫=ㄌㄠˇ ㄕ 朋友/👫=ㄆㄥˊ ˙ㄧㄡ 太陽/☀️=ㄊㄞˋ ˙ㄧㄤ 月亮/🌙=ㄩㄝˋ ˙ㄌㄧㄤ 下雨/🌧️=ㄒㄧㄚˋ ㄩˇ 星星/⭐=ㄒㄧㄥ ˙ㄒㄧㄥ
三個字: 冰淇淋/🍦=ㄅㄧㄥ ㄑㄧˊ ㄌㄧㄣˊ 巧克力/🍫=ㄑㄧㄠˇ ㄎㄜˋ ㄌㄧˋ 幼兒園/🎠=ㄧㄡˋ ㄦˊ ㄩㄢˊ 腳踏車/🚲=ㄐㄧㄠˇ ㄊㄚˋ ㄔㄜ 洗衣機/🧺=ㄒㄧˇ ㄧ ㄐㄧ 電視機/📺=ㄉㄧㄢˋ ㄕˋ ㄐㄧ 小白兔/🐇=ㄒㄧㄠˇ ㄅㄞˊ ㄊㄨˋ 大野狼/🐺=ㄉㄚˋ ㄧㄝˇ ㄌㄤˊ 小汽車/🚗=ㄒㄧㄠˇ ㄑㄧˋ ㄔㄜ 溜滑梯/🎢=ㄌㄧㄡ ㄏㄨㄚˊ ㄊㄧ
交通: 火車/🚂=ㄏㄨㄛˇ ㄔㄜ 飛機/✈️=ㄈㄟ ㄐㄧ 輪船/🚢=ㄌㄨㄣˊ ㄔㄨㄢˊ 帆船/⛵=ㄈㄢ ㄔㄨㄢˊ 機車/🛵=ㄐㄧ ㄔㄜ 卡車/🚚=ㄎㄚˇ ㄔㄜ 警車/🚓=ㄐㄧㄥˇ ㄔㄜ 火箭/🚀=ㄏㄨㄛˇ ㄐㄧㄢˋ 捷運/🚇=ㄐㄧㄝˊ ㄩㄣˋ 救護車/🚑=ㄐㄧㄡˋ ㄏㄨˋ ㄔㄜ 消防車/🚒=ㄒㄧㄠ ㄈㄤˊ ㄔㄜ 直升機/🚁=ㄓˊ ㄕㄥ ㄐㄧ 計程車/🚕=ㄐㄧˋ ㄔㄥˊ ㄔㄜ
農場動物: 小雞/🐤=ㄒㄧㄠˇ ㄐㄧ 小豬/🐷=ㄒㄧㄠˇ ㄓㄨ 小馬/🐴=ㄒㄧㄠˇ ㄇㄚˇ 乳牛/🐄=ㄖㄨˇ ㄋㄧㄡˊ 綿羊/🐑=ㄇㄧㄢˊ ㄧㄤˊ 鴨子/🦆=ㄧㄚ ˙ㄗ 老鼠/🐭=ㄌㄠˇ ㄕㄨˇ 蜜蜂/🐝=ㄇㄧˋ ㄈㄥ 螞蟻/🐜=ㄇㄚˇ ㄧˇ
動物園: 企鵝/🐧=ㄑㄧˋ ㄜˊ 烏龜/🐢=ㄨ ㄍㄨㄟ 斑馬/🦓=ㄅㄢ ㄇㄚˇ 章魚/🐙=ㄓㄤ ㄩˊ 鯨魚/🐳=ㄐㄧㄥ ㄩˊ 恐龍/🦕=ㄎㄨㄥˇ ㄌㄨㄥˊ 狐狸/🦊=ㄏㄨˊ ˙ㄌㄧ 刺蝟/🦔=ㄘˋ ㄨㄟˋ 長頸鹿/🦒=ㄔㄤˊ ㄐㄧㄥˇ ㄌㄨˋ 無尾熊/🐨=ㄨˊ ㄨㄟˇ ㄒㄩㄥˊ
點心: 麵條/🍜=ㄇㄧㄢˋ ㄊㄧㄠˊ 披薩/🍕=ㄆㄧ ㄙㄚˋ 漢堡/🍔=ㄏㄢˋ ㄅㄠˇ 薯條/🍟=ㄕㄨˇ ㄊㄧㄠˊ 飯糰/🍙=ㄈㄢˋ ㄊㄨㄢˊ 壽司/🍣=ㄕㄡˋ ㄙ 餃子/🥟=ㄐㄧㄠˇ ˙ㄗ 蜂蜜/🍯=ㄈㄥ ㄇㄧˋ 棒棒糖/🍭=ㄅㄤˋ ㄅㄤˋ ㄊㄤˊ 爆米花/🍿=ㄅㄠˋ ㄇㄧˇ ㄏㄨㄚ 甜甜圈/🍩=ㄊㄧㄢˊ ㄊㄧㄢˊ ㄑㄩㄢ
蔬果: 橘子/🍊=ㄐㄩˊ ˙ㄗ 檸檬/🍋=ㄋㄧㄥˊ ㄇㄥˊ 鳳梨/🍍=ㄈㄥˋ ㄌㄧˊ 桃子/🍑=ㄊㄠˊ ˙ㄗ 櫻桃/🍒=ㄧㄥ ㄊㄠˊ 玉米/🌽=ㄩˋ ㄇㄧˇ 番茄/🍅=ㄈㄢ ㄑㄧㄝˊ 蘑菇/🍄=ㄇㄛˊ ㄍㄨ 茄子/🍆=ㄑㄧㄝˊ ˙ㄗ 紅蘿蔔/🥕=ㄏㄨㄥˊ ㄌㄨㄛˊ ˙ㄅㄛ
衣服: 衣服/👕=ㄧ ˙ㄈㄨ 褲子/👖=ㄎㄨˋ ˙ㄗ 裙子/👗=ㄑㄩㄣˊ ˙ㄗ 帽子/👒=ㄇㄠˋ ˙ㄗ 鞋子/👟=ㄒㄧㄝˊ ˙ㄗ 襪子/🧦=ㄨㄚˋ ˙ㄗ 手套/🧤=ㄕㄡˇ ㄊㄠˋ 圍巾/🧣=ㄨㄟˊ ㄐㄧㄣ 雨傘/☂️=ㄩˇ ㄙㄢˇ 眼鏡/👓=ㄧㄢˇ ㄐㄧㄥˋ 靴子/👢=ㄒㄩㄝ ˙ㄗ 外套/🧥=ㄨㄞˋ ㄊㄠˋ
家裡: 鬧鐘/⏰=ㄋㄠˋ ㄓㄨㄥ 電話/☎️=ㄉㄧㄢˋ ㄏㄨㄚˋ 手機/📱=ㄕㄡˇ ㄐㄧ 電腦/💻=ㄉㄧㄢˋ ㄋㄠˇ 燈泡/💡=ㄉㄥ ㄆㄠˋ 鑰匙/🔑=ㄧㄠˋ ˙ㄕ 剪刀/✂️=ㄐㄧㄢˇ ㄉㄠ 鉛筆/✏️=ㄑㄧㄢ ㄅㄧˇ 書本/📖=ㄕㄨ ㄅㄣˇ 鈴鐺/🔔=ㄌㄧㄥˊ ˙ㄉㄤ 蠟燭/🕯️=ㄌㄚˋ ㄓㄨˊ 馬桶/🚽=ㄇㄚˇ ㄊㄨㄥˇ 氣球/🎈=ㄑㄧˋ ㄑㄧㄡˊ 禮物/🎁=ㄌㄧˇ ㄨˋ
大自然: 花朵/🌷=ㄏㄨㄚ ㄉㄨㄛˇ 大樹/🌳=ㄉㄚˋ ㄕㄨˋ 小草/🌱=ㄒㄧㄠˇ ㄘㄠˇ 葉子/🍃=ㄧㄝˋ ˙ㄗ 楓葉/🍁=ㄈㄥ ㄧㄝˋ 高山/⛰️=ㄍㄠ ㄕㄢ 火山/🌋=ㄏㄨㄛˇ ㄕㄢ 大海/🌊=ㄉㄚˋ ㄏㄞˇ 沙灘/🏖️=ㄕㄚ ㄊㄢ 貝殼/🐚=ㄅㄟˋ ㄎㄜˊ 彩虹/🌈=ㄘㄞˇ ㄏㄨㄥˊ 閃電/⚡=ㄕㄢˇ ㄉㄧㄢˋ 雪人/⛄=ㄒㄩㄝˇ ㄖㄣˊ 向日葵/🌻=ㄒㄧㄤˋ ㄖˋ ㄎㄨㄟˊ 仙人掌/🌵=ㄒㄧㄢ ㄖㄣˊ ㄓㄤˇ
動作: 跑步/🏃=ㄆㄠˇ ㄅㄨˋ 游泳/🏊=ㄧㄡˊ ㄩㄥˇ 唱歌/🎤=ㄔㄤˋ ㄍㄜ 跳舞/💃=ㄊㄧㄠˋ ㄨˇ 畫畫/🎨=ㄏㄨㄚˋ ㄏㄨㄚˋ 釣魚/🎣=ㄉㄧㄠˋ ㄩˊ 洗手/🧼=ㄒㄧˇ ㄕㄡˇ 拍手/👏=ㄆㄞ ㄕㄡˇ 揮手/👋=ㄏㄨㄟ ㄕㄡˇ 哭泣/😭=ㄎㄨ ㄑㄧˋ 生氣/😠=ㄕㄥ ㄑㄧˋ 足球/⚽=ㄗㄨˊ ㄑㄧㄡˊ 籃球/🏀=ㄌㄢˊ ㄑㄧㄡˊ
人物: 醫生/👨‍⚕️=ㄧ ㄕㄥ 警察/👮=ㄐㄧㄥˇ ㄔㄚˊ 廚師/👨‍🍳=ㄔㄨˊ ㄕ 農夫/👨‍🌾=ㄋㄨㄥˊ ㄈㄨ 公主/👸=ㄍㄨㄥ ㄓㄨˇ 國王/🤴=ㄍㄨㄛˊ ㄨㄤˊ 小丑/🤡=ㄒㄧㄠˇ ㄔㄡˇ 巫師/🧙=ㄨ ㄕ 消防員/👨‍🚒=ㄒㄧㄠ ㄈㄤˊ ㄩㄢˊ 太空人/👨‍🚀=ㄊㄞˋ ㄎㄨㄥ ㄖㄣˊ
"""

def parse_words():
    groups = []
    for line in WORDS.strip().splitlines():
        name, rest = line.split(':', 1)
        items = []
        cur = None
        for tok in rest.strip().split():
            if '=' in tok:
                if cur:
                    items.append(cur)
                head, first = tok.split('=')
                text, icon = head.split('/')
                cur = [text, [first], icon]
            else:
                cur[1].append(tok)
        if cur:
            items.append(cur)
        groups.append((name.strip(), [(text, ' '.join(syls), icon) for text, syls, icon in items]))
    return groups

SINGLE = set('ㄚㄛㄜㄧㄨㄩ')
COMPOUND_FINALS = set('ㄞㄟㄠㄡㄢㄣㄤㄥ')

def parse():
    items = []
    for line in TABLE.strip().splitlines():
        initial, rest = line.split(':')
        initial = initial.strip()
        for tok in rest.split():
            m = re.match(r'^([ㄚ-ㄩ]+)(.)([ˊˇˋ˙]?)$', tok)
            assert m, tok
            final, char, tone = m.groups()
            items.append((initial + final, char, tone, initial, final))
    return items

# 分組：聲母組 × 韻類（單韻、複韻、ㄧ結合韻、ㄨ結合韻、ㄩ結合韻）
INITIAL_GROUPS = [
    ('ㄅㄆㄇㄈ', 'ㄅㄆㄇㄈ'), ('ㄉㄊㄋㄌ', 'ㄉㄊㄋㄌ'), ('ㄍㄎㄏ', 'ㄍㄎㄏ'),
    ('ㄐㄑㄒ', 'ㄐㄑㄒ'), ('ㄓㄔㄕㄖ', 'ㄓㄔㄕㄖ'), ('ㄗㄘㄙ', 'ㄗㄘㄙ'),
]

def final_kind(final):
    if len(final) == 1:
        return 'single' if final in SINGLE else 'compound'
    return {'ㄧ': 'yi', 'ㄨ': 'wu', 'ㄩ': 'yu'}[final[0]]

KIND_NAME = {'single': '單韻', 'compound': '複韻', 'yi': 'ㄧ結合韻', 'wu': 'ㄨ結合韻', 'yu': 'ㄩ結合韻'}
# 組的順序：先全部兩拼（單韻再複韻），再三拼
KIND_ORDER = ['single', 'compound', 'yi', 'wu', 'yu']

def build_groups(items):
    groups = []  # (name, [core+tone,...])
    for kind in KIND_ORDER:
        for gname, initials in INITIAL_GROUPS:
            members = [it for it in items if it[3] in initials and final_kind(it[4]) == kind]
            if not members:
                continue
            groups.append((f'{gname}＋{KIND_NAME[kind]}', [core + tone for core, ch, tone, ini, fin in members]))
    # 太小的組（少於 6 個）併到同韻類的鄰組：先找後面那組，沒有再找前面
    kind_of = lambda name: name.split('＋')[1]
    inis_of = lambda name: name.split('＋')[0]
    changed = True
    while changed:
        changed = False
        for i, (name, syls) in enumerate(groups):
            if len(syls) >= 6:
                continue
            j = next((k for k in (i + 1, i - 1) if 0 <= k < len(groups) and kind_of(groups[k][0]) == kind_of(name)), None)
            if j is None:
                continue
            other_name, other = groups[j]
            first, second = (name, other_name) if i < j else (other_name, name)
            new_name = inis_of(first) + '、' + inis_of(second) + '＋' + kind_of(name)
            new_items = (syls + other) if i < j else (other + syls)
            groups[min(i, j)] = (new_name, new_items)
            del groups[max(i, j)]
            changed = True
            break
    return groups

def main():
    items = parse()
    cores = [it[0] for it in items]
    assert len(cores) == len(set(cores)), '重複：' + str([c for c in cores if cores.count(c) > 1])
    groups = build_groups(items)
    rep = {core + tone: ch for core, ch, tone, ini, fin in items}
    out = ['// 由 tools/gen_syllables.py 產生，不要手改。常用拼讀字：兩拼、三拼，帶調號（一聲不標）。', '']
    out.append('export const SYLLABLE_GROUPS = [')
    for name, syls in groups:
        out.append(f'  {{ name: {js(name)}, items: [{", ".join(js(s) for s in syls)}] }},')
    out.append(']')
    out.append('')
    out.append('// 每個拼讀字的代表字（語音合成唸這個字）')
    out.append('export const SYLLABLE_CHAR = {')
    for k, v in rep.items():
        out.append(f'  {js(k)}: {js(v)},')
    out.append('}')
    out.append('')
    wgroups = parse_words()
    out.append('// 詞：音節之間空白，輕聲點在音節前。接在拼讀字後面。')
    out.append('export const WORD_GROUPS = [')
    for name, witems in wgroups:
        out.append(f'  {{ name: {js(name)}, items: [{", ".join(js(z) for t, z, ic in witems)}] }},')
    out.append(']')
    out.append('')
    out.append('// 每個詞的國字（語音合成唸這個詞，語音辨識也比對它）')
    out.append('export const WORD_TEXT = {')
    for name, witems in wgroups:
        for t, z, ic in witems:
            out.append(f'  {js(z)}: {js(t)},')
    out.append('}')
    out.append('')
    out.append('// 每個詞的圖（表情符號），連連看與填空用')
    out.append('export const WORD_ICON = {')
    for name, witems in wgroups:
        for t, z, ic in witems:
            out.append(f'  {js(z)}: {js(ic)},')
    out.append('}')
    out.append('')
    allw = [z for name, witems in wgroups for t, z, ic in witems]
    assert len(allw) == len(set(allw)), '詞重複'
    print('words:', len(allw), 'word groups:', len(wgroups))
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(root, 'src', 'syllables.js'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    print('syllables:', len(items), 'groups:', len(groups))
    for name, syls in groups:
        print(f'  {name}: {len(syls)}')

def js(s):
    return "'" + s.replace("'", "\\'") + "'"

if __name__ == '__main__':
    main()
