// 範例專案與指令列的整合測試：好的 README、到處是錯的 README、舊範本、範本樣本。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { data } from '../src/data.js';

const bin = fileURLToPath(new URL('../bin/readme-guide.mjs', import.meta.url));
const fixture = (rel) => fileURLToPath(new URL(`../fixtures/${rel}`, import.meta.url));

function cli(...args) {
  const result = spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}
function cliJson(...args) {
  const result = cli(...args, '--json');
  return { code: result.code, json: JSON.parse(result.stdout) };
}
const ruleIds = (json) => new Set(json.problems.map((p) => p.ruleId));

test('巷口早餐店：好的 README 全部通過，結束代碼 0', () => {
  const { code, stdout } = cli('check', fixture('breakfast-order/README.md'));
  assert.equal(code, 0);
  assert.match(stdout, /✔ 沒有發現問題（0 個錯誤、0 個警告）/);
  const { json } = cliJson('check', fixture('breakfast-order/README.md'));
  assert.equal(json.projectFilesFound, true);
  assert.deepEqual(json.skippedRules, []);
  assert.equal(json.type.id, 'web-app');
});

test('公司內部專案：沒有授權檔、package.json 是 UNLICENSED、沒有授權章節，0 個問題', () => {
  const { code, json } = cliJson('check', fixture('internal-tool/README.md'));
  assert.equal(code, 0);
  assert.equal(json.projectFilesFound, true);
  assert.deepEqual(json.problems.map((p) => `${p.ruleId} ${p.message}`), []);
});

test('巷口早餐店：到處是錯的 README 抓得到主要問題，結束代碼 1', () => {
  const { code, json } = cliJson('check', fixture('breakfast-order/README.bad.md'));
  assert.equal(code, 1);
  const expected = [
    'STR002', 'STR004', 'STR005', 'STR006', 'STR007', 'STR008', 'STR009', 'STR010', 'STR014', 'STR015',
    'CMD002', 'CMD004', 'CMD005', 'CMD008', 'CMD010', 'CMD012',
    'CMD003', 'STR016', 'VER002', 'ENV002', 'ENV004', 'ENV008',
    'IMG001', 'IMG002', 'IMG003', 'IMG004', 'IMG007', 'LNK001', 'LNK004', 'LIC002', 'AIR001', 'AIR005',
  ];
  const found = ruleIds(json);
  for (const id of expected) assert.ok(found.has(id), `應該抓到 ${id}`);
  assert.ok(json.summary.errors > 0 && json.summary.warnings > 0);
});

test('舊範本（只有 README）：抓得到主要問題，並說明跳過哪些規則', () => {
  const { code, json } = cliJson('check', fixture('old-template/README.md'));
  assert.equal(code, 1);
  assert.equal(json.projectFilesFound, false);
  assert.ok(json.skippedRules.includes('CMD004') && json.skippedRules.includes('ENV002'));
  const found = ruleIds(json);
  const expected = ['STR002', 'STR004', 'STR006', 'STR007', 'STR010', 'STR014', 'IMG001', 'IMG002', 'IMG004', 'IMG007', 'LNK004', 'CMD008', 'VER005'];
  for (const id of expected) assert.ok(found.has(id), `應該抓到 ${id}`);
  const missing = json.problems.filter((p) => p.ruleId === 'STR006').map((p) => p.message);
  assert.ok(missing.some((m) => m.includes('環境需求')));
  // 授權不是必填：只有 README 時分不出公開或內部，不報缺少授權
  assert.ok(!missing.some((m) => m.includes('授權')));
  const { stdout } = cli('check', fixture('old-template/README.md'));
  assert.match(stdout, /跳過 \d+ 條要對照專案檔案的規則/);
});

