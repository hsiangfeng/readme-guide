// rules.json 每條規則的 example（改之前／改成）：
// 「改成」的片段必須原封不動出現在一份全部通過的 README 裡（所以它本身不違反任何規則），
// 「改之前」換進去之後，一定會被那條規則抓到。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { lintReadme } from '../src/lint.js';
import { memoryProject } from '../src/project.js';
import { data } from '../src/data.js';

const LANGS = ['zh-TW', 'en'];
// 修法是補檔案、不是改 README，不適合用片段舉例
const NO_EXAMPLE = new Set(['LIC003']);
// 「改之前」故意截斷成看不出是金鑰的樣子，工具抓不到是正常的
const SKIP_BEFORE = new Set(['ENV004']);
// 「改之前」是空的（表示缺了這一段）：把「改成」整段拿掉，也要被抓到
const REMOVAL_FIRES = new Set(['STR006', 'CMD012', 'ENV001', 'LIC001', 'TYPE-API001', 'TYPE-API002', 'TYPE-PF001', 'TYPE-PF002', 'TYPE-CS002']);
// 單獨一行的「…」代表省略的內容
const WILDCARD = '…';

// ---- 範例專案（巷口早餐店｜線上點餐） ----
const fixtureDir = fileURLToPath(new URL('../fixtures/breakfast-order/', import.meta.url));
function readTree(dir, prefix = '') {
  const files = {};
  for (const name of readdirSync(dir)) {
    const rel = `${prefix}${name}`;
    if (statSync(`${dir}${name}`).isDirectory()) Object.assign(files, readTree(`${dir}${name}/`, `${rel}/`));
    else if (!/^README.*\.md$/i.test(rel)) files[rel] = readFileSync(`${dir}${name}`, 'utf8');
  }
  return files;
}
const FILES = readTree(fixtureDir);
const README = { 'zh-TW': readFileSync(`${fixtureDir}README.md`, 'utf8'), en: readFileSync(`${fixtureDir}README.en.md`, 'utf8') };
const example = (id, lang) => data.rules.rules.find((r) => r.id === id).example[lang];
const join = (lines) => lines.join('\n');

/** 在 text 的某個標題前面插入一段 */
function insertBefore(text, heading, block) {
  assert.ok(text.includes(`\n${heading}\n`), `找不到標題：${heading}`);
  return text.replace(`\n${heading}\n`, `\n${block}\n\n${heading}\n`);
}

const H = {
  'zh-TW': { shots: '## 畫面', features: '## 功能', tech: '## 使用技術', install: '## 安裝與執行', env: '## 環境變數' },
  en: { shots: '## Screenshots', features: '## Features', tech: '## Tech Stack', install: '## Getting Started', env: '## Environment Variables' },
};
const LEARNING = {
  'zh-TW': '## 學習目標\n\n- 學會把畫面拆成菜單卡片與購物車兩個元件',
  en: '## Learning Objectives\n\n- Split the page into a menu card component and a cart component',
};
const COURSE_USAGE = {
  'zh-TW': '## 使用方式\n\n打開 `src/views/OrderView.vue`，看購物車怎麼算總金額。',
  en: '## Usage\n\nOpen `src/views/OrderView.vue` to see how the cart total is calculated.',
};

/** 每種類型、每種語言的基準 README 與專案檔案 */
function baseFor(type, lang) {
  const h = H[lang];
  let text = README[lang];
  let files = FILES;
  if (type === 'backend-api') {
    text = insertBefore(text, h.shots, join(example('TYPE-API001', lang).after));
    text = insertBefore(text, h.env, `${join(example('TYPE-API002', lang).after)}\n\n${join(example('TYPE-API003', lang).after)}`);
    const pkg = JSON.parse(FILES['package.json']);
    pkg.scripts['db:migrate'] = 'prisma migrate dev';
    files = { ...FILES, 'package.json': JSON.stringify(pkg), 'prisma/schema.prisma': '' };
  }
  if (type === 'portfolio') {
    text = insertBefore(text, h.tech, join(example('TYPE-PF001', lang).after));
    text = insertBefore(text, h.install, join(example('TYPE-PF002', lang).after));
  }
  if (type === 'course-example') {
    text = insertBefore(text, h.features, `${LEARNING[lang]}\n\n${join(example('TYPE-CS002', lang).after)}`);
    text = insertBefore(text, h.env, COURSE_USAGE[lang]);
  }
  return { text, files };
}

/** 有些「改成」不在範例 README 裡（例如需要多一個環境變數），在這裡補上 */
const PREPARE = {
  ENV004(base, lang) {
    const phone = lang === 'zh-TW' ? '| `VITE_SHOP_PHONE` | 否 | 頁尾顯示的店家電話 | 店家提供 |' : '| `VITE_SHOP_PHONE` | No | Shop phone number shown in the footer | Provided by the shop |';
    assert.ok(base.text.includes(phone));
    return {
      text: base.text.replace(phone, `${phone}\n${join(example('ENV004', lang).after)}`),
      files: { ...base.files, '.env.example': `${base.files['.env.example']}ORDER_API_TOKEN=\n` },
    };
  },
};

