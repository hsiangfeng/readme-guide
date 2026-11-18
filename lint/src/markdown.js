// 輕量的 Markdown 解析：只做到規則用得到的程度。
// 處理：程式碼區塊（``` 與 ~~~）、HTML 註解、標題（# 與底線式、單行 <h1>）、
// 行內程式碼、圖片與連結（含參照式、徽章外面包連結）、HTML 的 <img> 與 <a>、表格。
// 不處理：縮排四格的程式碼區塊、跨行的 HTML 標籤、跨行的行內程式碼。

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})(.*)$/;
const ATX_HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const SETEXT_H1 = /^ {0,3}=+[ \t]*$/;
const SETEXT_H2 = /^ {0,3}-+[ \t]*$/;
const HTML_HEADING = /^\s*<h([1-6])\b[^>]*>(.*?)<\/h\1>\s*$/i;
const REF_DEFINITION = /^ {0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*$/;
const LIST_ITEM = /^\s{0,3}(?:[-*+]|\d+[.)])(?:\s|$)/;
const BLOCKQUOTE = /^\s{0,3}>/;
const THEMATIC_BREAK = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;
const HTML_LINE = /^\s{0,3}<\/?[a-zA-Z][^>]*>?/;
// 只有開關標籤、沒有文字的一行（例如 <div align="center">）
const WRAPPER_TAG_ONLY = /^\s*(?:<\/?(?:div|p|center|section|span|br|picture)\b[^>]*>\s*)+$/i;

/**
 * 解析 Markdown 文字。
 * @param {string} source 原始文字
 */
export function parseMarkdown(source) {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const raw = text.split('\n');
  /** 每一行的種類：blank、text、fence、code、comment、frontmatter */
  const kinds = new Array(raw.length).fill('text');
  const codeBlocks = [];

  // 第一輪：前置資料、程式碼區塊、HTML 註解
  let i = 0;
  if (raw[0] === '---') {
    const end = raw.findIndex((line, idx) => idx > 0 && idx < 60 && (line === '---' || line === '...'));
    const body = end > 0 ? raw.slice(1, end) : [];
    if (end > 0 && body.length > 0 && body.every((line) => line.trim() === '' || /^[\w-]+\s*:/.test(line) || /^\s/.test(line))) {
      for (let k = 0; k <= end; k++) kinds[k] = 'frontmatter';
      i = end + 1;
    }
  }
  let fence = null;
  let inComment = false;
  for (; i < raw.length; i++) {
    const line = raw[i];
    if (fence) {
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence.char && close[1].length >= fence.length) {
        kinds[i] = 'fence';
        fence.block.endLine = i + 1;
        fence = null;
      } else {
        kinds[i] = 'code';
        fence.block.lines.push({ line: i + 1, text: line });
      }
      continue;
    }
    if (inComment) {
      kinds[i] = 'comment';
      if (line.includes('-->')) inComment = false;
      continue;
    }
    const open = line.match(FENCE_OPEN);
    if (open && !(open[2][0] === '`' && open[3].includes('`'))) {
      const info = open[3].trim();
      const lang = (info.match(/^\{?\.?([^\s{}]+)/)?.[1] ?? '').toLowerCase();
      const block = { startLine: i + 1, endLine: raw.length, info, lang, fence: open[2], lines: [] };
      codeBlocks.push(block);
      fence = { char: open[2][0], length: open[2].length, block };
      kinds[i] = 'fence';
      continue;
    }
    if (/^\s*<!--/.test(line)) {
      kinds[i] = 'comment';
      const rest = line.slice(line.indexOf('<!--') + 4);
      if (!rest.includes('-->')) inComment = true;
      continue;
    }
    kinds[i] = line.trim() === '' ? 'blank' : 'text';
  }

  // 參照式連結的定義
  const definitions = new Map();
  const isDefinition = new Array(raw.length).fill(false);
  raw.forEach((line, idx) => {
    if (kinds[idx] !== 'text') return;
    const m = line.match(REF_DEFINITION);
    if (m && !/^\^/.test(m[1])) {
      definitions.set(normalizeLabel(m[1]), m[2]);
      isDefinition[idx] = true;
    }
  });

  // 第二輪：標題
  const headings = [];
  const headingAt = new Map();
  for (let idx = 0; idx < raw.length; idx++) {
    if (kinds[idx] !== 'text' || isDefinition[idx]) continue;
    const line = raw[idx];
    const atx = line.match(ATX_HEADING);
    if (atx) {
      addHeading(idx, atx[1].length, atx[2] ?? '', 'atx');
      continue;
    }
    const html = line.match(HTML_HEADING);
    if (html) {
      addHeading(idx, Number(html[1]), html[2], 'html');
      continue;
    }
    const next = raw[idx + 1];
    if (next !== undefined && kinds[idx + 1] === 'text' && isParagraphLine(line)) {
      const prevIsText = idx > 0 && kinds[idx - 1] === 'text' && !headingAt.has(idx - 1) && isParagraphLine(raw[idx - 1]);
      if (SETEXT_H1.test(next)) {
        addHeading(idx, 1, line.trim(), 'setext', idx + 1);
        idx++;
      } else if (SETEXT_H2.test(next) && !prevIsText) {
        addHeading(idx, 2, line.trim(), 'setext', idx + 1);
        idx++;
      }
    }
  }

  function addHeading(idx, level, rawText, style, underlineIdx) {
    const heading = { line: idx + 1, level, raw: rawText, text: plainText(rawText), style };
    headings.push(heading);
    headingAt.set(idx, heading);
    if (underlineIdx !== undefined) headingAt.set(underlineIdx, heading);
  }

  // 行內內容：遮掉行內程式碼與註解後的文字、圖片、連結
  const lines = [];
  const images = [];
  const links = [];
  const inlineCode = [];
  for (let idx = 0; idx < raw.length; idx++) {
    const kind = kinds[idx];
    const entry = { line: idx + 1, raw: raw[idx], kind, prose: '', heading: headingAt.get(idx) ?? null, definition: isDefinition[idx] };
    lines.push(entry);
    if (kind !== 'text') continue;
    if (headingAt.has(idx) && headingAt.get(idx).line !== idx + 1) {
      // 底線式標題的底線本身沒有內容
      continue;
    }
    const { masked, spans } = maskInline(raw[idx]);
    entry.prose = masked;
    for (const span of spans) inlineCode.push({ line: idx + 1, column: span.start + 1, text: span.text });
    if (isDefinition[idx]) continue;
    extractInline(masked, raw[idx], idx + 1, definitions, images, links);
  }

  // 區塊：連續的非空行合成一塊
  const blocks = [];
  let current = null;
  for (let idx = 0; idx < raw.length; idx++) {
    const kind = kinds[idx];
    if (kind === 'fence' || kind === 'code') {
      const block = codeBlocks.find((b) => b.startLine === idx + 1);
      if (block) {
        current = null;
        blocks.push({ type: 'code', startLine: block.startLine, endLine: block.endLine, code: block });
      }
      continue;
    }
    if (kind !== 'text' || isDefinition[idx]) {
      current = null;
      continue;
    }
    if (headingAt.has(idx)) {
      current = null;
      const heading = headingAt.get(idx);
      if (heading.line === idx + 1) blocks.push({ type: 'heading', startLine: idx + 1, endLine: heading.style === 'setext' ? idx + 2 : idx + 1, heading });
      continue;
    }
    if (!current) {
      current = { type: blockType(raw, idx), startLine: idx + 1, endLine: idx + 1 };
      blocks.push(current);
    } else {
      current.endLine = idx + 1;
    }
  }

  return { source: text, lines, kinds, headings, codeBlocks, blocks, images, links, inlineCode, definitions };
}

