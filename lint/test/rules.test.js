// 每一條已實作的規則：至少一份「會過」與一份「不會過」的測試資料。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintReadme } from '../src/lint.js';
import { memoryProject } from '../src/project.js';
import { data } from '../src/data.js';

// 一份每條規則都會過的網頁專案 README
const BASE = `# 早餐點餐

讓客人用手機先點餐、到店直接取餐的網頁。

狀態：維護中

## 線上展示

[早餐點餐線上展示（GitHub Pages）](https://example.com/demo/)

## 畫面

![點餐頁：上方是分類，下方列出餐點與價格](docs/images/home.png)

## 功能

- 依分類瀏覽菜單
- 把餐點加進購物車

## 使用技術

- Vue 3
- Vite 6

## 安裝與執行

### 環境需求

- Node.js 22 以上
- pnpm 10

### 安裝步驟

\`\`\`bash
git clone https://github.com/example/demo-project.git
cd demo-project
pnpm install
cp .env.example .env
pnpm dev
\`\`\`

### 執行測試

\`\`\`bash
pnpm test
\`\`\`

## 環境變數

| 變數 | 必填 | 用途 |
| ---- | ---- | ---- |
| \`VITE_API_BASE_URL\` | 必填 | 點餐 API 的網址 |

## 資料夾結構

\`\`\`text
src/  畫面與程式
\`\`\`

## 作者與聯絡

是 Ray 不是 Array

## 授權

MIT，見 [LICENSE](LICENSE)。
`;

const MIT = 'MIT License\n\nCopyright (c) 2026 是 Ray 不是 Array\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\n';

// 跟 BASE 對得上的專案檔案
const FILES = {
  'package.json': JSON.stringify({
    name: 'demo-project',
    license: 'MIT',
    packageManager: 'pnpm@10.32.1',
    engines: { node: '>=22' },
    scripts: { dev: 'vite', build: 'vite build', test: 'vitest run' },
    dependencies: { vue: '^3.5.0' },
    devDependencies: { vite: '^6.0.0', vitest: '^3.0.0' },
  }),
  'pnpm-lock.yaml': "lockfileVersion: '9.0'\n",
  '.nvmrc': '22\n',
  '.env.example': 'VITE_API_BASE_URL=http://localhost:3000\n',
  LICENSE: MIT,
  'docs/images/home.png': 'png',
  'src/main.js': '',
};

/** 換掉 BASE 的一段文字；找不到要換的文字就讓測試失敗，避免測試資料默默沒改到 */
function edit(text, from, to) {
  assert.ok(text.includes(from), `測試資料裡找不到：${from}`);
  return text.replace(from, to);
}
const without = (text, from) => edit(text, from, '');

const API_DOCS = `## API 文件

本機啟動後打開 http://localhost:3000/api-docs 。

## 畫面`;
const API_USAGE = `## 使用方式

\`\`\`bash
curl http://localhost:3000/api/menu
\`\`\`

## 環境變數`;
const BASE_API = edit(edit(BASE, '## 畫面', API_DOCS), '## 環境變數', API_USAGE);

const PORTFOLIO_EXTRA = `## 我負責的部分

全部由我一個人完成。

## 為什麼這樣做

選 Vue 是因為元件好拆。

## 使用技術`;
const BASE_PORTFOLIO = edit(BASE, '## 使用技術', PORTFOLIO_EXTRA);

const COURSE_EXTRA = `## 學習目標

- 學會用 Vue 做出購物車

## 對應單元

前端入門課第 3 週。

## 使用技術`;
const BASE_COURSE = edit(edit(BASE, '## 使用技術', COURSE_EXTRA), '## 環境變數', '## 使用方式\n\n打開 `src/App.vue` 看購物車怎麼算總金額。\n\n## 環境變數');

function run(text, { files = null, type, lang } = {}) {
  return lintReadme({ text, project: files ? memoryProject(files) : null, type, lang });
}
const only = (result, ruleId) => result.problems.filter((p) => p.ruleId === ruleId);

/**
 * 每條規則的測試資料。opts.files 表示要搭配專案檔案；pass、fail 可以是陣列（多份）。
 */