/**
 * 在文件裡找一段連續的行（「…」可以對到任意幾行），傳回位置與每個「…」對到的內容。
 * 「…」的內容用它前一行當鑰匙，「改之前」裡同一行後面的「…」會換回同樣的內容。
 */
function findLines(lines, pattern) {
  const tryAt = (i, k, captures) => {
    if (k === pattern.length) return { end: i, captures };
    if (pattern[k] === WILDCARD) {
      for (let j = i; j <= lines.length; j++) {
        const found = tryAt(j, k + 1, { ...captures, [pattern[k - 1] ?? '']: lines.slice(i, j) });
        if (found) return found;
      }
      return null;
    }
    return lines[i] === pattern[k] ? tryAt(i + 1, k + 1, captures) : null;
  };
  for (let start = 0; start < lines.length; start++) {
    const found = tryAt(start, 0, {});
    if (found) return { start, ...found };
  }
  return null;
}

function substitute(text, after, before) {
  const lines = text.split('\n');
  const found = findLines(lines, after);
  assert.ok(found, '找不到「改成」的片段');
  const replacement = before.flatMap((line, k) => (line === WILDCARD ? found.captures[before[k - 1] ?? ''] ?? [] : [line]));
  return [...lines.slice(0, found.start), ...replacement, ...lines.slice(found.end)].join('\n');
}

const implemented = data.rules.rules.filter((r) => r.status === 'implemented');
const typeOf = (rule) => (rule.types.length === 1 ? rule.types[0] : 'web-app');
const lint = (text, files, type, lang) => lintReadme({ text, project: memoryProject(files, 'breakfast-order'), type, lang });

test('每條已實作的規則都有例子（修法是補檔案的除外），格式正確', () => {
  for (const rule of data.rules.rules) {
    if (!rule.example) {
      assert.ok(rule.status !== 'implemented' || NO_EXAMPLE.has(rule.id), `${rule.id} 沒有例子`);
      continue;
    }
    for (const lang of LANGS) {
      const ex = rule.example[lang];
      assert.ok(ex && Array.isArray(ex.before) && Array.isArray(ex.after), `${rule.id} ${lang}`);
      assert.ok(ex.after.length >= 1 && ex.after.length <= 5, `${rule.id} ${lang} 的 after 要一到五行`);
      assert.ok(ex.before.length <= 5, `${rule.id} ${lang} 的 before 最多五行`);
      for (const line of [...ex.before, ...ex.after]) assert.equal(typeof line, 'string');
      assert.equal(ex.before.length === 0, rule.example[LANGS.find((l) => l !== lang)].before.length === 0, `${rule.id} 兩種語言的 before 要一致（都有或都沒有）`);
    }
  }
});

test('範例專案的基準 README（四種類型、兩種語言）都全部通過', () => {
  for (const type of ['web-app', 'backend-api', 'portfolio', 'course-example']) {
    for (const lang of LANGS) {
      const { text, files } = baseFor(type, lang);
      const result = lint(text, files, type, lang);
      assert.equal(result.language.readme, lang);
      assert.deepEqual(result.problems.map((p) => `${p.ruleId} ${p.line}:${p.column} ${p.message}`), [], `${type} ${lang}`);
    }
  }
});

for (const rule of implemented) {
  if (!rule.example) continue;
  for (const lang of LANGS) {
    const ex = rule.example[lang];
    const type = typeOf(rule);
    test(`${rule.id} 的例子（${lang}）：改成的片段不違反規則，改之前會被抓到`, () => {
      let base = baseFor(type, lang);
      if (PREPARE[rule.id]) base = PREPARE[rule.id](base, lang);
      // 改成：片段在一份全部通過的 README 裡
      assert.ok(findLines(base.text.split('\n'), ex.after), `${rule.id} 的 after 不在範例 README 裡`);
      const passed = lint(base.text, base.files, type, lang);
      assert.deepEqual(passed.problems.map((p) => `${p.ruleId} ${p.message}`), []);
      // 改之前：換進去後一定被這條規則抓到
      if (SKIP_BEFORE.has(rule.id)) return;
      if (!ex.before.length && !REMOVAL_FIRES.has(rule.id)) return;
      const broken = substitute(base.text, ex.after, ex.before);
      const found = lint(broken, base.files, type, lang).problems.filter((p) => p.ruleId === rule.id);
      assert.ok(found.length > 0, `${rule.id} 的 before 沒有被抓到`);
    });
  }
}

test('金鑰那一條的例子沒有放完整的金鑰字串', () => {
  for (const lang of LANGS) {
    for (const line of example('ENV004', lang).before) if (/`[^`]{6,}`/.test(line)) assert.match(line, /…/);
  }
});
