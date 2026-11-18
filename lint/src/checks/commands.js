// 指令類規則：程式碼區塊的語言、指令區塊的內容、套件管理工具與 scripts 是否對得上專案。
import path from 'node:path';
import { readPackageJson } from '../project.js';
import { stripPlaceholders } from '../data.js';
import { findSection } from '../sections.js';
import {
  CJK_LETTER,
  commandBlocks,
  isDemoBlock,
  commandLinesOf,
  shellBlocks,
  splitSegments,
  stripPrompt,
  stripQuotedAndComment,
  tokenize,
} from './util.js';

const LOCKFILES = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
  ['npm-shrinkwrap.json', 'npm'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
];
const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];

// 不帶 run 也會被當成 script 執行的常見名稱（只對這些名稱檢查，避免把套件附的指令誤判成 script）
const COMMON_SCRIPT_NAMES = new Set(['dev', 'serve', 'start', 'build', 'preview', 'lint', 'format', 'test', 'watch', 'generate', 'typecheck', 'type-check', 'storybook', 'e2e', 'coverage']);
// 套件管理工具自己的指令，不是 script
const PNPM_BUILTINS = new Set(['add', 'install', 'i', 'remove', 'rm', 'uninstall', 'update', 'up', 'upgrade', 'exec', 'dlx', 'create', 'init', 'publish', 'store', 'list', 'ls', 'why', 'outdated', 'audit', 'link', 'unlink', 'prune', 'rebuild', 'import', 'setup', 'env', 'config', 'fetch', 'deploy', 'patch', 'patch-commit', 'licenses', 'root', 'bin', 'pack', 'server', 'recursive', 'approve-builds', 'self-update', 'doctor']);
const YARN_BUILTINS = new Set(['add', 'install', 'remove', 'upgrade', 'up', 'init', 'dlx', 'create', 'workspace', 'workspaces', 'global', 'why', 'info', 'config', 'cache', 'set', 'plugin', 'version', 'pack', 'npm', 'node', 'exec', 'bin', 'link', 'unlink', 'constraints', 'explain', 'import', 'outdated', 'audit', 'publish', 'login', 'logout']);

/** 專案用的套件管理工具：鎖定檔與 packageManager 一致才算數 */
export function projectManager(project, pkg) {
  const locks = LOCKFILES.filter(([file]) => project.exists(file));
  const fromLock = [...new Set(locks.map(([, pm]) => pm))];
  const fromField = typeof pkg?.packageManager === 'string' ? pkg.packageManager.split('@')[0] : null;
  if (fromLock.length > 1) return null;
  if (fromLock.length === 1) {
    if (fromField && fromField !== fromLock[0]) return null;
    return { name: fromLock[0], evidence: locks.find(([, pm]) => pm === fromLock[0])[0] };
  }
  if (fromField && MANAGERS.includes(fromField)) return { name: fromField, evidence: 'package.json packageManager' };
  return null;
}

/** 全域安裝工具（例如 npm install -g pnpm）不算專案的安裝指令 */
function isGlobalInstall(tokens) {
  return tokens.includes('-g') || tokens.includes('--global') || (tokens[0] === 'yarn' && tokens[1] === 'global');
}

/** 每個指令區塊裡的指令（依出現順序） */
function* commandSegments(md) {
  for (const block of commandBlocks(md)) {
    for (const { line, text } of commandLinesOf(block)) {
      for (const segment of splitSegments(text)) {
        yield { block, line, segment, tokens: tokenize(segment) };
      }
    }
  }
}

/**
 * 從一個套件管理工具指令找出要執行的 script 名稱；不是執行 script 時傳回 null。
 * @returns {{name:string, explicit:boolean}|null}
 */
