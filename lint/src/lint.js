// 檢查流程：解析 README → 判斷類型與語言 → 依 rules/rules.json 逐條執行已實作的規則。
import path from 'node:path';
import { data, projectType, ruleById, TYPE_IDS } from './data.js';
import { parseMarkdown } from './markdown.js';
import { blockInfo, blockOfLine, buildSections } from './sections.js';
import { detectLanguage, detectType } from './detect.js';
import { hasProjectFiles, readPackageJson } from './project.js';
import { checks as structure } from './checks/structure.js';
import { checks as commands } from './checks/commands.js';
import { checks as versions } from './checks/versions.js';
import { checks as env } from './checks/env.js';
import { checks as media } from './checks/media.js';
import { checks as license } from './checks/license.js';
import { checks as ai } from './checks/ai.js';
import { checks as types } from './checks/types.js';
import { checks as folders } from './checks/folders.js';

/** 規則代號對到實作 */
export const implementations = { ...structure, ...commands, ...versions, ...env, ...media, ...license, ...ai, ...types, ...folders };

/**
 * 檢查一份 README。
 * @param {object} options
 * @param {string} options.text README 內容
 * @param {object|null} [options.project] 專案（fsProject 或 memoryProject）；null 表示只有 README
 * @param {string} [options.readmePath] README 相對於專案根目錄的路徑
 * @param {string} [options.type] 指定專案類型；不給就自動判斷
 * @param {'zh-TW'|'en'} [options.lang] 輸出語言；不給就跟 README 一樣
 */
export function lintReadme({ text, project = null, readmePath = 'README.md', type, lang }) {
  if (type && !TYPE_IDS.includes(type)) throw new Error(`unknown type: ${type}`);
  const md = parseMarkdown(text);
  const sections = buildSections(md);
  const docLang = detectLanguage(md);
  const outputLang = lang ?? docLang;
  const projectMode = Boolean(project) && hasProjectFiles(project);
  const activeProject = projectMode ? project : null;

  const prose = md.lines.filter((l) => l.kind === 'text').map((l) => l.prose).join('\n');
  const code = md.codeBlocks.flatMap((b) => b.lines.map((l) => l.text)).join('\n');
  const detected = type ? null : detectType({ sections, prose, code, project: activeProject });
  const typeId = type ?? detected.id;
  const typeDef = projectType(typeId);

  const ctx = {
    md,
    sections,
    docLang,
    type: typeId,
    typeDef,
    project: activeProject,
    pkg: activeProject ? readPackageJson(activeProject) : null,
    readmeDir: readmeDirOf(readmePath),
  };

  const problems = [];
  const skipped = [];
  for (const rule of data.rules.rules) {
    if (rule.status !== 'implemented' || !rule.types.includes(typeId)) continue;
    if (rule.needsProject && !projectMode) {
      skipped.push(rule.id);
      continue;
    }
    const impl = implementations[rule.id];
    if (!impl) throw new Error(`rule ${rule.id} is marked implemented but has no implementation`);
    for (const found of impl(ctx)) problems.push(toProblem(rule, found, sections, outputLang));
  }

  // 照行號排；沒有行號的（例如缺少的章節）放在那一塊應該出現的位置
  const sortLine = (p) => p.line ?? anchorLine(sections, p.block?.slug);
  problems.sort((a, b) => sortLine(a) - sortLine(b) || (a.line === null) - (b.line === null) || (a.column ?? 0) - (b.column ?? 0));

  return {
    type: {
      id: typeId,
      name: typeDef.name,
      source: type ? 'option' : 'detected',
      evidence: detected?.evidence ?? [],
    },
    language: { output: outputLang, readme: docLang, source: lang ? 'option' : 'detected' },
    projectFilesFound: projectMode,
    skippedRules: skipped,
    summary: {
      errors: problems.filter((p) => p.severity === 'error').length,
      warnings: problems.filter((p) => p.severity === 'warning').length,
    },
    problems,
  };
}

/**
 * README 所在的資料夾（相對於專案根目錄），README 裡的相對路徑從這裡算。
 * README 不在專案資料夾裡（例如用 --project 指到別的地方）時，從專案根目錄算。
 */
export function readmeDirOf(readmePath) {
  const normalized = path.posix.normalize(String(readmePath).replace(/\\/g, '/'));
  if (normalized.startsWith('../') || normalized === '..' || path.posix.isAbsolute(normalized) || /^[A-Za-z]:\//.test(normalized)) return '.';
  return path.posix.dirname(normalized);
}

/** 某一塊在文件裡的位置：那一塊第一個二級標題；還沒有的話，用它後面那一塊的位置 */
function anchorLine(sections, slug) {
  if (!slug) return Infinity;
  const index = blockInfo(slug).index;
  const h2 = sections.filter((s) => s.level === 2 && s.block);
  const own = h2.find((s) => s.block === slug);
  if (own) return own.line;
  const later = h2.find((s) => blockInfo(s.block).index > index);
  return later ? later.line - 0.5 : Infinity;
}

/** 把參數換成輸出語言的文字 */
function localize(value, lang) {
  if (value && typeof value === 'object') return value[lang] ?? value.en ?? '';
  return String(value);
}

function format(template, params, lang) {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in params ? localize(params[key], lang) : m));
}

function toProblem(rule, found, sections, lang) {
  // 有行號的問題依所在位置標塊；沒有行號（例如缺少的章節）才用規則本身所屬的塊
  const blockSlug = found.block ?? (found.line ? blockOfLine(sections, found.line) ?? rule.block : rule.block);
  const block = blockSlug ? blockInfo(blockSlug) : null;
  const template = rule.messages[found.messageKey];
  if (!template) throw new Error(`rule ${rule.id} has no message "${found.messageKey}"`);
  const params = found.params ?? {};
  return {
    ruleId: rule.id,
    severity: rule.severity,
    line: found.line ?? null,
    column: found.column ?? null,
    block: block ? { slug: block.slug, number: block.number, name: localize(block.name, lang) } : null,
    message: format(localize(template, lang), params, lang),
    title: localize(rule.title, lang),
    fix: localize(rule.fix, lang),
    needsProject: rule.needsProject,
  };
}

export { ruleById };
