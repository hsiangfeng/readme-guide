// 範本（templates/<語言>/<類型>.md）只能被「還沒填完」這一類規則抓到。
// 範本還沒放進 repo 時略過，不算失敗。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { lintReadme } from '../src/lint.js';
import { data, TYPE_IDS } from '../src/data.js';

const root = fileURLToPath(new URL('../../templates/', import.meta.url));
const unfinished = new Set(data.rules.rules.filter((r) => r.category === 'unfinished').map((r) => r.id));

const templates = [];
for (const lang of ['zh-TW', 'en']) {
  const dir = `${root}${lang}/`;
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    templates.push({ lang, type: name.replace(/\.md$/, ''), path: `${dir}${name}` });
  }
}

if (!templates.length) {
  test('範本只會被「還沒填完」類規則抓到', { skip: 'templates/ 裡還沒有範本' }, () => {});
}

for (const t of templates) {
  test(`範本 ${t.lang}/${t.type}.md 只會被「還沒填完」類規則抓到`, () => {
    assert.ok(TYPE_IDS.includes(t.type), `檔名要是四種類型之一：${t.type}`);
    const result = lintReadme({ text: readFileSync(t.path, 'utf8'), type: t.type, lang: t.lang });
    assert.equal(result.language.readme, t.lang, '範本的語言判斷要對');
    const others = result.problems.filter((p) => !unfinished.has(p.ruleId));
    assert.deepEqual(others.map((p) => `${p.ruleId} ${p.line}:${p.column} ${p.message}`), []);
    assert.ok(result.problems.some((p) => p.ruleId === 'STR015'), '範本應該有待填文字');
  });
}
