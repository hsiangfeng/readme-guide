// explain 子指令：查一條規則的完整說明，不用把整份 rules.json 讀進來。
import { data, projectType } from './data.js';
import { blockInfo } from './sections.js';

const TEXT = {
  'zh-TW': {
    block: '塊',
    anywhere: '依問題出現的位置',
    related: '最相關',
    severity: '嚴重度',
    error: '錯誤',
    warning: '警告',
    status: '狀態',
    implemented: '已實作',
    planned: '規劃中（檢查工具還不會檢查）',
    needsProject: '要對照專案檔案',
    readmeOnly: '只看 README',
    types: '適用類型',
    description: '說明',
    fix: '怎麼修',
    example: '例子',
    before: '改之前',
    after: '改成',
    missingBefore: '（原本缺了這一段）',
    unknown: (id) => `找不到規則「${id}」。`,
    similar: (ids) => `相近的規則：${ids.join('、')}`,
    list: '用 readme-guide explain <規則代號> 查詢，規則代號例如 CMD004。',
  },
  en: {
    block: 'Block',
    anywhere: 'wherever the problem appears',
    related: 'most related',
    severity: 'Severity',
    error: 'Error',
    warning: 'Warning',
    status: 'Status',
    implemented: 'implemented',
    planned: 'planned (not checked yet)',
    needsProject: 'compares against project files',
    readmeOnly: 'README only',
    types: 'Project types',
    description: 'Description',
    fix: 'How to fix',
    example: 'Example',
    before: 'Before',
    after: 'After',
    missingBefore: '(this part was missing)',
    unknown: (id) => `No rule called "${id}".`,
    similar: (ids) => `Similar rules: ${ids.join(', ')}`,
    list: 'Run readme-guide explain <RULE_ID>, for example CMD004.',
  },
};

const normalize = (id) => String(id).toUpperCase().replace(/[^A-Z0-9]/g, '');

/** 兩個字串的編輯距離 */
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** 依代號找規則（不分大小寫，可以省略連字號，例如 type-api001、typeapi001） */
export function findRule(id) {
  const key = normalize(id);
  return data.rules.rules.find((r) => normalize(r.id) === key) ?? null;
}

/** 找不到時列出相近的代號：編輯距離 2 以內，或同一個字首加上相同數字 */
export function similarRules(id, limit = 5) {
  const key = normalize(id);
  const digits = key.replace(/\D/g, '');
  return data.rules.rules
    .map((r) => ({ id: r.id, score: distance(key, normalize(r.id)) }))
    .filter(({ id: other, score }) => score <= 2 || (digits && normalize(other).endsWith(digits) && normalize(other)[0] === key[0]))
    .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((x) => x.id);
}

/** 規則換成指定語言的物件（給 --json 用） */
export function describeRule(rule, lang) {
  const block = rule.block ? blockInfo(rule.block) : null;
  const blockOut = (b) => ({ slug: b.slug, number: b.number, name: b.name[lang] ?? b.name });
  return {
    id: rule.id,
    block: block ? blockOut(block) : null,
    relatedBlocks: (rule.relatedBlocks ?? []).map((slug) => blockOut(blockInfo(slug))),
    category: rule.category,
    severity: rule.severity,
    status: rule.status,
    needsProject: rule.needsProject,
    types: rule.types,
    title: rule.title[lang],
    description: rule.description[lang],
    fix: rule.fix[lang],
    example: rule.example ? rule.example[lang] : null,
  };
}

const indent = (text, spaces = 2) => text.split('\n').map((line) => (line ? `${' '.repeat(spaces)}${line}` : line)).join('\n');

/** 給人看的說明 */
export function formatRule(rule, lang) {
  const t = TEXT[lang];
  const en = lang === 'en';
  const colon = en ? ': ' : '：';
  const list = (items) => items.join(en ? ', ' : '、');
  const paren = (text) => (en ? ` (${text})` : `（${text}）`);
  const d = describeRule(rule, lang);
  const typeNames = list(d.types.map((id) => projectType(id).name[lang]));
  const blockLine = d.block
    ? `${d.block.number} ${d.block.name}`
    : `${t.anywhere}${d.relatedBlocks.length ? paren(`${t.related}${colon}${list(d.relatedBlocks.map((b) => `${b.number} ${b.name}`))}`) : ''}`;
  const lines = [
    `${d.id}  ${d.title}`,
    '',
    `${t.block}${colon}${blockLine}`,
    `${t.severity}${colon}${t[d.severity]}`,
    `${t.status}${colon}${t[d.status]}${en ? ' | ' : '｜'}${d.needsProject ? t.needsProject : t.readmeOnly}`,
    `${t.types}${colon}${typeNames}`,
    '',
    `${t.description}${colon.trim()}`,
    indent(d.description),
    '',
    `${t.fix}${colon.trim()}`,
    indent(d.fix),
  ];
  if (d.example) {
    lines.push('', `${t.example}${colon.trim()}`, `  ${t.before}${colon.trim()}`);
    lines.push(d.example.before.length ? indent(d.example.before.join('\n'), 4) : `    ${t.missingBefore}`);
    lines.push(`  ${t.after}${colon.trim()}`, indent(d.example.after.join('\n'), 4));
  }
  return lines.join('\n');
}

/** 找不到規則時的訊息 */
export function unknownRuleMessage(id, lang) {
  const t = TEXT[lang];
  const similar = similarRules(id);
  return [t.unknown(id), similar.length ? t.similar(similar) : t.list].join('\n');
}
