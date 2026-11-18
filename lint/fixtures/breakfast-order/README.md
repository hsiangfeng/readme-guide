# 巷口早餐店｜線上點餐

讓客人用手機先點餐、到店直接取餐的網頁。

狀態：維護中

## 線上展示

[巷口早餐店線上點餐](https://zaocan.github.io/breakfast-order/)

## 畫面

![點餐頁：上方是分類標籤，下方列出餐點與價格，右下角是購物車按鈕](docs/images/order-page.png)

## 功能

- [x] 依分類瀏覽菜單與價格
- [x] 把餐點加進購物車、選擇取餐時間後送出訂單
- [ ] 線上付款（開發中）

## 使用技術

- Vue 3
- Vite 6
- Vitest 3

## 安裝與執行

### 環境需求

- Node.js 22 以上
- pnpm 10

### 安裝步驟

```bash
git clone https://github.com/zaocan/breakfast-order.git
cd breakfast-order
pnpm install
cp .env.example .env
pnpm dev
```

打開 http://localhost:5173，看到菜單就成功了。

### 執行測試

```bash
pnpm test
```

## 環境變數

| 名稱 | 必填 | 用途 | 去哪裡拿 |
| ---- | ---- | ---- | ---- |
| `VITE_API_BASE_URL` | 是 | 點餐 API 的網址 | 啟動點餐 API 後的網址 |
| `VITE_SHOP_PHONE` | 否 | 頁尾顯示的店家電話 | 店家提供 |

## 資料夾結構

```text
src/     頁面、元件與呼叫 API 的函式
public/  不經過打包、直接提供的檔案
docs/    README 用的截圖
```

## 作者與聯絡

是 Ray 不是 Array｜hello@example.com

## 授權

MIT，全文見 [LICENSE](LICENSE)。
