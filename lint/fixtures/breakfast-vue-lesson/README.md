# 巷口早餐店｜Vue 元件練習

用巷口早餐店的點餐頁，練習把畫面拆成 Vue 元件的課堂範例。

狀態：練習用

## 學習目標

完成這個範例後，你會學會：

- 把點餐頁拆成菜單卡片與購物車兩個元件
- 用 props 傳資料、用 emit 通知外層元件

## 對應單元

- 課程：Vue 入門實戰
- 單元：第 3 週
- 先備知識：第 2 週的 Vue 基本語法

## 使用技術

- Vue 3
- Vite 6

## 安裝與執行

### 環境需求

- Node.js 22 以上
- pnpm 10

### 安裝步驟

```bash
git clone https://github.com/zaocan/breakfast-vue-lesson.git
cd breakfast-vue-lesson
pnpm install
pnpm dev
```

打開 http://localhost:5173，看到菜單就成功了。

## 起始版與完成版

- 起始版（跟著課程寫）：`starter`
- 完成版（對照解答）：`solution`

切換到起始版：

```bash
git switch starter
```

## 使用方式

1. 打開 `src/components/MenuCard.vue`，照課堂說明完成練習。
2. 存檔後回到瀏覽器，確認看到每道餐點都變成一張卡片。

## 資料夾結構

```text
src/     練習用的頁面與元件
public/  不經過打包的靜態檔案
```

## 作者與聯絡

是 Ray 不是 Array｜hello@example.com

## 授權

MIT，全文見 [LICENSE](LICENSE)。
