// 把 README 的標題對到 rules/headings.json 定義的章節，再對到八塊。
import { data } from './data.js';

const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu;

/**
 * 標題文字正規化：小寫、去掉表情符號、編號、結尾冒號與括號補充。
 * @param {string} text
 */
export function normalizeHeading(text) {
  return text
    .replace(EMOJI, '')
    .replace(/\u3000/g, ' ')
    .trim()
    .replace(/^(?:\d+(?:\.\d+)*[.)、]?|[一二三四五六七八九十]+、)\s*/, '')
    .replace(/\s*[（(][^）)]*[）)]\s*$/, '')
    .replace(/\s*[:：]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** 每個正規化後的別名對到哪些章節 */
function buildAliasIndex() {
  const index = new Map();
  const add = (alias, ids) => {
    const key = normalizeHeading(alias);
    if (!index.has(key)) index.set(key, new Set());
    for (const id of ids) index.get(key).add(id);
  };
  for (const section of data.headings.sections) {
    for (const lang of Object.keys(section.title)) add(section.title[lang], [section.id]);
    for (const lang of Object.keys(section.aliases)) for (const alias of section.aliases[lang]) add(alias, [section.id]);
  }
  for (const combo of data.headings.combined) {
    for (const lang of Object.keys(combo.aliases)) for (const alias of combo.aliases[lang]) add(alias, combo.sections);
  }
  return index;
}

let aliasIndex = null;

/**
 * 找出一個標題對到哪些章節。
 * @param {string} text 標題的純文字
 * @param {number} level 標題層級
 * @returns {string[]} 章節代號
 */
export function matchHeading(text, level) {
  aliasIndex ??= buildAliasIndex();
  const whole = normalizeHeading(text);
  const candidates = [whole];
  // 雙語標題：「功能 / Features」「安裝與執行｜Getting Started」
  const parts = text.split(/\s*[/／|｜]\s*|\s+[-–—]\s+/).map(normalizeHeading).filter(Boolean);
  if (parts.length > 1) candidates.push(...parts);
  let found = null;
  for (const candidate of candidates) {
    const hit = aliasIndex.get(candidate);
    if (hit) {
      found = [...hit];
      break;
    }
  }
  if (!found) return [];
  if (found.length > 1) {
    // 同一個名稱對到不同層級的章節時（例如 Installation），以層級相同的優先
    const sameLevel = found.filter((id) => sectionDef(id).level === level);
    const isCombined = data.headings.combined.some((c) => c.sections.length === found.length && c.sections.every((s) => found.includes(s)));
    if (!isCombined && sameLevel.length > 0) return sameLevel.slice(0, 1);
    if (!isCombined) return found.slice(0, 1);
  }
  return found;
}

/** 依代號取得章節定義 */
export function sectionDef(id) {
  return data.headings.sections.find((s) => s.id === id);
}

/**
 * 依代號取得塊的資訊（含編號）。編號由 rules/blocks.json 的排列順序決定。
 * @param {string} slug
 */
export function blockInfo(slug) {
  const index = data.blocks.blocks.findIndex((b) => b.slug === slug);
  if (index === -1) return null;
  const block = data.blocks.blocks[index];
  return { slug, index, number: String(index + 1).padStart(2, '0'), name: block.name };
}

/**
 * 依標題切出章節，並對到八塊。
 * @param {ReturnType<import('./markdown.js').parseMarkdown>} md
 */
export function buildSections(md) {
  const total = md.lines.length;
  return md.headings.map((heading, i) => {
    let endLine = total + 1;
    for (let k = i + 1; k < md.headings.length; k++) {
      if (md.headings[k].level <= heading.level) {
        endLine = md.headings[k].line;
        break;
      }
    }
    const ids = heading.level >= 2 ? matchHeading(heading.text, heading.level) : [];
    const block = ids.length ? sectionDef(ids[0]).block : null;
    return { ...heading, endLine, ids, block };
  });
}

/**
 * 找某個章節（第一個符合的標題，層級 2 的優先）。
 * @param {ReturnType<typeof buildSections>} sections
 * @param {string} id
 */
export function findSection(sections, id) {
  const all = sections.filter((s) => s.ids.includes(id));
  return all.find((s) => s.level === 2) ?? all[0] ?? null;
}

/**
 * 某一行屬於哪一塊：往上找最近一個對得到章節的二級標題；在第一個二級標題之前算第 1 塊。
 * @param {ReturnType<typeof buildSections>} sections
 * @param {number} line
 */
export function blockOfLine(sections, line) {
  let result = null;
  let sawH2 = false;
  for (const section of sections) {
    if (section.line > line) break;
    if (section.level === 2) {
      sawH2 = true;
      result = section.block;
    } else if (section.level > 2 && sawH2 && result === null && section.block) {
      // 二級標題對不到章節，但底下的三級標題對得到
      result = section.block;
    }
  }
  if (!sawH2) return data.blocks.blocks[0].slug;
  return result;
}

/**
 * 章節範圍內的行（不含標題本身）。
 * @param {ReturnType<import('./markdown.js').parseMarkdown>} md
 * @param {{line:number,endLine:number}} section
 */
export function sectionLines(md, section) {
  return md.lines.filter((l) => l.line > section.line && l.line < section.endLine);
}

/**
 * 章節範圍內的程式碼區塊。
 */
export function sectionCodeBlocks(md, section) {
  return md.codeBlocks.filter((b) => b.startLine > section.line && b.startLine < section.endLine);
}

/**
 * 章節範圍內所有文字（含程式碼），用來找關鍵字。
 */
export function sectionText(md, section) {
  return sectionLines(md, section)
    .filter((l) => l.kind !== 'comment' && l.kind !== 'frontmatter')
    .map((l) => l.raw)
    .join('\n');
}
