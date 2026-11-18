// 結構與「還沒填完」類的規則。
import { data, hasPlaceholder, isSyntaxMention, placeholderPattern } from '../data.js';
import { plainText } from '../markdown.js';
import { blockInfo, findSection, sectionDef } from '../sections.js';
import { introRange, proseLines } from './util.js';

const WRAPPER_TAG_ONLY = /^\s*(?:<\/?(?:div|p|center|section|span|br|picture)\b[^>]*>\s*)+$/i;

/** 狀態行：「狀態：」「Status:」開頭（可以是清單項目或粗體） */
function statusLinePattern() {
  const prefixes = [...data.conventions.status.prefixes['zh-TW'], ...data.conventions.status.prefixes.en];
  return new RegExp(`^\\s*(?:[-*+]\\s+)?(?:\\*\\*|__)?(?:${prefixes.join('|')})(?:\\*\\*|__)?\\s*[:：]`, 'i');
}

/** 一個區塊拿掉圖片、包圖片的連結、HTML 標籤與分隔符號後，還有沒有文字 */
function blockHasText(md, block) {
  const text = md.lines
    .filter((l) => l.line >= block.startLine && l.line <= block.endLine)
    .map((l) => l.prose)
    .join(' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/\[\s*\]\([^)]*\)/g, '')
    .replace(/\[\s*\]\[[^\]]*\]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[|｜·•\s]/g, '');
  return text.length > 0;
}

/** 計算一句話說明的長度：中文以字計（英文單字算一個），英文以字元計 */
function descriptionLength(text, lang) {
  if (lang === 'en') return text.length;
  const han = (text.match(/\p{Script=Han}/gu) ?? []).length;
  const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  const punct = (text.match(/[^\p{Script=Han}A-Za-z0-9\s]/gu) ?? []).length;
  return han + words + punct;
}

/** 第 1 塊：一級標題之後、下一個標題之前的第一個有文字的區塊 */
function findDescription(md) {
  const { h1, end } = introRange(md);
  if (!h1) return { h1: null, block: null };
  const nextHeading = md.headings.find((h) => h.line > h1.line);
  const limit = nextHeading ? Math.min(nextHeading.line, end) : end;
  const firstLine = h1.style === 'setext' ? h1.line + 1 : h1.line;
  for (const block of md.blocks) {
    if (block.startLine <= firstLine || block.startLine >= limit) continue;
    if (block.type === 'wrapper' || block.type === 'heading') continue;
    if ((block.type === 'paragraph' || block.type === 'html') && !blockHasText(md, block)) continue;
    // 狀態行寫在說明前面時，跳過它繼續找
    if (block.type === 'paragraph' && block.startLine === block.endLine && statusLinePattern().test(md.lines[block.startLine - 1].raw)) continue;
    return { h1, block };
  }
  return { h1, block: null };
}

// 必填章節裡，另外有專門規則負責的（章節 → 規則代號）
const HANDLED_ELSEWHERE = { 'api-docs': 'TYPE-API001' };
// 「安裝與執行」底下的小節
const INSTALL_CHILDREN = new Set(['requirements', 'install-steps']);

function ruleApplies(id, type) {
  const rule = data.rules.rules.find((r) => r.id === id);
  return Boolean(rule && rule.status === 'implemented' && rule.types.includes(type));
}

/**
 * 「安裝與執行」裡，「環境需求」「執行測試」以外的地方有沒有寫指令或步驟。
 * 只有一個「安裝」標題直接寫步驟、把步驟拆成好幾個自訂小節（「取得專案」「安裝套件」）、或用表格連到各平台的安裝說明，都算有寫安裝步驟。
 */