const CASES = [
  { rule: 'STR002', pass: BASE, fail: ['![橫幅](https://example.com/banner.png)\n\n' + BASE, BASE + '\n# 第二個一級標題\n\n內容\n', '## 沒有一級標題\n\n內容\n'] },
  {
    rule: 'STR003',
    pass: [BASE, edit(BASE, '讓客人用手機先點餐、到店直接取餐的網頁。\n\n狀態：維護中', '狀態：維護中\n\n讓客人用手機先點餐、到店直接取餐的網頁。'), '<div align="center">\n\n# 專案\n\n[![授權](https://img.shields.io/badge/license-MIT-blue)](LICENSE)\n\n一句話說明。\n\n</div>\n'],
    fail: [without(BASE, '讓客人用手機先點餐、到店直接取餐的網頁。\n\n'), edit(BASE, '讓客人用手機先點餐、到店直接取餐的網頁。', '- 點餐\n- 取餐')],
  },
  {
    rule: 'STR014',
    pass: BASE,
    fail: [
      edit(BASE, '讓客人用手機', '> 讓客人用手機'),
      edit(BASE, '讓客人用手機先點餐、到店直接取餐的網頁。', '讓附近上班族與學生可以在出門前先用手機點好早餐，到店後不用排隊就能直接拿到熱騰騰的餐點，也能查詢每日特價與會員點數，還能累積點數兌換飲料。'),
    ],
  },
  { rule: 'STR004', pass: [BASE, edit(BASE, '狀態：維護中', '**狀態**：練習用'), edit(BASE, '狀態：維護中', '這是課堂練習用的專案，已完成。')], fail: without(BASE, '狀態：維護中\n\n') },
  { rule: 'STR005', pass: BASE, fail: edit(BASE, '## 資料夾結構', '#### 小提醒\n\n改完要重新啟動。\n\n## 資料夾結構') },
  { rule: 'STR006', pass: [BASE, edit(BASE, '## 使用技術', '## 專案技術')], fail: [without(BASE, '## 使用技術\n\n- Vue 3\n- Vite 6\n\n'), edit(BASE, '## 作者與聯絡', '## 關於這個專案')] },
  {
    rule: 'STR007',
    pass: BASE,
    fail: edit(edit(BASE, '## 畫面\n\n![點餐頁：上方是分類，下方列出餐點與價格](docs/images/home.png)\n\n', ''), '## 使用技術', '## 畫面\n\n![點餐頁：上方是分類，下方列出餐點與價格](docs/images/home.png)\n\n## 使用技術'),
  },
  { rule: 'STR008', pass: [BASE, edit(BASE, '## 作者與聯絡', '## 致謝\n\n感謝老闆娘。\n\n## 作者與聯絡')], fail: BASE + '\n## 致謝\n\n感謝老闆娘。\n' },
  { rule: 'STR009', pass: BASE, fail: [edit(BASE, '```text\nsrc/  畫面與程式\n```\n', '<!-- 之後補 -->\n'), edit(BASE, '### 執行測試\n\n```bash\npnpm test\n```\n', '### 執行測試\n')] },
  {
    rule: 'STR010',
    pass: [BASE, edit(BASE, '- 依分類瀏覽菜單', '- 依分類瀏覽菜單（舊範本的 `請斟酌` 已經刪掉）')],
    fail: [edit(BASE, '- 依分類瀏覽菜單', '- 依分類瀏覽菜單（請斟酌提供）'), edit(BASE, '- 把餐點加進購物車\n', '- 把餐點加進購物車\n...\n'), edit(BASE, '是 Ray 不是 Array', '是 Ray 不是 Array，example@example.com')],
  },
  {
    rule: 'STR015',
    // 說明只有刪節號：是在介紹待填寫法本身
    pass: [BASE, edit(BASE, '- 依分類瀏覽菜單', '- 依分類瀏覽菜單（範本裡的 `{{請填：…}}` 要換成自己的內容）'), edit(BASE, '- 依分類瀏覽菜單', '- 依分類瀏覽菜單，{{FILL: ...}} 與 {{ 請填：... }} 是待填寫法')],
    fail: [edit(BASE, '- 依分類瀏覽菜單', '- {{請填：…功能}}'), edit(BASE, 'MIT，見', '{{請填：授權名稱}}，見'), edit(BASE, 'git clone https://github.com/example/', 'git clone https://github.com/{{FILL:owner}}/')],
  },
  {
    rule: 'STR016',
    opts: { files: FILES },
    pass: [
      BASE,
      edit(BASE, 'src/  畫面與程式', 'demo-project/\n├── src/          畫面與程式\n│   └── 不存在的子資料夾/\n├── node_modules/\n├── dist/         建置後才有\n└── package.json'),
      edit(BASE, 'src/  畫面與程式', 'src/  畫面與程式\nsrc/components/  元件\n*.config.js  各種設定'),
      edit(BASE, '```text\nsrc/  畫面與程式\n```', '```text\n這裡會列出所有資料夾，例如 views/ 和 api/\n```'),
      edit(BASE, '```text\nsrc/  畫面與程式\n```', '```text\nsrc/\n└── main.js  進入點\n```'),
    ],
    fail: [
      edit(BASE, 'src/  畫面與程式', 'src/      畫面與程式\nviews/    頁面'),
      edit(BASE, 'src/  畫面與程式', '.\n├── src/\n├── server/       後端\n└── vite.config.js'),
      edit(BASE, 'src/  畫面與程式', 'demo-project/\n  src/  畫面與程式\n  config/  設定'),
      // 根目錄是 src/，底下列的 views/ 要在 src 裡找
      edit(BASE, '```text\nsrc/  畫面與程式\n```', '```text\nsrc/\n├── main.js\n└── views/  頁面\n```'),
    ],
  },
  { rule: 'CMD002', pass: BASE, fail: edit(BASE, '```text\nsrc/', '```\nsrc/') },
  {
    rule: 'CMD003',
    pass: [
      BASE,
      edit(BASE, 'pnpm test\n```', 'pnpm test\n```\n\n```console\n$ pnpm test\n✓ 12 個測試通過\n```'),
      edit(BASE, 'pnpm dev\n', 'echo $HOME\ncd $(pwd)\npnpm dev\n'),
      edit(BASE, '## 環境變數', '寫法示範：\n\n````\n```bash\n$ pnpm dev\n```\n````\n\n## 環境變數'),
      edit(BASE, '## 環境變數', '寫法示範：\n\n````markdown\n```bash\n$ pnpm dev\n```\n````\n\n## 環境變數'),
    ],
    fail: [edit(BASE, 'pnpm install\n', '$ pnpm install\n'), edit(BASE, '```bash\npnpm test\n```', '```\n$ pnpm test\n```')],
  },
  {
    rule: 'CMD004',
    opts: { files: FILES },
    pass: [BASE, edit(BASE, 'pnpm install\n', 'npm install -g pnpm\npnpm install\n'), edit(BASE, 'pnpm install\n', 'pnpm install\nnpm install\n')],
    fail: [edit(edit(BASE, 'pnpm install\n', 'npm install\n'), 'pnpm dev', 'npm run dev'), edit(BASE, '```bash\npnpm test', '```bash\nyarn test')],
  },
  {
    rule: 'CMD005',
    opts: { files: { ...FILES, 'site/package.json': JSON.stringify({ scripts: { serve: 'nuxt dev' } }) } },
    pass: [BASE, edit(BASE, 'pnpm dev\n', 'pnpm run dev\ncd site\npnpm serve\n'), edit(BASE, 'pnpm dev\n', 'pnpm dev\npnpm --filter site serve\n')],
    fail: [edit(BASE, 'pnpm dev', 'pnpm run serve'), edit(BASE, 'pnpm dev', 'pnpm preview')],
  },
  {
    rule: 'CMD008',
    pass: [BASE, edit(BASE, 'pnpm dev\n', 'pnpm dev\ngit commit -m "修正錯字"\n')],
    fail: [
      edit(BASE, '- 把餐點加進購物車\n', '- 把餐點加進購物車\n\n```bash\n帳號：demo@example.com\n```\n'),
      edit(BASE, 'pnpm dev\n', 'pnpm dev\n打開瀏覽器\n'),
      edit(BASE, 'pnpm dev\n', 'pnpm dev\nhttp://localhost:5173/\n'),
    ],
  },
  {
    rule: 'CMD010',
    pass: [BASE, edit(BASE, 'pnpm dev\n', 'pnpm dev\ngit commit -m "修正：錯字"\n')],
    fail: [edit(BASE, 'pnpm dev', 'pnpm\u3000dev'), edit(BASE, 'pnpm dev', 'pnpm dev –port 3000')],
  },
  { rule: 'CMD012', opts: { files: FILES }, pass: BASE, fail: without(BASE, '### 執行測試\n\n```bash\npnpm test\n```\n\n') },
  {
    rule: 'VER002',
    opts: { files: FILES },
    pass: [BASE, edit(BASE, 'Node.js 22 以上', 'Node.js 22.11')],
    fail: [edit(BASE, 'Node.js 22 以上', 'Node.js 16 以上'), edit(BASE, 'Node.js 22 以上', 'Node.js `v20.11.0`')],
  },
  { rule: 'VER005', pass: BASE, fail: [edit(BASE, 'Node.js 22 以上', 'Node.js 最新版'), edit(BASE, 'Node.js 22 以上', 'Node.js `16.15.0` 以上...')] },
  { rule: 'VER007', opts: { files: FILES }, pass: BASE, fail: without(BASE, '- Node.js 22 以上\n') },
  { rule: 'ENV001', opts: { files: FILES }, pass: BASE, fail: without(BASE, '## 環境變數\n\n| 變數 | 必填 | 用途 |\n| ---- | ---- | ---- |\n| `VITE_API_BASE_URL` | 必填 | 點餐 API 的網址 |\n\n') },
  {
    rule: 'ENV002',
    opts: { files: { ...FILES, '.env.example': 'VITE_API_BASE_URL=http://localhost:3000\n# 店家電話\nVITE_SHOP_PHONE=\n' } },
    pass: edit(BASE, '| 點餐 API 的網址 |\n', '| 點餐 API 的網址 |\n| `VITE_SHOP_PHONE` | 選填 | 店家電話 |\n'),
    fail: BASE,
  },
  {
    rule: 'ENV004',
    pass: [
      BASE,
      edit(BASE, '| 點餐 API 的網址 |\n', '| 點餐 API 的網址 |\n| `API_SECRET` | 必填 | 請填 `your-api-secret`，到後台的 https://dashboard.example.com/settings/tokens 產生 |\n'),
      edit(BASE, '| 點餐 API 的網址 |\n', '| 點餐 API 的網址 |\n| `AUTH_TOKEN_KEY` | 選填 | 程式在 `src/composables/useAuthToken.ts` 讀這個值 |\n'),
    ],
    // 測試用的假金鑰：隨手打的亂碼，不是任何服務真的發出的金鑰
    fail: [
      edit(BASE, '| 點餐 API 的網址 |\n', '| 點餐 API 的網址 |\n| `PAYMENT_SECRET` | 必填 | q8Zr2LmX7vTn4Kp9WdY3sHf6Bc1Ja5Ge |\n'),
      edit(BASE, 'pnpm dev\n', `pnpm dev\nexport DEPLOY_TOKEN=${'gh' + 'p_'}Zq8rT2mLx7Vn4kP9wDy3HsF6bC1jA5gE0a1b\n`),
    ],
  },
  { rule: 'ENV008', opts: { files: FILES }, pass: BASE, fail: without(BASE, 'cp .env.example .env\n') },
  {
    rule: 'IMG001',
    pass: [BASE, edit(BASE, '## 功能', '<img src="docs/images/home.png" alt="">\n\n## 功能')],
    fail: [edit(BASE, '![點餐頁：上方是分類，下方列出餐點與價格]', '![]'), edit(BASE, '## 功能', '<img src="docs/images/home.png" width="300">\n\n## 功能')],
  },
  {
    rule: 'IMG002',
    pass: BASE,
    fail: [edit(BASE, '![點餐頁：上方是分類，下方列出餐點與價格]', '![home.png]'), edit(BASE, '![點餐頁：上方是分類，下方列出餐點與價格]', '![截圖 1]'), edit(BASE, '![點餐頁：上方是分類，下方列出餐點與價格]', '![Image of the order page]')],
  },
  { rule: 'IMG003', opts: { files: FILES }, pass: BASE, fail: edit(BASE, 'docs/images/home.png', 'docs/images/Home.png') },
  { rule: 'IMG004', pass: BASE, fail: edit(BASE, '(docs/images/home.png)', '(https://fakeimg.pl/500/)') },
  {
    rule: 'IMG005',
    pass: [BASE, without(BASE, '## 畫面\n\n![點餐頁：上方是分類，下方列出餐點與價格](docs/images/home.png)\n\n')],
    fail: without(without(BASE, '## 畫面\n\n![點餐頁：上方是分類，下方列出餐點與價格](docs/images/home.png)\n\n'), '## 線上展示\n\n[早餐點餐線上展示（GitHub Pages）](https://example.com/demo/)\n\n'),
  },
  {
    rule: 'IMG007',
    pass: edit(BASE, '\n讓客人', '\n![建置狀態](https://img.shields.io/github/actions/workflow/status/example/demo-project/ci.yml)\n\n讓客人'),
    fail: edit(BASE, '\n讓客人', '\n![星星數](https://img.shields.io/github/stars/example/demo-project) ![fork 數](https://img.shields.io/github/forks/example/demo-project)\n\n讓客人'),
  },
  { rule: 'LNK001', opts: { files: FILES }, pass: [BASE, edit(BASE, '見 [LICENSE](LICENSE)', '見 [LICENSE](./LICENSE#L1)')], fail: edit(BASE, '見 [LICENSE](LICENSE)', '見 [授權全文](LICENSE.md)') },
  { rule: 'LNK004', pass: BASE, fail: [edit(BASE, '[早餐點餐線上展示（GitHub Pages）]', '[點這裡]'), edit(BASE, '[早餐點餐線上展示（GitHub Pages）]', '[click here]')] },
  {
    rule: 'LIC001',
    opts: { files: FILES },
    pass: [BASE],
    fail: without(BASE, '\n## 授權\n\nMIT，見 [LICENSE](LICENSE)。\n'),
  },
  {
    rule: 'LIC002',
    opts: { files: FILES },
    pass: [BASE, edit(BASE, 'MIT，見', 'MIT License，見')],
    fail: [edit(BASE, 'MIT，見', 'Apache-2.0，見'), edit(BASE, 'MIT，見', '保留所有權利，見')],
  },
  {
    rule: 'LIC003',
    opts: { files: Object.fromEntries(Object.entries(FILES).filter(([k]) => k !== 'LICENSE')) },
    pass: [edit(BASE, 'MIT，見 [LICENSE](LICENSE)。', '保留所有權利，僅供瀏覽。')],
    fail: BASE,
  },
  {
    rule: 'AIR001',
    pass: [BASE, edit(BASE, '- 把餐點加進購物車', '- 把餐點加進購物車，例如上傳照片的餐點也可以')],
    fail: [edit(BASE, '- 把餐點加進購物車', '- 如上所述，把餐點加進購物車'), edit(BASE, '- 把餐點加進購物車', '- Same steps as mentioned above')],
  },
  {
    rule: 'AIR005',
    pass: [BASE, edit(BASE, '- 把餐點加進購物車', '- If you are a beginner, start with the order page')],
    fail: [edit(BASE, '是 Ray 不是 Array', '你是一位資深前端工程師，請幫忙維護這份文件。'), edit(BASE, '是 Ray 不是 Array', 'You are a senior engineer. Keep this file updated.')],
  },
  { rule: 'TYPE-API001', opts: { type: 'backend-api' }, pass: [BASE_API, edit(BASE_API, '## API 文件', '## 說明文件')], fail: edit(BASE_API, '## API 文件\n\n本機啟動後打開 http://localhost:3000/api-docs 。\n\n', '') },
  {
    rule: 'TYPE-API002',
    opts: { type: 'backend-api', files: { ...FILES, 'prisma/schema.prisma': '' } },
    pass: edit(BASE_API, 'cp .env.example .env\n', 'cp .env.example .env\npnpm prisma migrate dev\n'),
    fail: BASE_API,
  },
  { rule: 'TYPE-API003', opts: { type: 'backend-api' }, pass: BASE_API, fail: edit(BASE_API, '```bash\ncurl http://localhost:3000/api/menu\n```', '打開 `/api/menu` 就會看到菜單。') },
  { rule: 'TYPE-PF001', opts: { type: 'portfolio' }, pass: BASE_PORTFOLIO, fail: without(BASE_PORTFOLIO, '## 我負責的部分\n\n全部由我一個人完成。\n\n') },
  { rule: 'TYPE-PF002', opts: { type: 'portfolio' }, pass: BASE_PORTFOLIO, fail: without(BASE_PORTFOLIO, '## 為什麼這樣做\n\n選 Vue 是因為元件好拆。\n\n') },
  {
    rule: 'TYPE-CS002',
    opts: { type: 'course-example' },
    pass: [BASE_COURSE, edit(BASE_COURSE, '## 對應單元\n\n前端入門課第 3 週。\n\n', '')  .replace('- 學會用 Vue 做出購物車', '- 學會用 Vue 做出購物車（Lesson 3）')],
    fail: without(BASE_COURSE, '## 對應單元\n\n前端入門課第 3 週。\n\n'),
  },
];

