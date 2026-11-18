# 「每一塊的完整寫法」內容檔

網站上八塊各有一頁完整寫法，內容放在這裡：`<語言>/<塊的代稱>.json`。語言是 `zh-TW` 與 `en`，塊的代稱照 `rules/blocks.json`（`title`、`demo`、`features`、`tech`、`install`、`env`、`structure`、`license`）。兩種語言的結構要一一對應。

頁面上的編號、塊的名稱、上一塊與下一塊、檢查項目清單，都是網站從 `rules/` 讀的，內容檔不用寫，也不要寫死「第幾塊」。

## 欄位

| 欄位 | 內容 |
| ---- | ---- |
| `slug` | 塊的代稱，跟檔名一樣 |
| `headings` | 這一塊在 README 裡固定的標題，含井字號，照 `rules/headings.json` 的正式標題。一塊有兩個標題就寫兩個 |
| `why` | 為什麼要有這一塊，一到兩句。寫讀的人會怎樣，不是寫規定 |
| `question` | 讀的人心裡在問的那一句，不加引號 |
| `questionNote` | 補一句這一塊在順序上的位置，十幾個字 |
| `who` | 誰要寫，例如「四種專案都必填」 |
| `whoNote` | 補充一句例外或提醒，十幾個字 |
| `partsTitle` | 「這一塊要有三樣東西」這種小標，數字跟 `parts` 的數量一致 |
| `parts` | 這一塊要有的東西，二到四項。每項：`heading`（有固定小標題就寫含井字號的標題，沒有就寫名稱）、`need`（`required` 必填、`optional` 選填、`conditional` 有條件才必填，條件寫在 `text` 裡）、`text`（一到兩句說明）、`emphasis`（選填，接在後面最重要的一句；沒有就不要放這個欄位） |
| `before` | 改之前的 README 片段：`lines` 是一行一個項目 |
| `notes` | 改之前那份的問題，二到四個。每個：`title`（十個字上下）、`text`（一句，二十個字以內）、`rules`（選填，檢查工具會抓的規則代號，必須是 `rules/rules.json` 裡有的） |
| `after` | 改之後的 README 片段：`lines` 是一行一個字串 |
| `tip` | 一個實用的提醒：`title` 與 `paragraphs`（一到兩段） |
| `types` | 四種專案在這一塊各自要注意的事，鍵是 `web-app`、`course-example`、`portfolio`、`backend-api`，各一到兩句 |

## `before.lines` 的寫法

- 沒有問題的行直接寫字串，空行寫空字串 `""`。
- 有問題的行寫成物件：`{ "text": "請先安裝[[最新版]]的 Node.js。", "notes": [1] }`。
  - 用 `[[` 和 `]]` 把有問題的那幾個字包起來，畫面上會畫底線。
  - `notes` 是這一行對到 `notes` 的第幾個問題（從 1 開始）。
- 每一個 `notes` 的問題至少要被一行指到。

## 寫的時候

- `before` 與 `after` 是同一個專案的同一段，讓人一眼看出差在哪。範例專案用「巷口早餐店｜線上點餐」（讓客人用手機先點餐、到店直接取餐的網頁，資料夾叫 `breakfast-order`，clone 網址 `https://github.com/zaocan/breakfast-order.git`，用 pnpm 10、Node.js 22、Vue 3、Vite 6，跟 `lint/fixtures/breakfast-order/` 是同一個專案）；英文版用同一個專案，名稱寫 Corner Breakfast。
- `after` 自己要通過檢查工具：標題用正式名稱、指令放標了語言的程式碼區塊、前面不加 `$`、圖片有替代文字。
- 每行不要超過 58 個半形字元的寬度（一個中文字算兩個），畫面才不會折行。
- `notes` 裡查不到對應規則的問題就不要填 `rules`，畫面會顯示「工具看不出來，要自己確認」。
- 範例裡的網址用 `example.com`、`localhost`，信箱用 `hello@example.com`。