function installWrittenDirectly(ctx) {
  const section = findSection(ctx.sections, 'getting-started');
  if (!section) return false;
  const excluded = ctx.sections.filter(
    (s) => s.line > section.line && s.line < section.endLine && (s.ids.includes('requirements') || s.ids.includes('testing')),
  );
  const inRange = (n) => n > section.line && n < section.endLine && !excluded.some((s) => n > s.line && n < s.endLine);
  // 指令區塊、清單步驟、表格、連到其他安裝說明的連結，都算有寫
  return ctx.md.codeBlocks.some((b) => inRange(b.startLine))
    || ctx.md.links.some((l) => inRange(l.line))
    || ctx.md.lines.some((l) => inRange(l.line) && l.kind === 'text' && /^\s*(?:\d+[.)]|[-*+])\s+\S|^\s*\|/.test(l.raw));
}

export const checks = {
  STR002(ctx) {
    const { md } = ctx;
    const out = [];
    const first = md.lines.find((l) => l.kind === 'text' && !l.definition && !WRAPPER_TAG_ONLY.test(l.raw));
    const h1s = md.headings.filter((h) => h.level === 1);
    if (h1s.length === 0) {
      out.push({ messageKey: 'missing', line: first?.line ?? 1, column: 1 });
    } else if (!first || first.line !== h1s[0].line) {
      out.push({ messageKey: 'notFirst', line: first?.line ?? 1, column: 1 });
    }
    h1s.slice(1).forEach((h, i) => out.push({ messageKey: 'extra', params: { count: i + 2 }, line: h.line, column: 1 }));
    return out;
  },

  STR003(ctx) {
    const { h1, block } = findDescription(ctx.md);
    if (!h1) return [];
    const missing = () => [{ messageKey: 'missing', line: h1.line, column: 1 }];
    if (!block) return missing();
    if (block.type === 'blockquote') return [];
    if (block.type !== 'paragraph' && block.type !== 'html') return missing();
    return [];
  },

  STR014(ctx) {
    const { md } = ctx;
    const { block } = findDescription(md);
    if (!block) return [];
    const raw = md.lines.filter((l) => l.line >= block.startLine && l.line <= block.endLine).map((l) => l.raw);
    if (block.type === 'blockquote') return [{ messageKey: 'quote', line: block.startLine, column: 1 }];
    if (block.type !== 'paragraph' && block.type !== 'html') return [];
    if (statusLinePattern().test(raw[0])) return [];
    // 一句話說明只看第一行（下一行可能就是狀態）
    const text = plainText(raw[0]);
    if (hasPlaceholder(text)) return [];
    const max = data.conventions.oneLiner.maxLength[ctx.docLang];
    const length = descriptionLength(text, ctx.docLang);
    if (length > max) return [{ messageKey: 'tooLong', params: { length, max }, line: block.startLine, column: 1 }];
    return [];
  },

  STR004(ctx) {
    const { md } = ctx;
    const { h1, start, end } = introRange(md);
    const lines = md.lines.filter((l) => l.line > start && l.line < end && l.kind === 'text');
    const pattern = statusLinePattern();
    if (lines.some((l) => pattern.test(l.raw))) return [];
    const values = [...data.conventions.status.values['zh-TW'], ...data.conventions.status.values.en];
    const text = lines.map((l) => plainText(l.raw)).join(' ');
    if (values.some((v) => (/[A-Za-z]/.test(v) ? new RegExp(`\\b${v}\\b`, 'i').test(text) : text.includes(v)))) return [];
    const badges = md.images.filter((img) => img.line > start && img.line < end);
    if (badges.some((img) => /status|maintained|maintenance|archived|deprecated/i.test(`${img.src} ${img.alt ?? ''}`))) return [];
    return [{ messageKey: 'missing', line: h1 ? h1.line : null, column: h1 ? 1 : null }];
  },

  STR005(ctx) {
    const out = [];
    let prev = null;
    for (const h of ctx.md.headings) {
      if (prev !== null && h.level > prev + 1) {
        out.push({ messageKey: 'skip', params: { from: prev, to: h.level }, line: h.line, column: 1 });
      }
      prev = h.level;
    }
    return out;
  },

  STR006(ctx) {
    const out = [];
    const has = (id) => ctx.sections.some((s) => s.ids.includes(id));
    for (const id of ctx.typeDef.required) {
      // 這幾個章節有專門的規則檢查（判斷得比較寬鬆），不在這裡重複報
      if (HANDLED_ELSEWHERE[id] && ruleApplies(HANDLED_ELSEWHERE[id], ctx.type)) continue;
      // 整個「安裝與執行」都沒有時，只報缺少「安裝與執行」，不再逐一報底下的小節
      if (INSTALL_CHILDREN.has(id) && !has('getting-started')) continue;
      if (has(id)) continue;
      // 只有一個「安裝」二級標題、底下直接寫步驟（沒有分小節），也算有寫安裝步驟
      if (id === 'install-steps' && installWrittenDirectly(ctx)) continue;
      const def = sectionDef(id);
      out.push({ messageKey: 'missing', params: { section: def.title, type: ctx.typeDef.name }, line: null, column: null, block: def.block });
    }
    return out;
  },

  STR007(ctx) {
    const out = [];
    let max = null;
    for (const section of ctx.sections) {
      if (section.level !== 2 || !section.block) continue;
      const info = blockInfo(section.block);
      if (max && info.index < max.info.index) {
        out.push({
          messageKey: 'order',
          params: { heading: section.text, number: info.number, before: max.section.text, beforeNumber: max.info.number },
          line: section.line,
          column: 1,
          block: section.block,
        });
        continue;
      }
      if (!max || info.index > max.info.index) max = { section, info };
    }
    return out;
  },

  STR008(ctx) {
    const h2 = ctx.sections.filter((s) => s.level === 2);
    const index = h2.findIndex((s) => s.ids.includes('license'));
    if (index === -1 || index === h2.length - 1) return [];
    const after = h2[index + 1];
    return [{ messageKey: 'notLast', params: { heading: after.text }, line: after.line, column: 1 }];
  },

  STR009(ctx) {
    const { md } = ctx;
    const out = [];
    for (const section of ctx.sections) {
      if (section.level < 2) continue;
      const hasContent = md.lines.some(
        (l) =>
          l.line > section.line &&
          l.line < section.endLine &&
          ((l.kind === 'text' && !l.heading) || l.kind === 'fence' || l.kind === 'code'),
      );
      if (!hasContent) out.push({ messageKey: 'empty', params: { heading: section.text }, line: section.line, column: 1 });
    }
    return out;
  },

  STR010(ctx) {
    const { md } = ctx;
    const out = [];
    const phrases = ['請務必依據你的專案', '請斟酌', '範本不是絕對', 'Lorem ipsum'];
    for (const line of proseLines(md)) {
      for (const phrase of phrases) {
        const index = line.prose.toLowerCase().indexOf(phrase.toLowerCase());
        if (index !== -1) out.push({ messageKey: 'phrase', params: { text: line.raw.slice(index, index + phrase.length) }, line: line.line, column: index + 1 });
      }
      const bare = line.prose.trim().replace(/^(?:[-*+]|\d+[.)])\s+/, '');
      if (/^(?:\.{3,}|…+)$/.test(bare)) out.push({ messageKey: 'ellipsis', line: line.line, column: line.raw.indexOf(bare[0]) + 1 });
    }
    for (const line of md.lines) {
      if (line.kind !== 'text' && line.kind !== 'code') continue;
      const index = line.raw.toLowerCase().indexOf('example@example.com');
      if (index !== -1) out.push({ messageKey: 'phrase', params: { text: 'example@example.com' }, line: line.line, column: index + 1 });
    }
    return out;
  },

  STR015(ctx) {
    const out = [];
    for (const line of ctx.md.lines) {
      if (line.kind !== 'text' && line.kind !== 'code') continue;
      for (const m of line.raw.matchAll(placeholderPattern())) {
        if (isSyntaxMention(m[0])) continue;
        out.push({ messageKey: 'placeholder', params: { text: m[0] }, line: line.line, column: m.index + 1 });
      }
    }
    return out;
  },
};

export { findDescription, findSection };