for (const c of CASES) {
  const passes = [].concat(c.pass);
  const fails = [].concat(c.fail);
  passes.forEach((text, i) => {
    test(`${c.rule} 會過（第 ${i + 1} 份）`, () => {
      const found = only(run(text, c.opts), c.rule);
      assert.deepEqual(found.map((p) => `${p.line}:${p.column} ${p.message}`), []);
    });
  });
  fails.forEach((text, i) => {
    test(`${c.rule} 不會過（第 ${i + 1} 份）`, () => {
      const found = only(run(text, c.opts), c.rule);
      assert.ok(found.length > 0, `${c.rule} 應該要抓到問題`);
      const rule = data.rules.rules.find((r) => r.id === c.rule);
      for (const p of found) {
        assert.equal(p.severity, rule.severity);
        assert.ok(!/\{\w+\}/.test(p.message), `訊息裡還有沒換掉的參數：${p.message}`);
      }
    });
  });
}

test('每一條已實作的規則都有會過與不會過的測試資料', () => {
  const implemented = data.rules.rules.filter((r) => r.status === 'implemented').map((r) => r.id);
  for (const id of implemented) {
    const c = CASES.find((x) => x.rule === id);
    assert.ok(c && [].concat(c.pass).length && [].concat(c.fail).length, `${id} 沒有測試資料`);
  }
});