function isParagraphLine(line) {
  return !LIST_ITEM.test(line) && !BLOCKQUOTE.test(line) && !HTML_LINE.test(line) && !line.includes('|') && !THEMATIC_BREAK.test(line) && !ATX_HEADING.test(line);
}

function blockType(raw, idx) {
  const line = raw[idx];
  if (BLOCKQUOTE.test(line)) return 'blockquote';
  if (THEMATIC_BREAK.test(line)) return 'thematic';
  if (LIST_ITEM.test(line)) return 'list';
  if (line.includes('|') && raw[idx + 1] !== undefined && TABLE_SEPARATOR.test(raw[idx + 1]) && raw[idx + 1].includes('-')) return 'table';
  if (WRAPPER_TAG_ONLY.test(line)) return 'wrapper';
  if (HTML_LINE.test(line)) return 'html';
  return 'paragraph';
}

/**
 * 把行內程式碼與行內 HTML 註解換成等長的空白，位置不變。
 * @param {string} line
 */
export function maskInline(line) {
  const chars = line.split('');
  const spans = [];
  let pos = 0;
  while (pos < line.length) {
    if (line[pos] === '\\' && line[pos + 1] === '`') {
      pos += 2;
      continue;
    }
    if (line[pos] !== '`') {
      pos++;
      continue;
    }
    let runEnd = pos;
    while (line[runEnd] === '`') runEnd++;
    const run = line.slice(pos, runEnd);
    let search = runEnd;
    let close = -1;
    while (search < line.length) {
      const found = line.indexOf(run, search);
      if (found === -1) break;
      let after = found + run.length;
      if (line[found - 1] !== '`' && line[after] !== '`') {
        close = found;
        break;
      }
      while (line[after] === '`') after++;
      search = after;
    }
    if (close === -1) {
      pos = runEnd;
      continue;
    }
    spans.push({ start: pos, end: close + run.length, text: line.slice(runEnd, close).trim() });
    for (let k = pos; k < close + run.length; k++) chars[k] = ' ';
    pos = close + run.length;
  }
  let masked = chars.join('');
  masked = masked.replace(/<!--.*?-->/g, (m) => ' '.repeat(m.length));
  return { masked, spans };
}

/**
 * 從遮好的文字找出圖片與連結。位置以原始行為準（遮罩不改變長度）。
 */
