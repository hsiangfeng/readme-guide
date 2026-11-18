// 自動判斷 README 的語言與專案類型。
import { data } from './data.js';
import { readPackageJson } from './project.js';

const HAN = /\p{Script=Han}/gu;
const LATIN_WORD = /[A-Za-z]+(?:'[A-Za-z]+)?/g;

/**
 * 判斷 README 的語言：程式碼以外的文字，漢字數不少於英文單字數就算繁體中文。
 * @param {ReturnType<import('./markdown.js').parseMarkdown>} md
 * @returns {'zh-TW'|'en'}
 */
export function detectLanguage(md) {
  let han = 0;
  let words = 0;
  for (const line of md.lines) {
    if (line.kind !== 'text') continue;
    const prose = line.prose.replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, '');
    han += (prose.match(HAN) ?? []).length;
    words += (prose.match(LATIN_WORD) ?? []).length;
  }
  return han > 0 && han >= words ? 'zh-TW' : 'en';
}

const BACKEND_DEPS = ['express', 'fastify', 'koa', '@nestjs/core', 'hono', '@hapi/hapi', 'restify', '@adonisjs/core'];
const FRONTEND_DEPS = ['vue', 'react', 'react-dom', 'svelte', 'next', 'nuxt', '@angular/core', 'solid-js', 'astro', 'preact', '@sveltejs/kit'];

/**
 * 依 README 的章節與專案檔案猜專案類型。
 * @param {object} ctx
 * @param {ReturnType<import('./sections.js').buildSections>} ctx.sections
 * @param {string} ctx.prose 程式碼以外的文字
 * @param {string} ctx.code 程式碼區塊的文字
 * @param {object|null} ctx.project 專案（只有 README 時為 null）
 * @returns {{id:string, evidence: Array<{'zh-TW':string,en:string}>}}
 */
export function detectType({ sections, prose, code, project }) {
  const has = (id) => sections.some((s) => s.ids.includes(id));
  const scores = { 'course-example': 0, portfolio: 0, 'backend-api': 0 };
  const evidence = { 'course-example': [], portfolio: [], 'backend-api': [] };
  // 有沒有「確定」的訊號：章節標題或專案檔案。只有內文提到（「提到作品集」「提到課程」「有 curl」）不能決定類型，
  // 因為介紹文字很容易順便提到其他類型（例如「提供網頁專案、作品集等四種範本」）。
  const strong = { 'course-example': false, portfolio: false, 'backend-api': false };
  const note = (type, points, zh, en, isStrong = false) => {
    scores[type] += points;
    if (isStrong) strong[type] = true;
    evidence[type].push({ 'zh-TW': zh, en });
  };
  const title = (id) => data.headings.sections.find((s) => s.id === id).title;

  for (const id of ['learning-objectives', 'course-unit', 'start-finish']) {
    if (has(id)) note('course-example', 3, `有「${title(id)['zh-TW']}」章節`, `has a "${title(id).en}" section`, true);
  }
  if (/課程|課堂|作業|第\s*[0-9一二三四五六七八九十]+\s*(?:週|堂|單元)|\bLesson\s*\d+|\bWeek\s*\d+|\bcourse\b/i.test(prose)) {
    note('course-example', 1, '提到課程或單元', 'mentions a course or lesson');
  }
  for (const id of ['my-role', 'design-decisions']) {
    if (has(id)) note('portfolio', 3, `有「${title(id)['zh-TW']}」章節`, `has a "${title(id).en}" section`, true);
  }
  if (/作品集|\bportfolio\b/i.test(prose)) note('portfolio', 2, '提到作品集', 'mentions a portfolio');
  for (const id of ['api-docs', 'database']) {
    if (has(id)) note('backend-api', 3, `有「${title(id)['zh-TW']}」章節`, `has a "${title(id).en}" section`, true);
  }
  if (/\bcurl\b/.test(code)) note('backend-api', 1, '有 curl 請求範例', 'has a curl example');

  if (project) {
    const pkg = readPackageJson(project);
    const deps = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};
    const backend = BACKEND_DEPS.filter((d) => d in deps);
    const frontend = FRONTEND_DEPS.filter((d) => d in deps);
    if (backend.length && !frontend.length) {
      note('backend-api', 2, `package.json 用了 ${backend.join('、')}，沒有前端框架`, `package.json uses ${backend.join(', ')} and no front-end framework`, true);
    }
    if (project.isDir('prisma') || project.isDir('migrations')) note('backend-api', 1, '有資料庫設定資料夾', 'has a database setup folder', true);
  }

  let best = null;
  for (const [type, score] of Object.entries(scores)) {
    if (strong[type] && score >= 2 && (!best || score > scores[best])) best = type;
  }
  if (!best) return { id: data.projectTypes.default, evidence: [] };
  return { id: best, evidence: evidence[best] };
}