test('四種類型的基準 README 都全部通過（只有 README，以及搭配專案檔案）', () => {
  const bases = [
    ['web-app', BASE],
    ['backend-api', BASE_API],
    ['portfolio', BASE_PORTFOLIO],
    ['course-example', BASE_COURSE],
  ];
  for (const [type, text] of bases) {
    for (const files of [null, FILES]) {
      const result = run(text, { type, files });
      assert.deepEqual(result.problems.map((p) => `${p.ruleId} ${p.line}:${p.column} ${p.message}`), [], `${type}${files ? '（有專案檔案）' : ''}`);
    }
  }
});

test('只有 README 時跳過要對照專案的規則，並列出跳過哪些', () => {
  const result = run(BASE);
  const expected = data.rules.rules.filter((r) => r.status === 'implemented' && r.needsProject && r.types.includes('web-app')).map((r) => r.id);
  assert.equal(result.projectFilesFound, false);
  assert.deepEqual(result.skippedRules, expected);
});

test('類型自動判斷', () => {
  assert.equal(run(BASE).type.id, 'web-app');
  assert.equal(run(BASE_API).type.id, 'backend-api');
  assert.equal(run(BASE_PORTFOLIO).type.id, 'portfolio');
  assert.equal(run(BASE_COURSE).type.id, 'course-example');
  const express = { ...FILES, 'package.json': JSON.stringify({ dependencies: { express: '^5.0.0' } }) };
  const result = run(BASE, { files: express });
  assert.equal(result.type.id, 'backend-api');
  assert.ok(result.type.evidence.length > 0);
});