function scriptOf(tokens, pkg) {
  const [pm, ...rest] = tokens;
  if (!MANAGERS.includes(pm) || rest.length === 0) return null;
  // 指定其他子專案的指令（monorepo）不檢查
  if (rest.some((t) => ['--filter', '-F', '-C', '--dir', '--prefix', '-w', '--workspace', '-r', '--recursive', '--workspaces'].includes(t) || t.startsWith('--filter=') || t.startsWith('--workspace='))) return null;
  const args = rest.filter((t) => !t.startsWith('-'));
  const [command, next] = args;
  if (!command) return null;
  if (command === 'run' || command === 'run-script') return next ? { name: next, explicit: true } : null;
  if (['test', 't', 'tst'].includes(command)) return pm === 'bun' ? null : { name: 'test', explicit: true };
  if (['start', 'stop', 'restart'].includes(command)) return pm === 'bun' ? null : { name: command, explicit: true, builtin: command };
  if (pm === 'npm' || pm === 'bun') return null;
  if (pm === 'pnpm' && PNPM_BUILTINS.has(command)) return null;
  if (pm === 'yarn' && YARN_BUILTINS.has(command)) return null;
  // pnpm dev、yarn build 這類省略 run 的寫法：只檢查常見的 script 名稱，而且不能是套件附的指令
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  if (command in deps) return null;
  if (COMMON_SCRIPT_NAMES.has(command) || command.includes(':')) return { name: command, explicit: false };
  return null;
}

// CMD003 檢查的區塊語言：會直接複製去執行的 shell，或沒標語言
const PROMPT_LANGS = new Set(['bash', 'sh', 'shell', 'zsh', '']);
// 行首的「$ 」提示符號；$HOME、$(…)、${…} 這種變數或子指令不算
const PROMPT_LINE = /^\s*\$\s+\S/;

