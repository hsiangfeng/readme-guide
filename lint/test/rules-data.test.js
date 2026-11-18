// rules/ 資料的完整性：欄位齊全、互相對得上、文字沒有不該出現的字。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { data, LANGS, TYPE_IDS } from '../src/data.js';
import { implementations } from '../src/lint.js';

const blockSlugs = data.blocks.blocks.map((b) => b.slug);
const sectionIds = data.headings.sections.map((s) => s.id);
const categoryIds = data.rules.categories.map((c) => c.id);

function bothLangs(obj, where) {
  for (const lang of LANGS) assert.ok(typeof obj?.[lang] === 'string' && obj[lang].trim(), `${where} 缺 ${lang}`);
}

test('八塊：代號不重複，每塊都屬於一個問題組', () => {
  assert.equal(new Set(blockSlugs).size, blockSlugs.length);
  const groups = data.blocks.groups.map((g) => g.id);
  for (const block of data.blocks.blocks) {
    assert.ok(groups.includes(block.group), block.slug);
    bothLangs(block.name, `${block.slug}.name`);
    bothLangs(block.summary, `${block.slug}.summary`);
  }
});

test('章節：代號不重複、塊存在、別名不會同時指向兩個同層級的章節', () => {
  assert.equal(new Set(sectionIds).size, sectionIds.length);
  const seen = new Map();
  for (const section of data.headings.sections) {
    assert.ok(blockSlugs.includes(section.block), section.id);
    bothLangs(section.title, `${section.id}.title`);
    for (const lang of LANGS) assert.ok(Array.isArray(section.aliases[lang]), `${section.id}.aliases.${lang}`);
    const names = [...Object.values(section.title), ...Object.values(section.aliases).flat()].map((n) => n.toLowerCase());
    for (const name of new Set(names)) {
      const key = `${name}@${section.level}`;
      assert.ok(!seen.has(key), `「${name}」同時是 ${seen.get(key)} 與 ${section.id} 的名稱`);
      seen.set(key, section.id);
    }
  }
});

test('舊範本的標題都在別名表裡', () => {
  const all = data.headings.sections.flatMap((s) => Object.values(s.aliases).flat());
  for (const old of ['專案技術', '資料夾說明', '環境變數說明', '聯絡作者']) assert.ok(all.includes(old), old);
});

test('四種類型：必填與選填都是存在的章節', () => {
  assert.deepEqual(TYPE_IDS, ['web-app', 'course-example', 'portfolio', 'backend-api']);
  for (const type of data.projectTypes.types) {
    bothLangs(type.name, type.id);
    for (const id of [...type.required, ...type.optional, ...type.typeSpecific]) assert.ok(sectionIds.includes(id), `${type.id}: ${id}`);
    // 作者一定要有；授權只有公開的專案要寫（LIC001 依專案檔案判斷），所以是選填
    assert.ok(type.required.includes('author') && !type.required.includes('license') && type.optional.includes('license'), type.id);
  }
});

test('每條規則的欄位齊全', () => {
  const ids = data.rules.rules.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, '規則代號重複');
  for (const rule of data.rules.rules) {
    assert.ok(rule.block === null || blockSlugs.includes(rule.block), `${rule.id}.block`);
    assert.ok(['error', 'warning'].includes(rule.severity), `${rule.id}.severity`);
    assert.ok(['implemented', 'planned'].includes(rule.status), `${rule.id}.status`);
    assert.ok(categoryIds.includes(rule.category), `${rule.id}.category`);
    assert.equal(typeof rule.needsProject, 'boolean', `${rule.id}.needsProject`);
    assert.ok(rule.types.length > 0 && rule.types.every((t) => TYPE_IDS.includes(t)), `${rule.id}.types`);
    bothLangs(rule.title, `${rule.id}.title`);
    bothLangs(rule.description, `${rule.id}.description`);
    bothLangs(rule.fix, `${rule.id}.fix`);
    if (rule.status === 'implemented') assert.ok(Object.keys(rule.messages).length > 0, `${rule.id}.messages`);
    for (const [key, message] of Object.entries(rule.messages)) {
      bothLangs(message, `${rule.id}.messages.${key}`);
      const params = (m) => [...m.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
      assert.equal(params(message['zh-TW']), params(message.en), `${rule.id}.messages.${key} 兩種語言的參數不一樣`);
    }
  }
});

