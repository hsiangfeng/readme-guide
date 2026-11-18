// 環境變數與安全類規則。
import { stripPlaceholders } from '../data.js';
import { findSection, sectionText } from '../sections.js';
import { escapeRegExp } from './util.js';

const ENV_EXAMPLE_FILES = ['.env.example', '.env.sample', '.env.template', '.env.dist', '.env.local.example'];

/** 專案裡的環境變數範例檔 */
export function envExampleFile(project) {
  return ENV_EXAMPLE_FILES.find((f) => project.exists(f)) ?? null;
}

/** 解析範例檔裡的變數名稱 */
export function parseEnvKeys(text) {
  const keys = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.]*)\s*=/);
    if (m && !keys.includes(m[1])) keys.push(m[1]);
  }
  return keys;
}

// 常見服務的金鑰開頭（只列格式，不列服務名稱）
const KEY_PREFIXES = [
  /\b(?:sk|rk)_live_[0-9A-Za-z]{16,}/,
  /\bsk-[A-Za-z0-9_-]{32,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}/,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/,
  /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
];
const SECRET_WORD = /secret|token|passw(?:or)?d|pwd|api[_-]?key|private[_-]?key|access[_-]?key|client[_-]?key|金鑰|密鑰|密碼|權杖/i;
const FAKE_HINT = /your|example|sample|dummy|fake|placeholder|changeme|change_me|xxx|test|demo|redacted|\*{3}|\.{3}|<|>|請填|範例|自己的/i;

/** 字串的混亂程度（越高越像亂數產生的金鑰） */
function entropy(text) {
  const counts = new Map();
  for (const c of text) counts.set(c, (counts.get(c) ?? 0) + 1);
  let result = 0;
  for (const n of counts.values()) {
    const p = n / text.length;
    result -= p * Math.log2(p);
  }
  return result;
}

/** 像不像真的金鑰值 */
function looksLikeSecretValue(value) {
  if (value.length < 16 || FAKE_HINT.test(value)) return false;
  // 網址、檔案路徑、檔名不算
  if (/^https?:|:\/\/|^\.{0,2}\//.test(value) || /\.[A-Za-z]{1,5}$/.test(value) || value.split('/').length > 2) return false;
  if (/^[A-Z][A-Z0-9_]*$/.test(value)) return false; // 變數名稱本身
  // 亂數產生的金鑰幾乎都同時有英文字母和數字；只有字母的多半是程式裡的名稱
  if ((value.match(/\d/g) ?? []).length < 2 || (value.match(/[A-Za-z]/g) ?? []).length < 2) return false;
  return entropy(value) >= 3.5;
}

export const checks = {
  ENV001(ctx) {
    const file = envExampleFile(ctx.project);
    if (!file || findSection(ctx.sections, 'env') || ctx.typeDef.required.includes('env')) return [];
    return [{ messageKey: 'missing', params: { file }, line: null, column: null }];
  },

  ENV002(ctx) {
    const file = envExampleFile(ctx.project);
    const section = findSection(ctx.sections, 'env');
    if (!file || !section) return [];
    const keys = parseEnvKeys(ctx.project.readText(file) ?? '');
    const text = sectionText(ctx.md, section);
    const missing = keys.filter((k) => !new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(k)}([^A-Za-z0-9_]|$)`).test(text));
    if (!missing.length) return [];
    return [{ messageKey: 'missing', params: { file, names: { 'zh-TW': missing.join('、'), en: missing.join(', ') } }, line: section.line, column: 1 }];
  },

  ENV008(ctx) {
    const file = envExampleFile(ctx.project);
    const section = findSection(ctx.sections, 'getting-started');
    if (!file || !section) return [];
    if (/\.env\b/.test(sectionText(ctx.md, section))) return [];
    return [{ messageKey: 'missing', params: { file }, line: section.line, column: 1 }];
  },

  ENV004(ctx) {
    const out = [];
    for (const line of ctx.md.lines) {
      if (line.kind === 'blank' || line.kind === 'fence') continue;
      const text = stripPlaceholders(line.raw);
      let found = null;
      for (const pattern of KEY_PREFIXES) {
        const m = text.match(pattern);
        if (m && !/x{4,}|\*{4,}|\.{3}/i.test(m[0]) && !FAKE_HINT.test(m[0])) {
          found = m;
          break;
        }
      }
      if (!found && SECRET_WORD.test(text)) {
        for (const m of text.matchAll(/[A-Za-z0-9+/=_\-.]{16,}/g)) {
          if (looksLikeSecretValue(m[0])) {
            found = m;
            break;
          }
        }
      }
      if (found) out.push({ messageKey: 'found', line: line.line, column: found.index + 1 });
    }
    return out;
  },
};