export const checks = {
  CMD003(ctx) {
    const problems = [];
    for (const block of ctx.md.codeBlocks) {
      if (!PROMPT_LANGS.has(block.lang) || isDemoBlock(block)) continue;
      const hits = block.lines.filter(({ text }) => PROMPT_LINE.test(text));
      if (!hits.length) continue;
      const first = hits[0].line;
      const last = hits.at(-1).line;
      const lines =
        first === last
          ? { 'zh-TW': `第 ${first} 行`, en: `line ${first}` }
          : { 'zh-TW': `第 ${first}–${last} 行`, en: `lines ${first}–${last}` };
      problems.push({ messageKey: 'prompt', params: { lines }, line: first, column: hits[0].text.indexOf('$') + 1 });
    }
    return problems;
  },

  CMD002(ctx) {
    return ctx.md.codeBlocks.filter((b) => b.lang === '').map((b) => ({ messageKey: 'missing', line: b.startLine, column: 1 }));
  },

  CMD004(ctx) {
    const manager = projectManager(ctx.project, ctx.pkg);
    if (!manager) return [];
    const byBlock = new Map();
    for (const item of commandSegments(ctx.md)) {
      const pm = item.tokens[0];
      if (!MANAGERS.includes(pm) || isGlobalInstall(item.tokens)) continue;
      if (!byBlock.has(item.block)) byBlock.set(item.block, []);
      byBlock.get(item.block).push({ ...item, pm });
    }
    const out = [];
    for (const items of byBlock.values()) {
      // 同一個區塊同時列了專案用的管理器，視為「列出多種做法」，不在這裡報
      if (items.some((it) => it.pm === manager.name)) continue;
      const reported = new Set();
      for (const it of items) {
        if (it.pm === manager.name || reported.has(it.line)) continue;
        reported.add(it.line);
        const column = it.block.lines.find((l) => l.line === it.line).text.indexOf(it.pm) + 1;
        out.push({ messageKey: 'mismatch', params: { used: it.pm, expected: manager.name, evidence: manager.evidence }, line: it.line, column });
      }
    }
    return out;
  },

  CMD005(ctx) {
    const { project } = ctx;
    if (!ctx.pkg) return [];
    const out = [];
    const cache = new Map();
    const pkgAt = (dir) => {
      if (!cache.has(dir)) cache.set(dir, readPackageJson(project, dir));
      return cache.get(dir);
    };
    let cwd = '.';
    let lastBlock = null;
    const cloneNames = new Set([project.name]);
    for (const item of commandSegments(ctx.md)) {
      const { tokens } = item;
      // 切到子資料夾（或不知道切到哪）之後，下一個程式碼區塊在哪個資料夾執行就不確定了，先不檢查
      if (item.block !== lastBlock) {
        if (lastBlock && cwd !== '.') cwd = null;
        lastBlock = item.block;
      }
      if (tokens[0] === 'git' && tokens[1] === 'clone') {
        const url = tokens.slice(2).find((t) => !t.startsWith('-'));
        const dirArg = tokens.slice(2).filter((t) => !t.startsWith('-'))[1];
        if (url) cloneNames.add(url.replace(/\/+$/, '').split(/[/:]/).pop().replace(/\.git$/, ''));
        if (dirArg) cloneNames.add(dirArg);
        continue;
      }
      if (tokens[0] === 'cd') {
        const target = tokens[1];
        if (!target || target === '~') {
          cwd = null;
        } else if (cwd !== null && cloneNames.has(target.replace(/\/+$/, '')) && cwd === '.') {
          cwd = '.';
        } else if (cwd !== null) {
          const next = path.posix.normalize(path.posix.join(cwd, target));
          cwd = !next.startsWith('..') && project.isDir(next) ? next : null;
        }
        continue;
      }
      if (cwd === null) continue;
      const pkg = pkgAt(cwd);
      if (!pkg) continue;
      const script = scriptOf(tokens, pkg);
      if (!script) continue;
      const scripts = pkg.scripts ?? {};
      if (script.name in scripts) continue;
      // npm start 沒有 start script 時，會改跑 server.js
      if (script.builtin === 'start' && project.exists(cwd === '.' ? 'server.js' : `${cwd}/server.js`)) continue;
      if (script.builtin === 'restart' || script.builtin === 'stop') continue;
      const names = Object.keys(scripts);
      const column = item.block.lines.find((l) => l.line === item.line).text.indexOf(tokens[0]) + 1;
      out.push(
        names.length
          ? { messageKey: 'missing', params: { script: script.name, available: { 'zh-TW': names.join('、'), en: names.join(', ') } }, line: item.line, column }
          : { messageKey: 'noScripts', params: { script: script.name }, line: item.line, column },
      );
    }
    return out;
  },

  CMD008(ctx) {
    const out = [];
    for (const block of shellBlocks(ctx.md)) {
      for (const { line, text } of block.lines) {
        const clean = stripPrompt(stripPlaceholders(text));
        if (clean.trim() === '' || /^\s*#/.test(clean)) continue;
        const column = text.length - text.trimStart().length + 1;
        if (/^\s*(?:帳號|密碼|使用者名稱|account|password|passwd|username|user|email|login)\s*[:：]/i.test(clean)) {
          out.push({ messageKey: 'account', line, column });
        } else if (/^\s*https?:\/\/\S+\s*$/i.test(clean)) {
          out.push({ messageKey: 'url', line, column });
        } else if (CJK_LETTER.test(stripQuotedAndComment(clean))) {
          out.push({ messageKey: 'text', line, column });
        }
      }
    }
    return out;
  },

  CMD010(ctx) {
    const out = [];
    const FULL_WIDTH = /[\u3000\uFF01-\uFF5E\u201C\u201D\u2018\u2019\u300C\u300D\u300E\u300F\u2014\u2013\u2026\u3001\u3002]/;
    for (const block of shellBlocks(ctx.md)) {
      for (const { line, text } of block.lines) {
        const withoutPlaceholders = stripPlaceholders(text);
        if (/^\s*(?:\$\s+)?#/.test(withoutPlaceholders)) continue;
        const scan = stripQuotedAndComment(withoutPlaceholders);
        // 有中文字的行交給 CMD008（那一行本來就不是指令）
        if (CJK_LETTER.test(scan)) continue;
        const m = scan.match(FULL_WIDTH);
        if (m) out.push({ messageKey: 'found', params: { char: m[0] === '\u3000' ? { 'zh-TW': '全形空白', en: 'full-width space' } : m[0] }, line, column: m.index + 1 });
      }
    }
    return out;
  },

  CMD012(ctx) {
    const test = ctx.pkg?.scripts?.test;
    if (typeof test !== 'string' || /no test specified/i.test(test)) return [];
    for (const item of commandSegments(ctx.md)) {
      const t = item.tokens;
      if (MANAGERS.includes(t[0]) && t.slice(1).some((x) => /^(?:test|t|tst)(?::|$)/.test(x))) return [];
      if (t.some((x) => ['vitest', 'jest', 'mocha', 'ava', 'tap', 'playwright', 'cypress'].includes(x))) return [];
      if (t[0] === 'node' && t.includes('--test')) return [];
    }
    const anchor = findSection(ctx.sections, 'testing') ?? findSection(ctx.sections, 'getting-started');
    return [{ messageKey: 'missing', params: { command: test }, line: anchor?.line ?? null, column: anchor ? 1 : null }];
  },
};
