// 版本範圍判斷的測試。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRange, parseVersion } from '../src/semver.js';

const v = (text) => parseVersion(text);

test('解析版本', () => {
  assert.deepEqual(v('v22.21.1'), { major: 22, minor: 21, patch: 1 });
  assert.deepEqual(v('20.x'), { major: 20, minor: null, patch: null });
  assert.equal(v('lts/*'), null);
});

test('版本範圍', () => {
  const cases = [
    ['>=22', '22.0.0', true],
    ['>=22', '20.11.0', false],
    ['^20 || ^22', '22.3.0', true],
    ['^20 || ^22', '21.0.0', false],
    ['>=18 <23', '22.9.0', true],
    ['>=18 <23', '23.0.0', false],
    ['22.x', '22.1.0', true],
    ['22', '23.0.0', false],
    ['~22.1', '22.1.9', true],
    ['~22.1', '22.2.0', false],
    ['18 - 20', '20.5.0', true],
    ['*', '16.0.0', true],
    ['>=20.0.0', '16.15.0', false],
  ];
  for (const [range, version, expected] of cases) {
    assert.equal(parseRange(range)(v(version)), expected, `${range} 對 ${version}`);
  }
});

test('看不懂的範圍傳回 null', () => {
  assert.equal(parseRange('latest'), null);
});
