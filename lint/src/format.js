// 輸出：給人看的表格式文字，以及給 AI 讀的 JSON。
import { data } from './data.js';

const UI = {
  'zh-TW': {
    type: '專案類型',
    lang: 'README 語言',
    detected: '自動判斷',
    byOption: '由 --type 指定',
    langByOption: '由 --lang 指定輸出語言',
    noEvidence: '沒有找到其他類型的特徵，用預設值；可以用 --type 指定',
    evidenceJoin: '、',
    langName: { 'zh-TW': '繁體中文', en: '英文' },
    skipped: (n, ids) => `只找到 README，沒有其他專案檔案，跳過 ${n} 條要對照專案檔案的規則：${ids}`,
    ok: '✔ 沒有發現問題（0 個錯誤、0 個警告）',
    summary: (total, e, w) => `✖ ${total} 個問題（${e} 個錯誤、${w} 個警告）`,
    summaryWarn: (total, w) => `⚠ ${total} 個問題（0 個錯誤、${w} 個警告）`,
    wholeFile: '全文',
    outside: '八塊以外',
  },
  en: {
    type: 'Project type',
    lang: 'README language',
    detected: 'detected',
    byOption: 'set by --type',
    langByOption: 'output language set by --lang',
    noEvidence: 'no signs of another type, using the default; set it with --type',
    evidenceJoin: ', ',
    langName: { 'zh-TW': 'Traditional Chinese', en: 'English' },
    skipped: (n, ids) => `Only a README was found, no other project files, so ${n} rules that compare against project files were skipped: ${ids}`,
    ok: '✔ No problems found (0 errors, 0 warnings)',
    summary: (total, e, w) => `✖ ${total} ${total === 1 ? 'problem' : 'problems'} (${e} ${e === 1 ? 'error' : 'errors'}, ${w} ${w === 1 ? 'warning' : 'warnings'})`,
    summaryWarn: (total, w) => `⚠ ${total} ${total === 1 ? 'problem' : 'problems'} (0 errors, ${w} ${w === 1 ? 'warning' : 'warnings'})`,
    wholeFile: 'whole file',
    outside: 'outside the eight blocks',
  },
};

/** 終端機裡的顯示寬度：中日韓文字與全形符號算兩格 */
export function displayWidth(text) {
  let width = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    const wide =
      (code >= 0x1100 && code <= 0x115f) ||
      (code >= 0x2e80 && code <= 0xa4cf) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe30 && code <= 0xfe4f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1f300 && code <= 0x1faff);
    width += wide ? 2 : 1;
  }
  return width;
}

function pad(text, width) {
  return text + ' '.repeat(Math.max(0, width - displayWidth(text)));
}

function colors(enabled) {
  const wrap = (code) => (s) => (enabled ? `\u001b[${code}m${s}\u001b[0m` : s);
  return { red: wrap('31'), yellow: wrap('33'), dim: wrap('2'), bold: wrap('1'), underline: wrap('4'), green: wrap('32') };
}

/**
 * 給人看的輸出。
 * @param {string} file 顯示用的檔名
 * @param {ReturnType<import('./lint.js').lintReadme>} result
 * @param {{color?: boolean}} [options]
 */
export function formatHuman(file, result, { color = false } = {}) {
  const lang = result.language.output;
  const t = UI[lang];
  const c = colors(color);
  const out = [];
  out.push(c.bold(c.underline(file)));

  const labelLine = (label, value, note) => (lang === 'en' ? `${label}: ${value} (${note})` : `${label}：${value}（${note}）`);
  const sep = lang === 'en' ? ': ' : '：';
  let typeNote;
  if (result.type.source === 'option') typeNote = t.byOption;
  else if (result.type.evidence.length) typeNote = `${t.detected}${sep}${result.type.evidence.map((e) => e[lang]).join(t.evidenceJoin)}`;
  else typeNote = `${t.detected}${sep}${t.noEvidence}`;
  out.push(c.dim(labelLine(t.type, result.type.name[lang], typeNote)));
  const langNote = result.language.source === 'option' ? t.langByOption : t.detected;
  out.push(c.dim(labelLine(t.lang, t.langName[result.language.readme], langNote)));
  if (result.skippedRules.length) out.push(c.dim(t.skipped(result.skippedRules.length, result.skippedRules.join(lang === 'en' ? ', ' : '、'))));
  out.push('');

  if (!result.problems.length) {
    out.push(c.green(t.ok));
    return out.join('\n');
  }

  const rows = result.problems.map((p) => ({
    pos: p.line ? `${p.line}:${p.column ?? 1}` : '—',
    level: data.rules.severities[p.severity][lang],
    severity: p.severity,
    message: p.message,
    block: p.block ? `${p.block.number} ${p.block.name}` : `—  ${p.line ? t.outside : t.wholeFile}`,
    number: p.block?.number ?? '—',
    blockName: p.block ? p.block.name : p.line ? t.outside : t.wholeFile,
    rule: p.ruleId,
  }));
  const posWidth = Math.max(...rows.map((r) => displayWidth(r.pos)));
  const levelWidth = Math.max(...rows.map((r) => displayWidth(r.level)));
  const messageWidth = Math.min(64, Math.max(...rows.map((r) => displayWidth(r.message))));
  const blockWidth = Math.max(...rows.map((r) => displayWidth(r.block)));
  for (const r of rows) {
    const level = pad(r.level, levelWidth);
    const blockText = `${r.number} ${c.dim(pad(r.blockName, blockWidth - displayWidth(r.number) - 1))}`;
    out.push(
      [
        `  ${c.dim(pad(r.pos, posWidth))}`,
        r.severity === 'error' ? c.red(level) : c.yellow(level),
        pad(r.message, messageWidth),
        r.number === '—' ? c.dim(pad(r.block, blockWidth)) : blockText,
        c.dim(r.rule),
      ].join('  '),
    );
  }
  out.push('');
  const total = result.problems.length;
  const { errors, warnings } = result.summary;
  out.push(errors ? c.red(c.bold(t.summary(total, errors, warnings))) : c.yellow(c.bold(t.summaryWarn(total, warnings))));
  return out.join('\n');
}

/**
 * 給 AI 讀的 JSON 輸出。
 * @param {string} file
 * @param {string} projectDir
 * @param {ReturnType<import('./lint.js').lintReadme>} result
 */
export function formatJson(file, projectDir, result) {
  const lang = result.language.output;
  return JSON.stringify(
    {
      file,
      projectDir,
      type: { id: result.type.id, name: result.type.name[lang], source: result.type.source, evidence: result.type.evidence.map((e) => e[lang]) },
      language: result.language,
      projectFilesFound: result.projectFilesFound,
      skippedRules: result.skippedRules,
      summary: result.summary,
      problems: result.problems,
    },
    null,
    2,
  );
}