test('範本樣本：只會被「還沒填完」這一類規則抓到', () => {
  for (const type of ['web-app']) {
    const { json } = cliJson('check', fixture('template-sample/README.md'), '--type', type);
    const unfinished = new Set(data.rules.rules.filter((r) => r.category === 'unfinished').map((r) => r.id));
    assert.ok(json.problems.length > 0);
    for (const p of json.problems) assert.ok(unfinished.has(p.ruleId), `範本不該被 ${p.ruleId} 抓到：${p.message}`);
  }
});

test('人讀的輸出：位置、等級、問題、第幾塊＋名稱，最後一行是總結', () => {
  const { stdout } = cli('check', fixture('breakfast-order/README.bad.md'));
  const lines = stdout.trimEnd().split('\n');
  assert.match(lines[0], /README\.bad\.md$/);
  assert.match(lines[1], /^專案類型：網頁專案（自動判斷/);
  assert.ok(lines.some((l) => /^\s+\d+:\d+\s+錯誤\s+寫的是 npm，專案實際用的是 pnpm.*05 安裝與執行\s+CMD004$/.test(l)));
  assert.ok(lines.some((l) => /^\s+—\s+錯誤\s+缺少「使用技術」章節.*04 使用技術\s+STR006$/.test(l)));
  assert.match(lines.at(-1), /^✖ \d+ 個問題（\d+ 個錯誤、\d+ 個警告）$/);
});

test('--lang en 輸出英文', () => {
  const { stdout } = cli('check', fixture('breakfast-order/README.bad.md'), '--lang', 'en');
  assert.match(stdout, /^Project type: Web app/m);
  assert.match(stdout, /Error\s+This uses npm, but the project uses pnpm/);
  assert.match(stdout.trimEnd().split('\n').at(-1), /^✖ \d+ problems \(\d+ errors, \d+ warnings\)$/);
});

test('只有警告時結束代碼是 0', () => {
  const { code, stdout } = cli('check', fixture('breakfast-order/README.md'), '--type', 'portfolio');
  assert.equal(code, 0);
  assert.match(stdout.trimEnd().split('\n').at(-1), /^⚠ \d+ 個問題（0 個錯誤、\d+ 個警告）$/);
});

test('--json 的格式', () => {
  const { json } = cliJson('check', fixture('breakfast-order/README.bad.md'));
  assert.deepEqual(Object.keys(json), ['file', 'projectDir', 'type', 'language', 'projectFilesFound', 'skippedRules', 'summary', 'problems']);
  const p = json.problems.find((x) => x.ruleId === 'CMD004');
  assert.deepEqual(Object.keys(p), ['ruleId', 'severity', 'line', 'column', 'block', 'message', 'title', 'fix', 'needsProject']);
  assert.deepEqual(p.block, { slug: 'install', number: '05', name: '安裝與執行' });
});

test('README 不在專案資料夾裡：相對路徑從專案根目錄算，不會誤報圖片或資料夾找不到', () => {
  const { json } = cliJson('check', fixture('detached-readme/README.md'), '--project', fixture('breakfast-order'));
  assert.equal(json.projectFilesFound, true);
  assert.deepEqual(json.problems.map((p) => `${p.ruleId} ${p.message}`), []);
});

test('--project 指到另一個資料夾', () => {
  const { json } = cliJson('check', fixture('old-template/README.md'), '--project', fixture('breakfast-order'));
  assert.equal(json.projectFilesFound, true);
  assert.ok(ruleIds(json).has('CMD004'));
});

test('參數錯誤時結束代碼是 2', () => {
  assert.equal(cli('check', fixture('breakfast-order/README.md'), '--type', 'cli-tool').code, 2);
  assert.equal(cli('check', fixture('breakfast-order/README.md'), '--lang', 'ja').code, 2);
  assert.equal(cli('check', fixture('does-not-exist.md')).code, 2);
  assert.equal(cli('lint', fixture('breakfast-order/README.md')).code, 2);
  assert.equal(cli('--help').code, 0);
});

