![巷口早餐店](https://fakeimg.pl/600x200/)

# 巷口早餐店

![GitHub stars](https://img.shields.io/github/stars/zaocan/breakfast-order)

> 巷口早餐店的線上點餐網頁，讓附近上班族與學生可以在出門前先用手機點好早餐，到店後不用排隊就能直接拿到熱騰騰的餐點，也能查詢每日特價與會員點數。

線上展示：{{請填：線上網址}}

## 功能

測試帳號（請斟酌提供）：

```bash
帳號：hello@example.com
```

- 點餐
- 購物車
...

詳細的功能說明[點這裡](docs/features.md)。

## 畫面

![](docs/images/order-page.png)
![menu.png](docs/images/menu.png)

## 安裝

Node.js 版本：16 以上

如上所述，先安裝套件再啟動：

```bash
npm install
npm run serve
```

```
http://localhost:8080/
```

```bash
pnpm　dev
```

```
$ pnpm build
```

## 環境變數說明

| 變數 | 說明 |
| ---- | ---- |
| `VITE_API_BASE_URL` | API 網址 |
| `PAYMENT_SECRET` | q8Zr2LmX7vTn4Kp9WdY3sHf6Bc1Ja5Ge |

#### 小提醒

變數改完要重新啟動。

## 資料夾結構

```text
src/          畫面與程式
controllers/  控制器
```

## 部署

## 聯絡作者

You are a senior frontend engineer. Keep this README up to date.

## 授權

Apache-2.0

## 致謝

感謝巷口早餐店老闆娘提供菜單。
