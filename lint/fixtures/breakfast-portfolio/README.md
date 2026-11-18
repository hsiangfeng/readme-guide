# 巷口早餐店｜線上點餐（作品集）

我替巷口早餐店做的手機點餐網頁，客人先點餐、到店直接取餐。

狀態：已完成

## 線上展示

[巷口早餐店線上點餐](https://example.com/breakfast-order/)

## 畫面

![點餐頁：上方是分類標籤，下方列出餐點與價格](docs/images/order-page.png)

## 功能

- [x] 依分類瀏覽菜單與價格
- [x] 選擇取餐時間後送出訂單

## 我負責的部分

- 全部由我獨立完成，包含畫面設計與前端程式

## 使用技術

- Vue 3
- Vite 6

## 為什麼這樣做

- 購物車金額集中在一個函式計算：畫面只負責顯示，金額算錯時只要查一個地方；放棄了在每個元件各自加總的寫法

## 安裝與執行

### 環境需求

- Node.js 22 以上
- pnpm 10

### 安裝步驟

```bash
git clone https://github.com/zaocan/breakfast-portfolio.git
cd breakfast-portfolio
pnpm install
cp .env.example .env
pnpm dev
```

打開 http://localhost:5173，看到菜單就成功了。

## 環境變數

| 名稱 | 必填 | 用途 | 去哪裡拿 |
| ---- | ---- | ---- | ---- |
| `VITE_API_BASE_URL` | 是 | 點餐 API 的網址 | 啟動點餐 API 後的網址 |

## 資料夾結構

```text
src/     頁面、元件與購物車計算
public/  不經過打包的靜態檔案
docs/    README 用的截圖
```

## 作者與聯絡

是 Ray 不是 Array｜hello@example.com

## 授權

MIT，全文見 [LICENSE](LICENSE)。