test('語言自動判斷，--lang 改變輸出語言', () => {
  assert.equal(run(BASE).language.readme, 'zh-TW');
  const en = '# Breakfast Order\n\nOrder breakfast on your phone and pick it up at the shop.\n';
  assert.equal(run(en).language.readme, 'en');
  const result = run(without(BASE, '狀態：維護中\n\n'), { lang: 'en' });
  assert.equal(result.language.output, 'en');
  assert.match(only(result, 'STR004')[0].message, /No project status/);
});

test('英文 README 用英文標題也認得', () => {
  const en = `# Breakfast Order

Order breakfast on your phone and pick it up at the shop.

Status: maintained

## Screenshots

![Order page: categories on top, dishes and prices below](docs/images/home.png)

## Features

- Browse the menu by category

## Tech Stack

- Vue 3

## Getting Started

### Requirements

- Node.js 22 or later

### Installation

\`\`\`bash
pnpm install
\`\`\`

## Author

Ray

## License

MIT
`;
  const result = run(en, { type: 'web-app' });
  assert.deepEqual(result.problems.map((p) => p.ruleId), []);
});

// ---- 授權：有條件才必填 ----
const NO_LICENSE = without(BASE, '\n## 授權\n\nMIT，見 [LICENSE](LICENSE)。\n');
const withoutFile = (files, name) => Object.fromEntries(Object.entries(files).filter(([k]) => k !== name));
const withPackage = (files, fields) => ({ ...files, 'package.json': JSON.stringify({ ...JSON.parse(files['package.json']), ...fields }) });
const licenseProblems = (result) => result.problems.filter((p) => p.ruleId.startsWith('LIC') || /授權|license/i.test(p.message));

