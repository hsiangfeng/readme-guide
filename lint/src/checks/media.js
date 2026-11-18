// 圖片與連結類規則。
import path from 'node:path';
import { hasPlaceholder } from '../data.js';
import { introRange, hostOf, isBadge, isExternal } from './util.js';

const PLACEHOLDER_HOSTS = ['fakeimg.pl', 'placehold.co', 'placehold.it', 'via.placeholder.com', 'placeholder.com', 'dummyimage.com', 'picsum.photos', 'placekitten.com', 'loremflickr.com', 'placeimg.com'];
const GENERIC_ALT = /^(?:圖片?|截圖|畫面|照片|示意圖|範例圖片?|image|img|picture|pic|photo|screenshot|screen ?shot|preview|預覽)\s*\d*$/i;
const ALT_BAD_START = /^(?:圖片|截圖|image|picture|photo)\s*[:：]|^(?:an? )?(?:image|picture|photo|screenshot) of\b/i;
const FILE_NAME = /\.(?:png|jpe?g|gif|webp|svg|avif|bmp)$/i;
const VAGUE_LINK_TEXT = new Set(['這裡', '點這裡', '點此', '點我', '按這裡', '按此', '請點我', '請點這裡', '連結', '網址', '線上觀看連結', '觀看連結', '傳送門', 'here', 'click here', 'click', 'link', 'this link', 'this', 'read more', 'more', 'details']);
const POPULARITY = /(?:img\.shields\.io|badgen\.net)\/github\/(stars|forks|watchers|followers|issues-pr(?:-raw|-closed)?|issues(?:-raw|-closed)?|downloads|contributors)/i;

/** 把 README 裡的相對路徑換成專案根目錄底下的路徑 */
function resolveInProject(ctx, href) {
  let target = href.split('#')[0].split('?')[0];
  if (!target) return null;
  try {
    target = decodeURIComponent(target);
  } catch {
    // 保留原字串
  }
  const resolved = target.startsWith('/') ? target.slice(1) : path.posix.join(ctx.readmeDir, target);
  return path.posix.normalize(resolved);
}

export const checks = {
  IMG001(ctx) {
    return ctx.md.images.filter((img) => img.altMissing).map((img) => ({ messageKey: 'missing', line: img.line, column: img.column }));
  },

  IMG002(ctx) {
    const out = [];
    for (const img of ctx.md.images) {
      if (img.altMissing || !img.alt || isBadge(img.src) || hasPlaceholder(img.alt)) continue;
      const alt = img.alt.trim();
      if (GENERIC_ALT.test(alt) || ALT_BAD_START.test(alt) || FILE_NAME.test(alt)) {
        out.push({ messageKey: 'generic', params: { alt }, line: img.line, column: img.column });
      }
    }
    return out;
  },

  IMG003(ctx) {
    const out = [];
    for (const img of ctx.md.images) {
      if (!img.src || isExternal(img.src) || img.src.startsWith('#') || hasPlaceholder(img.src)) continue;
      const target = resolveInProject(ctx, img.src);
      if (target && !ctx.project.exists(target)) out.push({ messageKey: 'missing', params: { path: img.src }, line: img.line, column: img.column });
    }
    return out;
  },

  IMG004(ctx) {
    const out = [];
    for (const img of ctx.md.images) {
      const host = hostOf(img.src);
      if (host && PLACEHOLDER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
        out.push({ messageKey: 'found', params: { host }, line: img.line, column: img.column });
      }
    }
    return out;
  },

  IMG005(ctx) {
    if (ctx.md.images.some((img) => !isBadge(img.src))) return [];
    const demoSections = ctx.sections.filter((s) => s.level === 2 && s.block === 'demo');
    const { start, end } = introRange(ctx.md);
    const inDemo = (line) => (line > start && line < end) || demoSections.some((s) => line > s.line && line < s.endLine);
    const hasLiveLink = ctx.md.links.some((l) => /^https?:\/\//i.test(l.href) && inDemo(l.line) && !isBadge(l.href));
    if (hasLiveLink) return [];
    return [{ messageKey: 'missing', line: null, column: null }];
  },

  IMG007(ctx) {
    const byLine = new Map();
    for (const img of ctx.md.images) {
      const m = img.src.match(POPULARITY);
      if (!m) continue;
      if (!byLine.has(img.line)) byLine.set(img.line, { column: img.column, kinds: [] });
      const kind = m[1].replace(/-(raw|closed)$/, '');
      if (!byLine.get(img.line).kinds.includes(kind)) byLine.get(img.line).kinds.push(kind);
    }
    return [...byLine.entries()].map(([line, info]) => ({
      messageKey: 'found',
      params: { kinds: { 'zh-TW': info.kinds.join('、'), en: info.kinds.join(', ') } },
      line,
      column: info.column,
    }));
  },

  LNK001(ctx) {
    const out = [];
    for (const link of ctx.md.links) {
      const href = link.href.trim();
      if (!href || href.startsWith('#') || isExternal(href) || hasPlaceholder(href)) continue;
      const target = resolveInProject(ctx, href);
      if (target && !ctx.project.exists(target)) out.push({ messageKey: 'missing', params: { path: href }, line: link.line, column: link.column });
    }
    return out;
  },

  LNK004(ctx) {
    const out = [];
    for (const link of ctx.md.links) {
      const text = link.text.trim().replace(/[。.!！:：]+$/, '').toLowerCase();
      if (text && VAGUE_LINK_TEXT.has(text)) out.push({ messageKey: 'vague', params: { text: link.text.trim() }, line: link.line, column: link.column });
    }
    return out;
  },
};
