# rules：README 規則的單一來源

檢查工具（`lint/`）、給 AI 的撰寫規則（`skills/readme-guide/`）、網站（`site/`）都從這個資料夾讀規則。要改八塊的順序、標題名稱、某類型的必填章節、規則的文字，只改這裡。

全部是純 JSON，不用建置：Node 用 `readFileSync` 讀，網站可以直接 `import`。

## 檔案

| 檔案 | 內容 |
| ---- | ---- |
| `blocks.json` | 三個問題組與八塊。**八塊的順序就是 `blocks` 陣列的順序**，編號（01–08）由位置算出來，不另外寫。 |
| `headings.json` | 每個章節的正式標題（繁中、英文）、可接受的別名、屬於哪一塊、建議的標題層級。 |
| `project-types.json` | 四種專案類型，各自的必填、選填與類型專屬章節。 |
| `rules.json` | 每一條規則的代號、塊、嚴重度、適用類型、是否要對照專案檔案、狀態、文字。 |
| `conventions.json` | 範本待填文字的寫法、一句話說明的長度上限、專案狀態的寫法。 |

## blocks.json

```json
{
  "groups": [{ "id": "what", "question": { "zh-TW": "這是什麼？", "en": "What is it?" } }],
  "blocks": [{ "slug": "title", "group": "what", "name": { "zh-TW": "…", "en": "…" }, "summary": { "zh-TW": "…", "en": "…" } }]
}
```

- `slug` 是穩定的英文代稱，其他檔案都用它指到某一塊，順序調整時不用改。
- 要調整順序，只要搬動 `blocks` 陣列裡的位置。檢查工具的「章節順序」規則與輸出的編號會跟著變。

## headings.json

```json
{
  "sections": [
    {
      "id": "tech",
      "block": "tech",
      "level": 2,
      "title": { "zh-TW": "使用技術", "en": "Tech Stack" },
      "aliases": { "zh-TW": ["專案技術", "…"], "en": ["Built With", "…"] }
    }
  ],
  "combined": [{ "sections": ["demo", "screenshots"], "aliases": { "zh-TW": ["線上展示與畫面"], "en": ["Demo and Screenshots"] } }]
}
```

- 一塊可以有好幾個章節，例如第 2 塊有「線上展示」「畫面」，後端 API 還有「API 文件」。
- `level` 是建議的標題層級。同一個名稱出現在兩個章節時（例如英文的 Installation 同時是「安裝與執行」的別名、也是「安裝步驟」的正式名稱），檢查工具用標題層級分辨。
- 比對標題時不分大小寫，會先去掉表情符號、前面的編號（`1.`、`一、`）、結尾的冒號與括號補充（「環境需求（本機）」）。雙語標題（「功能 / Features」）任一邊對得上就算。
- `combined` 是一個標題同時涵蓋好幾個章節的寫法。

## project-types.json

```json
{
  "default": "web-app",
  "types": [{ "id": "web-app", "name": { … }, "description": { … }, "required": ["features", "…"], "optional": ["demo", "…"], "typeSpecific": [] }]
}
```

- `required`：缺了就是錯誤（規則 STR006）。後端 API 的「API 文件」雖然列在必填，缺少時由 TYPE-API001 報，STR006 不重複報。
- `optional`：可以有、也可以沒有。
- `typeSpecific`：這個類型多出來的章節（課程範例的「學習目標」、作品集的「我負責的部分」……）。其中有些另有專門的規則提醒（例如 TYPE-PF001）。
- 有條件的要求不放在這裡，由規則處理：「有 `.env.example` 才必填環境變數」是 ENV001；「授權」四種類型都是選填，專案有授權檔或 package.json 寫了具體的授權時才必填，是 LIC001（公司內部或不公開的專案可以不寫）。

## rules.json

每條規則的欄位：

