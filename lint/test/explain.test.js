// explain 子指令：查單一條規則的完整說明。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { data } from '../src/data.js';
import { findRule, similarRules, describeRule, formatRule } from '../src/explain.js';

const bin = fileURLToPath(new URL('../bin/readme-guide.mjs', import.meta.url));
function cli(...args) {
  const result = spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

test('explain：印出代號、塊、嚴重度、標題、說明、怎麼修，結束代碼 0', () => {
  const rule = data.rules.rules.find((r) => r.id === 'CMD004');
  const { code, stdout } = cli('explain', 'CMD004', '--lang', 'zh-TW');
  assert.equal(code, 0);
  assert.match(stdout, /^CMD004 {2}/);
  assert.ok(stdout.includes(rule.title['zh-TW']));
  assert.ok(stdout.includes(rule.description['zh-TW']));
  assert.ok(stdout.includes(rule.fix['zh-TW']));
  assert.match(stdout, /塊：05 安裝與執行/);
  assert.match(stdout, /嚴重度：錯誤/);
});

test('explain：英文輸出不夾全形標點', () => {
  const { code, stdout } = cli('explain', 'STR006', '--lang', 'en');
  assert.equal(code, 0);
  assert.match(stdout, /Severity: Error/);
  assert.doesNotMatch(stdout.split('\n\nDescription')[0], /[：｜（）、]/);
});

test('explain --json：欄位齊全，語言照 --lang', () => {
  const { code, stdout } = cli('explain', 'ENV002', '--lang', 'en', '--json');
  assert.equal(code, 0);
  const json = JSON.parse(stdout);
  const rule = data.rules.rules.find((r) => r.id === 'ENV002');
  assert.equal(json.id, 'ENV002');
  assert.equal(json.severity, rule.severity);
  assert.equal(json.status, rule.status);
  assert.equal(json.title, rule.title.en);
  assert.equal(json.fix, rule.fix.en);
  assert.equal(json.block.slug, rule.block);
  assert.equal(typeof json.block.name, 'string');
});

test('explain：代號不分大小寫，連字號可省略', () => {
  assert.equal(findRule('cmd004').id, 'CMD004');
  assert.equal(findRule('type-api001').id, 'TYPE-API001');
  assert.equal(findRule('TYPEAPI001').id, 'TYPE-API001');
  assert.equal(findRule('NOPE001'), null);
});

test('explain：找不到的代號結束代碼 2，並列出相近的規則', () => {
  const { code, stderr } = cli('explain', 'CMD04', '--lang', 'zh-TW');
  assert.equal(code, 2);
  assert.match(stderr, /找不到規則「CMD04」/);
  assert.match(stderr, /相近的規則：CMD004/);
  assert.ok(similarRules('STR06').includes('STR006'));
  const json = cli('explain', 'LIC09', '--json');
  assert.equal(json.code, 2);
  assert.ok(JSON.parse(json.stdout).similar.includes('LIC001'));
});

test('explain：沒給代號、給太多或搭配 check 的選項，結束代碼 2', () => {
  assert.equal(cli('explain').code, 2);
  assert.equal(cli('explain', 'CMD004', 'CMD005').code, 2);
  assert.equal(cli('explain', 'CMD004', '--type', 'web-app').code, 2);
  assert.equal(cli('explain', 'CMD004', '--lang', 'ja').code, 2);
});

test('explain：每一條規則兩種語言都印得出來', () => {
  for (const rule of data.rules.rules) {
    for (const lang of ['zh-TW', 'en']) {
      const text = formatRule(rule, lang);
      assert.ok(text.startsWith(rule.id), rule.id);
      assert.doesNotMatch(text, /undefined|\[object Object\]/, `${rule.id} ${lang}`);
      const json = describeRule(rule, lang);
      assert.ok(json.block === null || typeof json.block.name === 'string', rule.id);
    }
  }
});
