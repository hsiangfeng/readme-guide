// 讀取規則資料。所有塊的順序、標題名稱、類型必填表都從這裡來。
//
// 規則的單一來源是 repo 根目錄的 rules/。發佈成 npm 套件時，打包前（prepack）會把它複製到套件裡的 rules/，
// 打包後（postpack）再刪掉。讀取的順序刻意寫死，避免兩個陷阱：
// 1. 在 repo 裡一律讀根目錄的 rules/，就算 lint/rules/ 殘留舊複本也不會蓋過它。
// 2. 裝在別人的專案時，只讀套件自己帶的 rules/，不往上找 ../../rules/（那裡可能是 node_modules/rules 這種不相干的套件）。
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 套件的根目錄（package.json 所在的資料夾） */
export const packageDir = fileURLToPath(new URL('..', import.meta.url));

/** 這份程式是不是在 README Guide 的 repo 裡面（lint/ 資料夾，旁邊有 rules/ 與 pnpm-workspace.yaml） */
function inRepository(dir) {
  const parent = path.dirname(path.resolve(dir));
  return path.basename(path.resolve(dir)) === 'lint'
    && existsSync(path.join(parent, 'rules', 'rules.json'))
    && existsSync(path.join(parent, 'pnpm-workspace.yaml'));
}

/** 規則資料所在的資料夾與來源 */
export const rulesSource = inRepository(packageDir)
  ? { dir: path.join(path.dirname(path.resolve(packageDir)), 'rules'), from: 'repository' }
  : { dir: path.join(packageDir, 'rules'), from: 'package' };

function load(name) {
  const file = path.join(rulesSource.dir, name);
  if (!existsSync(file)) {
    throw new Error(`readme-guide: rules file not found: ${file}. The package may be incomplete; reinstall it.`);
  }
  return JSON.parse(readFileSync(file, 'utf8'));
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
