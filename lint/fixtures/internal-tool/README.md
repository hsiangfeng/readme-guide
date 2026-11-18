# 巷口早餐店｜門市後台

店員用來看今日訂單、把餐點標成「已完成」的內部網頁。

狀態：維護中

## 線上展示

[門市後台（只有店內網路連得到）](https://admin.breakfast.internal/)

## 功能

- 依取餐時間列出今日訂單
- 把做好的餐點標成「已完成」，客人手機會收到通知

## 使用技術

- Vue 3
- Vite 6

## 安裝與執行

### 環境需求

- Node.js 22
- pnpm 10

### 安裝步驟

```bash
git clone https://git.breakfast.internal/shop/breakfast-admin.git
cd breakfast-admin
pnpm install
cp .env.example .env
pnpm dev
```

### 執行測試

```bash
pnpm test
```

## 環境變數

| 變數 | 必填 | 用途 |
| ---- | ---- | ---- |
| `VITE_API_BASE_URL` | 必填 | 點餐 API 的內網網址 |

## 資料夾結構

```text
src/     畫面與程式
public/  不經過打包的靜態檔案
```

## 維護團隊

門市系統組。有問題請在公司聊天室的「#門市系統」頻道發問。