test('這份指南自己的 README（複本）：內文提到其他類型不會被誤判，說明待填寫法的句子不算沒填完', () => {
  for (const name of ['README.md', 'README.zh-TW.md']) {
    const { json } = cliJson('check', fixture(`self-readme/${name}`));
    assert.equal(json.type.id, 'web-app', `${name} 應該判成網頁專案`);
    // 只有 README 的複本：要對照專案檔案的規則會被跳過，其他規則都要通過
    assert.deepEqual(json.problems.map((p) => `${p.ruleId} ${p.line}:${p.column} ${p.message}`), [], name);
  }
});

// ---- 四種類型「範本填完的樣子」 ----
const EXAMPLES = [
  ['breakfast-order', 'web-app'],
  ['breakfast-vue-lesson', 'course-example'],
  ['breakfast-portfolio', 'portfolio'],
  ['breakfast-api', 'backend-api'],
];
const README_FILES = [['README.md', 'zh-TW'], ['README.en.md', 'en']];

for (const [folder, type] of EXAMPLES) {
  for (const [name, lang] of README_FILES) {
    test(`範例 ${folder}/${name}：指定類型 0 個問題，不指定也判成${type}`, () => {
      for (const args of [['--type', type], []]) {
        const { code, json } = cliJson('check', fixture(`${folder}/${name}`), ...args);
        assert.equal(code, 0);
        assert.equal(json.projectFilesFound, true);
        assert.equal(json.type.id, type);
        assert.equal(json.language.readme, lang);
        assert.deepEqual(json.problems.map((p) => `${p.ruleId} ${p.line}:${p.column} ${p.message}`), []);
      }
    });
  }
}

const templatesDir = fileURLToPath(new URL('../../templates/', import.meta.url));
const headingsOf = (text) => text.split('\n').filter((l) => /^#{2,6} /.test(l));
// 網頁專案的範例保留「執行測試」（範本沒有這一節）
const EXTRA_HEADINGS = new Set(['### 執行測試', '### Running Tests']);

test('範例 README 的章節與順序跟範本一樣', (t) => {
  if (!existsSync(templatesDir)) return t.skip('templates/ 裡還沒有範本');
  for (const [folder, type] of EXAMPLES) {
    for (const [name, lang] of README_FILES) {
      const template = `${templatesDir}${lang}/${type}.md`;
      if (!existsSync(template)) continue;
      const expected = headingsOf(readFileSync(template, 'utf8'));
      const actual = headingsOf(readFileSync(fixture(`${folder}/${name}`), 'utf8')).filter((h) => !EXTRA_HEADINGS.has(h));
      assert.deepEqual(actual, expected, `${folder}/${name}`);
    }
  }
});

test('範例 README 的表格格子與資料夾說明都很短（繁中 30 字、英文 60 字元以內）', () => {
  const limit = { 'zh-TW': 30, en: 60 };
  for (const [folder] of EXAMPLES) {
    for (const [name, lang] of README_FILES) {
      const lines = readFileSync(fixture(`${folder}/${name}`), 'utf8').split('\n');
      const cells = lines.filter((l) => /^\|.*\|$/.test(l) && !/^\|[\s|:-]+\|$/.test(l)).flatMap((l) => l.slice(1, -1).split('|'));
      const heading = lang === 'zh-TW' ? '## 資料夾結構' : '## Project Structure';
      const start = lines.indexOf(heading);
      const notes = [];
      if (start >= 0) {
        for (let i = start + 1; i < lines.length && !lines[i].startsWith('## '); i++) {
          const m = lines[i].match(/^\S+\/?\s{2,}(.+)$/);
          if (m && !lines[i].startsWith('```')) notes.push(m[1]);
        }
      }
      for (const text of [...cells, ...notes]) {
        const shown = text.trim().replace(/`/g, '');
        assert.ok([...shown].length <= limit[lang], `${folder}/${name}：「${shown}」有 ${[...shown].length} 個字`);
      }
    }
  }
});
