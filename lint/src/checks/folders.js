// 資料夾結構類規則：「資料夾結構」章節列出的最上層項目，在專案裡找不找得到。
// 只在看得懂寫法時才檢查；看不懂的區塊整段跳過，寧可漏抓也不要誤判。
import path from 'node:path';
import { findSection, sectionCodeBlocks } from '../sections.js';

// 樹狀圖的分支符號：├── └── 與常見的純文字寫法 |-- `-- +--
const TREE_LINE = /^([\s│┃|]*?)(├──|└──|├─|└─|┣━+|┗━+|\|--|\|──|`--|\+--)\s*(.*)$/;
const TREE_FILLER = /^[\s│┃|]*$/;
// 「路徑＋說明」寫法只檢查純文字區塊
const PLAIN_LANGS = new Set(['', 'text', 'txt', 'plain', 'plaintext', 'tree', 'none']);
// 不會放進 repo、或是建置後才產生的資料夾與檔案
const IGNORED = new Set([
  'node_modules', 'dist', 'build', 'out', '.output', '.nuxt', '.next', '.svelte-kit', '.vercel', '.netlify', '.turbo',
  '.cache', 'coverage', '.nyc_output', 'tmp', 'temp', 'logs', 'vendor', 'target', '__pycache__', '.venv', 'venv', 'env',
  '.env', '.env.local', '.DS_Store', '.git', '.idea', '.vscode',
]);
const WILDCARD = /[*?…<>{}[\]$~\\]|\.\.\./;

/** 一行裡的項目名稱：去掉註解與說明，只留第一個字詞 */
function entryName(text) {
  const name = text.trim().split(/\s+/)[0] ?? '';
  return name.replace(/^\.\//, '');
}

/** 名稱看得懂：結尾是 / 的資料夾，或有副檔名的檔案 */
function isCheckable(name) {
  if (!name || WILDCARD.test(name) || name.startsWith('/') || name.startsWith('#')) return false;
  if (!/^[\w.@+-][\w.@+/-]*$/.test(name)) return false;
  return name.endsWith('/') || /\.[A-Za-z0-9]{1,10}$/.test(name);
}

/** 最上層的名稱（「src/components/」只看 src） */
function topSegment(name) {
  const trimmed = name.replace(/\/+$/, '');
  return trimmed.split('/')[0];
}

/** .gitignore 裡簡單的名稱（沒有萬用字元的），列在結構裡但沒進 repo 是正常的 */
function gitignored(project, dir) {
  const names = new Set();
  for (const file of new Set([path.posix.join(dir, '.gitignore'), '.gitignore'])) {
    for (const line of (project.readText(file) ?? '').split(/\r?\n/)) {
      const entry = line.trim().replace(/^\//, '').replace(/\/$/, '');
      if (entry && !entry.startsWith('#') && !entry.startsWith('!') && !/[*?[]/.test(entry)) names.add(entry);
    }
  }
  return names;
}

/** 第一行如果是根目錄，判斷它對到哪個資料夾；對不到就傳回 null（整段跳過） */
function resolveRoot(name, ctx) {
  const clean = name.replace(/^\.\//, '').replace(/\/+$/, '');
  if (clean === '' || clean === '.') return ctx.readmeDir;
  const known = [ctx.project.name, ctx.pkg?.name, ctx.pkg?.name?.split('/').pop()].filter(Boolean);
  if (known.includes(clean)) return ctx.readmeDir;
  const sub = path.posix.join(ctx.readmeDir, clean);
  return ctx.project.isDir(sub) ? sub : null;
}

/**
 * 從一個程式碼區塊找出最上層的項目。
 * @returns {{base:string, entries:Array<{name:string,line:number,column:number}>}|null}
 */
function parseBlock(block, ctx) {
  const rows = block.lines.filter(({ text }) => text.trim() !== '');
  if (!rows.length) return null;

  // 樹狀圖
  if (rows.some(({ text }) => TREE_LINE.test(text))) {
    let base = ctx.readmeDir;
    const tree = [];
    for (const [i, row] of rows.entries()) {
      const m = row.text.match(TREE_LINE);
      if (m) {
        tree.push({ depth: m[1].length, text: m[3], row });
        continue;
      }
      if (TREE_FILLER.test(row.text)) continue;
      // 只接受第一行是根目錄
      if (i !== 0 || tree.length) return null;
      base = resolveRoot(entryName(row.text), ctx);
      if (base === null) return null;
    }
    const top = Math.min(...tree.map((t) => t.depth));
    const entries = tree
      .filter((t) => t.depth === top)
      .map((t) => ({ name: entryName(t.text), line: t.row.line, column: t.row.text.indexOf(t.text) + 1 }));
    return { base, entries };
  }

  // 「路徑＋說明」：每一行都要是「名稱 說明」，否則看不懂、整段跳過
  if (!PLAIN_LANGS.has(block.lang)) return null;
  const items = [];
  for (const row of rows) {
    const trimmed = row.text.trim();
    if (/^(?:#|\/\/)/.test(trimmed)) continue;
    const name = entryName(trimmed);
    if (!isCheckable(name)) return null;
    items.push({ name, indent: row.text.length - row.text.trimStart().length, line: row.line, column: row.text.indexOf(name) + 1 });
  }
  if (!items.length) return null;
  let top = Math.min(...items.map((x) => x.indent));
  let base = ctx.readmeDir;
  const firstLevel = items.filter((x) => x.indent === top);
  // 只有第一行在最外層、其他都縮排在它底下：第一行是根目錄
  if (firstLevel.length === 1 && items[0] === firstLevel[0] && items.length > 1) {
    base = resolveRoot(items[0].name, ctx);
    if (base === null) return null;
    top = Math.min(...items.slice(1).map((x) => x.indent));
    return { base, entries: items.slice(1).filter((x) => x.indent === top) };
  }
  return { base, entries: firstLevel };
}

export const checks = {
  STR016(ctx) {
    const section = findSection(ctx.sections, 'structure');
    if (!section) return [];
    const problems = [];
    const seen = new Set();
    for (const block of sectionCodeBlocks(ctx.md, section)) {
      const parsed = parseBlock(block, ctx);
      if (!parsed) continue;
      const ignored = gitignored(ctx.project, parsed.base);
      for (const entry of parsed.entries) {
        if (!isCheckable(entry.name)) continue;
        const top = topSegment(entry.name);
        if (IGNORED.has(top) || ignored.has(top) || ignored.has(entry.name.replace(/\/+$/, ''))) continue;
        const rel = path.posix.join(parsed.base, top);
        if (seen.has(rel) || ctx.project.exists(rel)) continue;
        seen.add(rel);
        const shown = entry.name.includes('/') ? `${top}/` : top;
        problems.push({ messageKey: 'missing', params: { name: shown }, line: entry.line, column: entry.column });
      }
    }
    return problems;
  },
};
