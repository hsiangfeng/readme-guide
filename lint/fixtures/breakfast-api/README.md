# 巷口早餐店｜點餐 API

提供菜單與訂單資料給點餐網頁使用的後端 API。

狀態：維護中

## API 文件

- 本機：啟動後打開 `http://localhost:3000/api-docs`
- 線上：[點餐 API 文件](https://api.example.com/docs)

## 功能

- [x] 查詢菜單與價格
- [x] 建立訂單、查詢訂單狀態
- [ ] 線上付款（開發中）

## 使用技術

- Express 5
- Prisma 6
- PostgreSQL 16

## 安裝與執行

### 環境需求

- Node.js 22 以上
- pnpm 10
- PostgreSQL 16

### 安裝步驟

```bash
git clone https://github.com/zaocan/breakfast-api.git
cd breakfast-api
pnpm install
cp .env.example .env
```

## 建立資料庫

建立資料表並放入測試資料：

```bash
pnpm db:migrate
pnpm db:seed
```

## 使用方式

啟動伺服器：

```bash
pnpm dev
```

發送請求：

```bash
curl http://localhost:3000/api/menu
```

收到這樣的回應就成功了：

```json
{
  "items": [{ "id": 1, "name": "火腿蛋餅", "price": 45 }]
}
```

## 環境變數

| 名稱 | 必填 | 用途 | 去哪裡拿 |
| ---- | ---- | ---- | ---- |
| `DATABASE_URL` | 是 | PostgreSQL 的連線網址 | 用自己資料庫的帳號組成 |
| `PORT` | 否 | API 使用的埠號 | 不填就是 3000 |

## 資料夾結構

```text
src/     API 路由與處理訂單的程式
prisma/  資料表定義與測試資料
```

## 作者與聯絡

是 Ray 不是 Array｜hello@example.com

## 授權

MIT，全文見 [LICENSE](LICENSE)。