test('LIC001：依據寫在訊息裡（授權檔或 package.json）', () => {
  const byFile = only(run(NO_LICENSE, { files: FILES }), 'LIC001');
  assert.equal(byFile.length, 1);
  assert.equal(byFile[0].message, '專案有 LICENSE 檔（MIT），README 卻沒有「授權」章節');
  const byPackage = only(run(NO_LICENSE, { files: withPackage(withoutFile(FILES, 'LICENSE'), { license: 'Apache-2.0' }) }), 'LIC001');
  assert.equal(byPackage[0].message, 'package.json 的 license 是 Apache-2.0，README 卻沒有「授權」章節');
  assert.match(only(run(NO_LICENSE, { files: FILES, lang: 'en' }), 'LIC001')[0].message, /has a LICENSE file \(MIT\)/);
});

test('LIC001：不公開的專案不報（UNLICENSED、保留所有權利、npm 預設的 ISC、什麼都沒寫）', () => {
  const noFile = withoutFile(FILES, 'LICENSE');
  const cases = [
    withPackage(noFile, { license: 'UNLICENSED', private: true }),
    withPackage(noFile, { license: 'ISC' }),
    withPackage(noFile, { license: undefined }),
    { ...withPackage(noFile, { license: 'UNLICENSED' }), LICENSE: 'Copyright (c) 2026 巷口早餐店. All rights reserved.\n' },
  ];
  for (const files of cases) assert.deepEqual(licenseProblems(run(NO_LICENSE, { files })).map((p) => p.message), []);
});