test('標成已實作的規則都有程式，有程式的規則都標成已實作', () => {
  const implemented = data.rules.rules.filter((r) => r.status === 'implemented').map((r) => r.id).sort();
  assert.deepEqual(Object.keys(implementations).sort(), implemented);
});

// 對外文字的用字限制：不寫 AI 廠商或產品名稱、不寫工程術語與大陸用語
// 名單用 base64 存放，避免這支測試本身出現這些名稱
const FORBIDDEN = Buffer.from('Q2xhdWRlLEFudGhyb3BpYyxPcGVuQUksQ2hhdEdQVCxHUFQtLENvcGlsb3QsR2VtaW5pLEJhcmQsTGxhbWEsTWlzdHJhbCxEZWVwU2VlayxDdXJzb3IsQ29kZXgsV2luZHN1cmYsUGVycGxleGl0eSxHcm9rLFF3ZW4sS2ltaSxEZXZpbixUYWJuaW5lLENvZGVXaGlzcGVyZXIsTWljcm9zb2Z0LEdvb2dsZQ==', 'base64').toString('utf8').split(',');
const JARGON = [/\bAST\b/, /正規表示式/, /正則/, /語意化/, /倉庫/, /默認/, /信息/, /文檔/, /源代碼/, /視頻/];

test('rules/ 的文字沒有 AI 廠商或產品名稱，也沒有工程術語與大陸用語', () => {
  const dir = new URL('../../rules/', import.meta.url);
  for (const name of readdirSync(dir)) {
    const text = readFileSync(new URL(name, dir), 'utf8');
    for (const word of FORBIDDEN) assert.ok(!text.toLowerCase().includes(word.toLowerCase()), `${name} 出現「${word}」`);
    if (name.endsWith('.json')) for (const word of JARGON) assert.ok(!word.test(text), `${name} 出現「${word.source}」`);
  }
});

test('skills/ 與 lint/ 的程式、文件、測試資料都沒有 AI 廠商或產品名稱', () => {
  for (const base of ['../../skills/', '../src/', '../bin/', '../scripts/', '../fixtures/']) {
    const dir = new URL(base, import.meta.url);
    for (const name of readdirSync(dir, { recursive: true })) {
      if (!/\.(?:md|js|mjs|json|ya?ml|html|vue|txt)$|LICENSE$|\.nvmrc$|\.env\.example$/.test(name)) continue;
      const text = readFileSync(new URL(name, dir), 'utf8').toLowerCase();
      for (const word of FORBIDDEN) assert.ok(!text.includes(word.toLowerCase()), `${base}${name} 出現「${word}」`);
    }
  }
  // 會出現在 npm 套件頁面與 repo 首頁的文件
  for (const file of ['../README.md', '../package.json', '../../README.md', '../../README.zh-TW.md']) {
    const text = readFileSync(new URL(file, import.meta.url), 'utf8').toLowerCase();
    for (const word of FORBIDDEN) assert.ok(!text.includes(word.toLowerCase()), `${file} 出現「${word}」`);
  }
});

test('給 AI 的指南不依賴整份 repo：不叫人 clone、不寫 repo 內的路徑', () => {
  const dir = new URL('../../skills/', import.meta.url);
  for (const name of readdirSync(dir, { recursive: true })) {
    if (!name.endsWith('.md')) continue;
    const text = readFileSync(new URL(name, dir), 'utf8');
    assert.doesNotMatch(text, /\bGUIDE\b/, `${name} 還在用 GUIDE`);
    assert.doesNotMatch(text, /readme-guide\.git|lint\/bin|readme-guide\.mjs/, `${name} 還叫人 clone 或用 repo 裡的檢查工具`);
    assert.doesNotMatch(text, /`(?:rules|templates)\//, `${name} 還寫 repo 內的路徑`);
    for (const match of text.matchAll(/npx (?:--yes )?readme-guide(\S*)/g)) {
      assert.equal(match[1], '@latest', `${name} 的 npx 指令要帶 @latest`);
    }
  }
});