| 欄位 | 說明 |
| ---- | ---- |
| `id` | 規則代號，例如 `CMD004`。檢查工具、給 AI 的規則、網站都用這個代號。 |
| `block` | 屬於哪一塊（`blocks.json` 的 `slug`）；`null` 表示「看問題出現在哪一個章節」。 |
| `relatedBlocks` | 選填，只會出現在 `block` 是 `null` 的規則。這條規則雖然哪裡都可能出現，可是跟這幾塊最相關（例如圖片的規則跟「線上展示與畫面」）；網站在那一塊的完整寫法頁會一起列出來。檢查工具不讀這個欄位。 |
| `category` | 分類，對到 `categories`。`unfinished`（還沒填完）這一類是範本本來就會有的問題。 |
| `severity` | `error`（錯誤）或 `warning`（警告），只有這兩級。有錯誤時檢查工具的結束代碼是 1。 |
| `types` | 適用的專案類型。 |
| `needsProject` | `true` 表示要對照專案檔案（package.json、鎖定版本的檔案、`.env.example`、`LICENSE`、圖片檔）。只有一份 README 時會跳過，並在輸出說明。 |
| `status` | `implemented`（已實作）或 `planned`（規劃中）。 |
| `title`、`description`、`fix` | 繁中與英文的標題、說明、怎麼修。會直接顯示在網站與指令列。 |
| `messages` | 檢查工具輸出的訊息，`{名稱}` 是會被換掉的參數。兩種語言的參數要一樣。 |
| `example` | 選填。改之前與改成的 README 片段，網站顯示成「改之前／改成」。格式見下面。 |

### example

```json
"example": {
  "zh-TW": { "before": ["- Node.js 16 以上"], "after": ["- Node.js 22 以上"] },
  "en": { "before": ["- Node.js 16 or later"], "after": ["- Node.js 22 or later"] }
}
```

- 每個元素是一行 README，`before` 與 `after` 各一到五行；`""` 是空行。
- `before` 可以是空陣列，表示「原本缺了這一段」（例如缺少章節），網站只顯示「改成」。
- 單獨一行的 `…` 表示中間省略的內容（例如章節順序的例子只列標題）。
- 例子都用同一個範例專案：巷口早餐店｜線上點餐（英文 Corner Breakfast），資料夾 `breakfast-order`，pnpm、Vue 3、Vite 6、Vitest 3、Node.js 22。完整的 README 在 `lint/fixtures/breakfast-order/README.md`（英文是 `README.en.md`）。另外三種類型「範本填完的樣子」延續同一家店：課程範例 `lint/fixtures/breakfast-vue-lesson/`、作品集 `lint/fixtures/breakfast-portfolio/`、後端 API `lint/fixtures/breakfast-api/`（網頁專案的 `VITE_API_BASE_URL` 指的就是它），各有繁中 `README.md` 與英文 `README.en.md`。
- `after` 必須原封不動出現在範例專案那份全部通過的 README 裡，`before` 換進去之後必須被這條規則抓到；`lint/test/examples.test.js` 會檢查。
- 修法是補檔案、不是改 README 的規則（例如 LIC003）不放例子。

文字都是純文字：顯示時直接當文字輸出，不要丟進會解讀大括號的翻譯套件（說明裡會出現 `{{請填：…}}` 這種範本寫法）。

## conventions.json

- `placeholder`：範本的待填寫法。每個要填的地方寫成 `{{請填：說明}}`（英文範本寫 `{{FILL: description}}`），成品留下任何一個都會被 STR015 抓到。網址或指令裡的待填處不要有空白，例如 `{{請填：帳號}}`、`{{FILL:owner}}`。範本除了待填文字以外，其他規則都要能通過。
- `placeholder.syntaxMention`：說明只有刪節號的待填寫法（`{{請填：…}}`、`{{FILL: ...}}`，刪節號前後可以有空白）是在介紹這個寫法本身，STR015 不報。文件或文章要提到待填寫法時就這樣寫；範本裡真正的待填處一定要寫說明文字。
- `oneLiner.maxLength`：一句話說明的長度上限（中文 60 字、英文 120 字元）。中文的上限是暫定值，之後依實際使用調整。
- `status`：專案狀態行的開頭（「狀態：」「Status:」）與常見的狀態寫法。

## 改規則時

1. 改這裡的 JSON。
2. 規則從「規劃中」改成「已實作」時，同時在 `lint/src/checks/` 加上實作，並在 `lint/test/rules.test.js` 加上「會過」與「不會過」各一份測試資料。
3. 在 `lint/` 底下跑 `node --test`。測試會確認欄位齊全、代號不重複、已實作的規則都有程式和測試資料，也會確認文字裡沒有 AI 廠商或產品名稱。