test('沒有 package.json 的專案（Python）：沒有授權檔也沒有授權章節時，不報任何授權相關問題', () => {
  const files = { 'requirements.txt': 'flask==3.1.0\n', 'app.py': 'print("hi")\n', 'docs/images/home.png': 'png', 'src/main.py': '' };
  for (const type of ['web-app', 'backend-api']) {
    assert.deepEqual(licenseProblems(run(NO_LICENSE, { files, type })).map((p) => p.message), [], type);
  }
});

test('沒有授權章節時，只有 LIC001 可能報錯，其他規則都不會因為沒有授權而報', () => {
  for (const type of ['web-app', 'course-example', 'portfolio', 'backend-api']) {
    for (const files of [null, FILES]) {
      const ids = licenseProblems(run(NO_LICENSE, { files, type })).map((p) => p.ruleId);
      assert.deepEqual(ids, files ? ['LIC001'] : [], `${type}${files ? '（有專案檔案）' : ''}`);
    }
  }
});

test('內部專案常見的作者標題都認得', () => {
  for (const heading of ['維護團隊', '維護者', '負責團隊', '負責人', '聯絡窗口', '聯絡我們']) {
    const text = edit(NO_LICENSE, '## 作者與聯絡', `## ${heading}`);
    assert.deepEqual(only(run(text), 'STR006'), [], heading);
  }
});

// ---- CMD003、STR016 的細節 ----
test('CMD003：一個區塊只報一次，訊息列出行號範圍', () => {
  const text = edit(BASE, 'pnpm install\ncp .env.example .env\npnpm dev\n', '$ pnpm install\n$ cp .env.example .env\n$ pnpm dev\n');
  const found = only(run(text), 'CMD003');
  assert.equal(found.length, 1);
  const first = found[0].line;
  assert.equal(found[0].message, `指令前面有提示符號 \`$\`（第 ${first}–${first + 2} 行），複製貼上會執行失敗`);
});

test('STR016：.gitignore 裡的項目、看不懂的寫法都不檢查', () => {
  const files = { ...FILES, '.gitignore': 'uploads/\n*.log\n' };
  const ignored = edit(BASE, 'src/  畫面與程式', 'src/      畫面與程式\nuploads/  上傳的檔案（不進 repo）');
  assert.deepEqual(only(run(ignored, { files }), 'STR016'), []);
  const prose = edit(BASE, 'src/  畫面與程式', '程式都放在 src/ 底下\nviews/ 是頁面');
  assert.deepEqual(only(run(prose, { files }), 'STR016'), []);
  const js = edit(BASE, '```text\nsrc/  畫面與程式\n```', '```js\nimport views from "./views/index.js";\n```');
  assert.deepEqual(only(run(js, { files }), 'STR016'), []);
  const missing = only(run(edit(BASE, 'src/  畫面與程式', 'src/      畫面與程式\nviews/    頁面'), { files }), 'STR016');
  assert.equal(missing[0].message, '「資料夾結構」列了 views/，專案裡找不到');
});

