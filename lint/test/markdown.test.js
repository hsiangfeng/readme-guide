// Markdown 解析的測試：程式碼區塊、標題、行內程式碼、圖片與連結、表格。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, plainText } from '../src/markdown.js';
import { matchHeading, buildSections } from '../src/sections.js';

test('程式碼區塊裡的 # 不是標題', () => {
  const md = parseMarkdown('# 專案\n\n```bash\n# 這是註解\nnpm test\n```\n\n~~~\n## 也不是標題\n~~~\n');
  assert.deepEqual(md.headings.map((h) => h.text), ['專案']);
  assert.equal(md.codeBlocks.length, 2);
  assert.equal(md.codeBlocks[0].lang, 'bash');
  assert.deepEqual(md.codeBlocks[0].lines.map((l) => l.text), ['# 這是註解', 'npm test']);
});

test('四個反引號的區塊裡可以放三個反引號', () => {
  const md = parseMarkdown('````md\n```bash\n# 不是標題\n```\n````\n\n## 真的標題\n');
  assert.deepEqual(md.headings.map((h) => h.text), ['真的標題']);
  assert.equal(md.codeBlocks.length, 1);
});

test('清單裡縮排的程式碼區塊也認得', () => {
  const md = parseMarkdown('1. 安裝\n\n   ```bash\n   pnpm install\n   ```\n');
  assert.equal(md.codeBlocks.length, 1);
  assert.equal(md.codeBlocks[0].lines[0].text.trim(), 'pnpm install');
});

test('沒有空格的 # 不是標題，底線式標題認得', () => {
  const md = parseMarkdown('#hashtag\n\n專案名稱\n========\n\n安裝\n----\n\n段落\n\n---\n');
  assert.deepEqual(md.headings.map((h) => [h.level, h.text]), [[1, '專案名稱'], [2, '安裝']]);
});

test('HTML 的 <h1> 算一級標題', () => {
  const md = parseMarkdown('<h1 align="center">巷口早餐店</h1>\n');
  assert.equal(md.headings[0].level, 1);
  assert.equal(md.headings[0].text, '巷口早餐店');
});

test('HTML 註解裡的內容不算', () => {
  const md = parseMarkdown('<!--\n# 不是標題\n-->\n# 專案\n');
  assert.deepEqual(md.headings.map((h) => h.text), ['專案']);
  assert.equal(md.lines[1].kind, 'comment');
});

test('行內程式碼裡的連結與圖片語法不算', () => {
  const md = parseMarkdown('用 `![圖](a.png)` 和 `[連結](b.md)` 這種寫法，真的連結是 [說明](docs/a.md)。\n');
  assert.equal(md.images.length, 0);
  assert.deepEqual(md.links.map((l) => l.href), ['docs/a.md']);
  assert.equal(md.inlineCode.length, 2);
});

test('徽章外面包連結：圖片與連結都抓得到', () => {
  const md = parseMarkdown('[![建置狀態](https://example.com/badge.svg)](https://example.com/actions)\n');
  assert.deepEqual(md.images.map((i) => [i.alt, i.src]), [['建置狀態', 'https://example.com/badge.svg']]);
  assert.deepEqual(md.links.map((l) => l.href), ['https://example.com/actions']);
});

test('參照式連結與圖片', () => {
  const md = parseMarkdown('看 [授權][lic]，圖 ![首頁][home]\n\n[lic]: LICENSE\n[home]: docs/home.png "首頁"\n');
  assert.deepEqual(md.links.map((l) => [l.text, l.href]), [['授權', 'LICENSE']]);
  assert.deepEqual(md.images.map((i) => [i.alt, i.src]), [['首頁', 'docs/home.png']]);
});

test('網址裡有括號、有標題文字', () => {
  const md = parseMarkdown('[維基](https://example.com/wiki/A_(b)) 與 ![圖](docs/a.png "說明")\n');
  assert.equal(md.links[0].href, 'https://example.com/wiki/A_(b)');
  assert.equal(md.images[0].src, 'docs/a.png');
});

test('HTML 的 <img>：有沒有 alt 分得出來', () => {
  const md = parseMarkdown('<p align="center"><img src="docs/a.png" width="300"><img src="docs/b.png" alt=""></p>\n');
  assert.equal(md.images.length, 2);
  assert.equal(md.images[0].altMissing, true);
  assert.equal(md.images[1].altMissing, false);
  assert.equal(md.images[1].alt, '');
});

test('表格：表格的分隔線不會被當成底線式標題', () => {
  const md = parseMarkdown('| 變數 | 用途 |\n| --- | --- |\n| `API_URL` | API [網址](https://example.com) |\n');
  assert.equal(md.headings.length, 0);
  assert.equal(md.blocks[0].type, 'table');
  assert.equal(md.links[0].href, 'https://example.com');
  assert.equal(md.inlineCode[0].text, 'API_URL');
});

test('核取方塊不是連結', () => {
  const md = parseMarkdown('- [x] 登入\n- [ ] 付款\n');
  assert.equal(md.links.length, 0);
});

test('plainText 去掉標記', () => {
  assert.equal(plainText('**安裝**與 `執行` [說明](a.md) ![圖](b.png)'), '安裝與 執行 說明');
});

test('標題比對：別名、雙語、編號、表情符號、括號補充', () => {
  assert.deepEqual(matchHeading('專案技術', 2), ['tech']);
  assert.deepEqual(matchHeading('功能 / Features', 2), ['features']);
  assert.deepEqual(matchHeading('🚀 Getting Started', 2), ['getting-started']);
  assert.deepEqual(matchHeading('1. 安裝與執行', 2), ['getting-started']);
  assert.deepEqual(matchHeading('環境需求（本機）', 3), ['requirements']);
  assert.deepEqual(matchHeading('Installation', 2), ['getting-started']);
  assert.deepEqual(matchHeading('Installation', 3), ['install-steps']);
  assert.deepEqual(matchHeading('線上展示與畫面', 2).sort(), ['demo', 'screenshots']);
  assert.deepEqual(matchHeading('第三方服務', 2), []);
});

test('章節範圍：到下一個同層或更高層的標題為止', () => {
  const md = parseMarkdown('# 專案\n\n## 安裝與執行\n\n### 環境需求\n\n- Node.js 22\n\n## 授權\n\nMIT\n');
  const sections = buildSections(md);
  const install = sections.find((s) => s.ids.includes('getting-started'));
  assert.equal(install.line, 3);
  assert.equal(install.endLine, 9);
  assert.equal(install.block, 'install');
});