function extractInline(masked, original, lineNo, definitions, images, links) {
  // HTML 的 <img>
  for (const m of masked.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = parseAttributes(m[1]);
    images.push({
      kind: 'html',
      alt: attrs.alt ?? null,
      altMissing: attrs.alt === undefined,
      src: attrs.src ?? '',
      line: lineNo,
      column: m.index + 1,
    });
  }
  // HTML 的 <a href>
  for (const m of masked.matchAll(/<a\b([^>]*)>(.*?)<\/a>/gi)) {
    const attrs = parseAttributes(m[1]);
    if (attrs.href !== undefined) {
      links.push({ kind: 'html', text: plainText(m[2]), href: attrs.href, line: lineNo, column: m.index + 1 });
    }
  }
  // 自動連結 <https://...>
  for (const m of masked.matchAll(/<((?:https?|mailto):[^>\s]+)>/gi)) {
    links.push({ kind: 'autolink', text: m[1], href: m[1], line: lineNo, column: m.index + 1 });
  }
  // Markdown 的圖片與連結（可能巢狀：[![徽章](圖)](連結)）
  scanBrackets(masked, 0, masked.length, lineNo, definitions, images, links);
}

function scanBrackets(text, from, to, lineNo, definitions, images, links) {
  let pos = from;
  while (pos < to) {
    const ch = text[pos];
    if (ch === '\\') {
      pos += 2;
      continue;
    }
    const isImage = ch === '!' && text[pos + 1] === '[';
    if (ch !== '[' && !isImage) {
      pos++;
      continue;
    }
    const open = isImage ? pos + 1 : pos;
    const close = findClosingBracket(text, open, to);
    if (close === -1) {
      pos = open + 1;
      continue;
    }
    const label = text.slice(open + 1, close);
    let target = null;
    let end = close + 1;
    if (text[close + 1] === '(') {
      const parsed = parseDestination(text, close + 1, to);
      if (parsed) {
        target = parsed.href;
        end = parsed.end;
      }
    } else if (text[close + 1] === '[') {
      const refClose = text.indexOf(']', close + 2);
      if (refClose !== -1) {
        const ref = text.slice(close + 2, refClose) || label;
        const href = definitions.get(normalizeLabel(ref));
        if (href !== undefined) {
          target = href;
          end = refClose + 1;
        }
      }
    } else {
      const href = definitions.get(normalizeLabel(label));
      if (href !== undefined) target = href;
    }
    if (target === null) {
      pos = open + 1;
      continue;
    }
    if (isImage) {
      images.push({ kind: 'markdown', alt: label.trim(), altMissing: label.trim() === '', src: target, line: lineNo, column: pos + 1 });
    } else {
      links.push({ kind: 'markdown', text: plainText(label), rawText: label, href: target, line: lineNo, column: pos + 1 });
      // 連結文字裡面可能還有圖片（徽章）
      scanBrackets(text, open + 1, close, lineNo, definitions, images, links);
    }
    pos = end;
  }
}

function findClosingBracket(text, open, to) {
  let depth = 0;
  for (let k = open; k < to; k++) {
    if (text[k] === '\\') {
      k++;
      continue;
    }
    if (text[k] === '[') depth++;
    else if (text[k] === ']') {
      depth--;
      if (depth === 0) return k;
    }
  }
  return -1;
}

function parseDestination(text, parenPos, to) {
  let k = parenPos + 1;
  while (text[k] === ' ') k++;
  let href = '';
  if (text[k] === '<') {
    const close = text.indexOf('>', k);
    if (close === -1) return null;
    href = text.slice(k + 1, close);
    k = close + 1;
  } else {
    let depth = 0;
    const start = k;
    while (k < to) {
      const c = text[k];
      if (c === '\\') {
        k += 2;
        continue;
      }
      if (c === '(') depth++;
      else if (c === ')') {
        if (depth === 0) break;
        depth--;
      } else if (c === ' ') break;
      k++;
    }
    href = text.slice(start, k);
  }
  // 選填的標題 "..."
  while (text[k] === ' ') k++;
  if (text[k] === '"' || text[k] === "'") {
    const quote = text[k];
    const close = text.indexOf(quote, k + 1);
    if (close === -1) return null;
    k = close + 1;
    while (text[k] === ' ') k++;
  }
  if (text[k] !== ')') return null;
  return { href, end: k + 1 };
}

function parseAttributes(source) {
  const attrs = {};
  for (const m of source.matchAll(/([a-zA-Z-:]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

function normalizeLabel(label) {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * 去掉 Markdown 與 HTML 標記，只留下看得到的文字。
 * @param {string} source
 */
export function plainText(source) {
  return source
    .replace(/<!--.*?-->/g, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/`+([^`]*)`+/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|[^\w*])[*_]([^*_]+)[*_](?=[^\w*]|$)/g, '$1$2')
    .replace(/\\([\\`*_{}[\]()#+\-.!|>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 是否是會被貼到終端機執行的程式碼區塊 */
export function isShellLanguage(lang) {
  return ['bash', 'sh', 'shell', 'zsh', 'console', 'shellsession', 'fish', 'powershell', 'ps1', 'pwsh', 'cmd', 'bat', 'batch', 'terminal'].includes(lang);
}
