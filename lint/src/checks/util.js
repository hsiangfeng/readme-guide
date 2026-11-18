// 規則共用的小工具。
import { isShellLanguage } from '../markdown.js';
import { stripPlaceholders } from '../data.js';

export const CJK_LETTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

/** 跳脫成可以放進比對式的文字 */
export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 一般文字行（不含程式碼、註解、參照定義）。prose 是遮掉行內程式碼後的文字。
 * @param {ReturnType<import('../markdown.js').parseMarkdown>} md
 */
export function proseLines(md) {
  return md.lines.filter((l) => l.kind === 'text' && !l.definition && (!l.heading || l.heading.line === l.line));
}

/** 一般文字行，保留行內程式碼的內容、只拿掉反引號 */
export function readableText(line) {
  return line.raw.replace(/`/g, ' ');
}

/** 示範 Markdown 寫法的區塊（四個反引號，或裡面還有圍欄），內容不是真的指令 */
export function isDemoBlock(block) {
  return (block.fence?.length ?? 3) > 3 || block.lines.some(({ text }) => /^\s*(?:`{3,}|~{3,})/.test(text));
}

/** 會被貼到終端機執行的程式碼區塊 */
export function shellBlocks(md) {
  return md.codeBlocks.filter((b) => isShellLanguage(b.lang) && !isDemoBlock(b));
}

/** 可能放指令的程式碼區塊：shell 類語言或沒標語言 */
export function commandBlocks(md) {
  return md.codeBlocks.filter((b) => (isShellLanguage(b.lang) || b.lang === '') && !isDemoBlock(b));
}

/** 去掉行首的提示符號 */
export function stripPrompt(text) {
  return text.replace(/^\s*(?:\$|PS[^>]*>|>)\s+/, '');
}

/**
 * 把程式碼區塊拆成一行一行的指令：合併行尾反斜線的續行、去掉提示符號、略過註解。
 * @returns {Array<{line:number, text:string}>}
 */
export function commandLinesOf(block) {
  const result = [];
  let pending = null;
  for (const { line, text } of block.lines) {
    const clean = stripPrompt(stripPlaceholders(text));
    if (pending) {
      pending.text += ` ${clean.replace(/\\\s*$/, '').trim()}`;
      if (!/\\\s*$/.test(clean)) {
        result.push(pending);
        pending = null;
      }
      continue;
    }
    if (clean.trim() === '' || /^\s*#/.test(clean)) continue;
    if (/\\\s*$/.test(clean)) {
      pending = { line, text: clean.replace(/\\\s*$/, '').trim() };
      continue;
    }
    result.push({ line, text: clean.trim() });
  }
  if (pending) result.push(pending);
  return result;
}

/** 依 &&、||、;、| 拆開一行裡的多個指令（引號裡的不拆） */
export function splitSegments(text) {
  const segments = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = null;
      current += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      current += c;
      continue;
    }
    if (c === '#' && (i === 0 || /\s/.test(text[i - 1]))) break;
    if (c === ';' || c === '|' || (c === '&' && text[i + 1] === '&')) {
      segments.push(current);
      current = '';
      if ((c === '&' && text[i + 1] === '&') || (c === '|' && text[i + 1] === '|')) i++;
      continue;
    }
    current += c;
  }
  segments.push(current);
  return segments.map((s) => s.trim()).filter(Boolean);
}

/** 拆成單字（引號包住的算一個） */
export function tokenize(segment) {
  const tokens = [];
  for (const m of segment.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)) tokens.push(m[1] ?? m[2] ?? m[3]);
  // 去掉前面的環境變數設定與 sudo
  while (tokens.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[0]) || tokens[0] === 'sudo')) tokens.shift();
  return tokens;
}

/** 去掉引號包住的內容與行尾註解，用來找「不該出現在指令裡」的字 */
export function stripQuotedAndComment(text) {
  return text
    .replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, (m) => ' '.repeat(m.length))
    .replace(/(^|\s)#.*$/, (m, pre) => pre + ' '.repeat(m.length - pre.length));
}

/** 範圍內的二級以上章節（含子章節）的文字 */
export function textBetween(md, from, to) {
  return md.lines
    .filter((l) => l.line > from && l.line < to && l.kind !== 'comment')
    .map((l) => l.raw)
    .join('\n');
}

/** 一級標題到第一個二級標題之間（第 1 塊） */
export function introRange(md) {
  const h1 = md.headings.find((h) => h.level === 1);
  const start = h1 ? h1.line : 0;
  const next = md.headings.find((h) => h.line > start && h.level <= 2);
  return { h1, start, end: next ? next.line : md.lines.length + 1 };
}

/** 是不是徽章圖片 */
export function isBadge(src) {
  return /img\.shields\.io|badgen\.net|badge\.fury\.io|\/badge(?:\.svg)?(?:[?#]|$)|\/badges?\/|codecov\.io\/.+\/(?:badge|graph)|coveralls\.io\/repos\/.+\/badge|deploy-status|\/status\.svg/i.test(src);
}

/** 網址的主機名稱 */
export function hostOf(url) {
  return url.match(/^(?:https?:)?\/\/([^/?#:]+)/i)?.[1]?.toLowerCase() ?? null;
}

/** 是不是外部網址或特殊連結（不是相對路徑） */
export function isExternal(href) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
}
