// 讀取專案根目錄 rules/ 底下的規則資料。所有塊的順序、標題名稱、類型必填表都從這裡來。
import { readFileSync } from 'node:fs';

const rulesDir = new URL('../../rules/', import.meta.url);

function load(name) {
  return JSON.parse(readFileSync(new URL(name, rulesDir), 'utf8'));
}

export const data = {
  blocks: load('blocks.json'),
  headings: load('headings.json'),
  projectTypes: load('project-types.json'),
  rules: load('rules.json'),
  conventions: load('conventions.json'),
};

export const LANGS = ['zh-TW', 'en'];
export const TYPE_IDS = data.projectTypes.types.map((t) => t.id);

/** 依代號取得專案類型 */
export function projectType(id) {
  return data.projectTypes.types.find((t) => t.id === id);
}

/** 依代號取得規則 */
export function ruleById(id) {
  return data.rules.rules.find((r) => r.id === id);
}

/** 範本待填文字的比對方式（每次都建新的，避免共用 lastIndex） */
export function placeholderPattern() {
  const { pattern, flags } = data.conventions.placeholder;
  return new RegExp(pattern, flags);
}

/** 說明只有刪節號的待填寫法（{{請填：…}}）：是在介紹寫法本身，不是還沒填的地方 */
export function isSyntaxMention(text) {
  const { pattern, flags } = data.conventions.placeholder.syntaxMention;
  return new RegExp(pattern, flags).test(text);
}

/** 把待填文字換成等長空白，讓其他規則不要重複抓 */
export function stripPlaceholders(text) {
  return text.replace(placeholderPattern(), (m) => ' '.repeat(m.length));
}

/** 是否含有待填文字 */
export function hasPlaceholder(text) {
  return placeholderPattern().test(text);
}
