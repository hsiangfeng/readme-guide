// 版本類規則：README 寫的 Node.js 版本跟專案設定比對、模糊的版本說法。
import { parseRange, parseVersion } from '../semver.js';
import { findSection } from '../sections.js';
import { proseLines, readableText } from './util.js';

/**
 * 專案設定裡的 Node.js 版本。
 * @returns {Array<{source:string, value:string, kind:'exact'|'range', test:(v)=>boolean}>}
 */
export function projectNodeSources(project, pkg) {
  const sources = [];
  for (const file of ['.nvmrc', '.node-version']) {
    const text = project.readText(file);
    if (text === null) continue;
    const value = text.trim().split(/\s+/)[0] ?? '';
    const v = parseVersion(value);
    if (v) sources.push({ source: file, value, kind: 'exact', version: v });
  }
  const tool = project.readText('.tool-versions')?.match(/^nodejs\s+(\S+)/m)?.[1];
  if (tool && parseVersion(tool)) sources.push({ source: '.tool-versions', value: tool, kind: 'exact', version: parseVersion(tool) });
  if (typeof pkg?.volta?.node === 'string' && parseVersion(pkg.volta.node)) {
    sources.push({ source: 'package.json volta', value: pkg.volta.node, kind: 'exact', version: parseVersion(pkg.volta.node) });
  }
  if (typeof pkg?.engines?.node === 'string') {
    const test = parseRange(pkg.engines.node);
    if (test) sources.push({ source: 'package.json engines', value: pkg.engines.node, kind: 'range', test });
  }
  return sources;
}

const NODE_CLAIM =
  /\bnode(?:\.?js)?\b(?![-_/.]\w)([^\n\d。；;!?！？]{0,20}?)(>=|≥|>|\^|~|=)?\s*v?(\d{1,2}(?:\.(?:\d+|x))?(?:\.(?:\d+|x))?)(\+)?(\s*(?:以上|及以上|或以上|或更新|or (?:later|higher|newer|above)|and (?:later|above)))?/gi;

/**
 * README 裡提到的 Node.js 版本（程式碼區塊以外）。
 * @returns {Array<{line:number, column:number, text:string, kind:'min'|'exact'|'major', version}>}
 */
export function readmeNodeClaims(md) {
  const claims = [];
  for (const line of proseLines(md)) {
    const text = readableText(line).replace(/\]\([^)]*\)/g, ']    ').replace(/https?:\/\/\S+/g, (m) => ' '.repeat(m.length));
    for (const m of text.matchAll(NODE_CLAIM)) {
      const version = parseVersion(m[3]);
      if (!version) continue;
      const min = m[2] && m[2] !== '=' ? true : Boolean(m[4] || m[5]);
      const kind = min ? 'min' : version.minor === null || version.patch === null ? 'major' : 'exact';
      const shown = `${m[2] ?? ''}${m[3]}${m[4] ?? ''}${m[5] ? ` ${m[5].trim()}` : ''}`.trim();
      claims.push({ line: line.line, column: m.index + 1, text: shown, kind, version });
    }
  }
  return claims;
}

function consistent(claim, source) {
  const v = claim.version;
  const lower = { major: v.major, minor: v.minor ?? 0, patch: v.patch ?? 0 };
  if (source.kind === 'exact') {
    const s = source.version;
    if (claim.kind === 'min') return s.major > lower.major || (s.major === lower.major && (s.minor === null || s.minor >= lower.minor));
    return s.major === v.major;
  }
  if (claim.kind === 'major') {
    return source.test(lower) || source.test({ major: v.major, minor: v.minor ?? 999, patch: 999 });
  }
  return source.test(lower);
}

export const checks = {
  VER002(ctx) {
    const sources = projectNodeSources(ctx.project, ctx.pkg);
    if (!sources.length) return [];
    const out = [];
    const seen = new Set();
    for (const claim of readmeNodeClaims(ctx.md)) {
      if (seen.has(claim.text)) continue;
      seen.add(claim.text);
      const conflict = sources.find((s) => !consistent(claim, s));
      if (conflict) {
        out.push({ messageKey: 'mismatch', params: { readme: claim.text, source: conflict.source, project: conflict.value }, line: claim.line, column: claim.column });
      }
    }
    return out;
  },

  VER007(ctx) {
    if (!ctx.pkg) return [];
    const sources = projectNodeSources(ctx.project, ctx.pkg);
    if (!sources.length || readmeNodeClaims(ctx.md).length) return [];
    const anchor = findSection(ctx.sections, 'requirements') ?? findSection(ctx.sections, 'getting-started');
    return [{ messageKey: 'missing', params: { project: sources[0].value, source: sources[0].source }, line: anchor?.line ?? null, column: anchor ? 1 : null }];
  },

  VER005(ctx) {
    const ranges = ['getting-started', 'requirements']
      .map((id) => findSection(ctx.sections, id))
      .filter(Boolean);
    if (!ranges.length) return [];
    const inRange = (n) => ranges.some((s) => n > s.line && n < s.endLine);
    const VAGUE = /最新版本?|最新的版本|較新的?版本|新一點的版本|(?:latest|newest|newer|a recent) version|以上\s*(?:\.{2,}|…+)|or (?:later|above)\s*(?:\.{2,}|…+)/gi;
    const out = [];
    for (const line of proseLines(ctx.md)) {
      if (!inRange(line.line)) continue;
      for (const m of readableText(line).matchAll(VAGUE)) {
        out.push({ messageKey: 'vague', params: { text: m[0].trim() }, line: line.line, column: m.index + 1 });
      }
    }
    return out;
  },
};