// ---- 必填章節的細節 ----
test('只有一個「安裝」二級標題、底下直接寫步驟，不會多報缺少「安裝步驟」', () => {
  const zh = edit(edit(BASE, '## 安裝與執行\n\n### 環境需求\n\n- Node.js 22 以上\n- pnpm 10\n\n### 安裝步驟\n\n', '## 安裝\n\n'), '### 執行測試', '## 執行測試');
  const ids = run(zh).problems.filter((p) => p.ruleId === 'STR006').map((p) => p.message);
  assert.deepEqual(ids, ['缺少「環境需求」章節（網頁專案必填）']);
  const en = '# Breakfast Order\n\nOrder breakfast on your phone.\n\nStatus: maintained\n\n## Features\n\n- Order online\n\n## Tech Stack\n\n- Vue 3\n\n## Installation\n\n```bash\npnpm install\n```\n\n## Author\n\nRay\n';
  assert.deepEqual(run(en, { type: 'web-app' }).problems.filter((p) => p.ruleId === 'STR006').map((p) => p.message), ['Missing the "Requirements" section (required for the Web app type)']);
  // 步驟拆成好幾個自訂小節（舊範本的寫法）也算有寫
  const split = edit(BASE, '### 安裝步驟\n\n```bash\ngit clone https://github.com/example/demo-project.git\ncd demo-project\n', '### 取得專案\n\n```bash\ngit clone https://github.com/example/demo-project.git\ncd demo-project\n```\n\n### 安裝套件\n\n```bash\n');
  assert.deepEqual(only(run(split), 'STR006'), []);
  // 用連結指到另一份安裝說明也算
  const linked = edit(BASE, '## 安裝與執行\n\n', '## 安裝與執行\n\n各平台的安裝方式見 [安裝說明](docs/install.md)。\n\n');
  assert.deepEqual(only(run(edit(linked, '### 安裝步驟', '### 其他說明')), 'STR006'), []);
  // 「安裝與執行」底下只有環境需求、沒有步驟：要報缺少安裝步驟
  const noSteps = edit(BASE, '### 安裝步驟\n\n```bash\ngit clone https://github.com/example/demo-project.git\ncd demo-project\npnpm install\ncp .env.example .env\npnpm dev\n```\n\n', '');
  assert.deepEqual(only(run(noSteps), 'STR006').map((p) => p.message), ['缺少「安裝步驟」章節（網頁專案必填）']);
});

test('後端 API 缺少「API 文件」：只由 TYPE-API001 報一次，STR006 不重複報', () => {
  const text = without(BASE_API, '## API 文件\n\n本機啟動後打開 http://localhost:3000/api-docs 。\n\n');
  const result = run(text, { type: 'backend-api' });
  assert.equal(only(result, 'TYPE-API001').length, 1);
  assert.deepEqual(only(result, 'STR006'), []);
});

test('README 不在專案資料夾裡時，相對路徑從專案根目錄算', async () => {
  const { readmeDirOf } = await import('../src/lint.js');
  assert.equal(readmeDirOf('README.md'), '.');
  assert.equal(readmeDirOf('docs/README.md'), 'docs');
  assert.equal(readmeDirOf('../other/README.md'), '.');
  assert.equal(readmeDirOf('/somewhere/README.md'), '.');
  const result = lintReadme({ text: BASE, project: memoryProject(FILES), readmePath: '../outside/README.md' });
  assert.deepEqual(result.problems.map((p) => `${p.ruleId} ${p.message}`), []);
});

test('類型判斷：只有內文提到（作品集、課程、curl）不能決定類型，要有章節或專案檔案的訊號', () => {
  const mentions = edit(BASE, '- 依分類瀏覽菜單', '- 依分類瀏覽菜單\n- 這個專案也是我的作品集，曾在課程第 3 週示範，附 `curl` 範例');
  assert.equal(run(mentions).type.id, 'web-app');
  const en = edit(BASE, '- 依分類瀏覽菜單', '- Templates for a portfolio, a course example and a backend API');
  assert.equal(run(en).type.id, 'web-app');
  // 有章節就算數
  assert.equal(run(edit(mentions, '## 使用技術', '## 我負責的部分\n\n全部由我完成。\n\n## 使用技術')).type.id, 'portfolio');
  assert.equal(run(edit(BASE, '## 使用技術', '## 學習目標\n\n- 學會拆元件\n\n## 使用技術')).type.id, 'course-example');
  // 專案檔案的訊號也算數：後端套件加上 curl 範例
  const api = { ...FILES, 'package.json': JSON.stringify({ name: 'api', dependencies: { express: '^5.0.0' } }) };
  assert.equal(run(BASE, { files: api }).type.id, 'backend-api');
});
