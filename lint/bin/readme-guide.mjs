#!/usr/bin/env node
// readme-guide 指令列：照 README Guide 的規則檢查一份 README。
// 用法：node lint/bin/readme-guide.mjs check [README 路徑] [--type 類型] [--lang zh-TW|en] [--json] [--project 資料夾]
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { lintReadme } from '../src/lint.js';
import { fsProject } from '../src/project.js';
import { formatHuman, formatJson } from '../src/format.js';
import { TYPE_IDS, LANGS } from '../src/data.js';

const HELP = {
  'zh-TW': `用法：readme-guide check [README 路徑] [選項]

照 README Guide 的八塊結構與規則檢查 README。README 路徑沒給時，用目前資料夾的 README.md。

選項：
  --type <類型>       專案類型：${TYPE_IDS.join('、')}（沒給就自動判斷）
  --lang <語言>       輸出語言：zh-TW 或 en（沒給就跟 README 的語言一樣）
  --project <資料夾>  專案資料夾，用來對照 package.json、.env.example 等檔案（預設是 README 所在的資料夾）
  --json              輸出給 AI 讀的 JSON
  -h, --help          顯示這段說明

結束代碼：有錯誤是 1；只有警告或沒有問題是 0；參數或檔案有問題是 2。`,
  en: `Usage: readme-guide check [README path] [options]

Checks a README against the README Guide's eight blocks and rules. Without a path it checks README.md in the current folder.

Options:
  --type <type>       Project type: ${TYPE_IDS.join(', ')} (detected when omitted)
  --lang <lang>       Output language: zh-TW or en (same as the README when omitted)
  --project <folder>  Project folder, used to compare against package.json, .env.example and so on (defaults to the README's folder)
  --json              Print JSON for AI to read
  -h, --help          Show this help

Exit code: 1 when there are errors; 0 with only warnings or no problems; 2 for bad options or a missing file.`,
};

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

function guessLang(argv) {
  const index = argv.indexOf('--lang');
  const value = index !== -1 ? argv[index + 1] : argv.find((a) => a.startsWith('--lang='))?.split('=')[1];
  if (LANGS.includes(value)) return value;
  return /^zh/i.test(process.env.LANG ?? '') ? 'zh-TW' : 'en';
}

const argv = process.argv.slice(2);
const uiLang = guessLang(argv);
let parsed;
try {
  parsed = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      type: { type: 'string' },
      lang: { type: 'string' },
      json: { type: 'boolean', default: false },
      project: { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
} catch (error) {
  fail(`${error.message}\n\n${HELP[uiLang]}`);
}

const { values, positionals } = parsed;
if (values.help || positionals.length === 0) {
  process.stdout.write(`${HELP[uiLang]}\n`);
  process.exit(values.help ? 0 : 2);
}
const [command, target = 'README.md', ...extra] = positionals;
if (command !== 'check' || extra.length) fail(uiLang === 'en' ? `Unknown command: ${positionals.join(' ')}\n\n${HELP.en}` : `看不懂的指令：${positionals.join(' ')}\n\n${HELP['zh-TW']}`);
if (values.type && !TYPE_IDS.includes(values.type)) fail(uiLang === 'en' ? `--type must be one of: ${TYPE_IDS.join(', ')}` : `--type 只能是：${TYPE_IDS.join('、')}`);
if (values.lang && !LANGS.includes(values.lang)) fail(uiLang === 'en' ? '--lang must be zh-TW or en' : '--lang 只能是 zh-TW 或 en');

const readmeAbs = path.resolve(target);
if (!existsSync(readmeAbs) || !statSync(readmeAbs).isFile()) fail(uiLang === 'en' ? `File not found: ${target}` : `找不到檔案：${target}`);
const projectDir = path.resolve(values.project ?? path.dirname(readmeAbs));
if (!existsSync(projectDir) || !statSync(projectDir).isDirectory()) fail(uiLang === 'en' ? `Project folder not found: ${values.project}` : `找不到專案資料夾：${values.project}`);

const result = lintReadme({
  text: readFileSync(readmeAbs, 'utf8'),
  project: fsProject(projectDir),
  readmePath: path.relative(projectDir, readmeAbs).split(path.sep).join('/'),
  type: values.type,
  lang: values.lang,
});

if (values.json) {
  process.stdout.write(`${formatJson(target, projectDir, result)}\n`);
} else {
  const color = process.stdout.isTTY && !process.env.NO_COLOR;
  process.stdout.write(`${formatHuman(target, result, { color })}\n`);
}
process.exit(result.summary.errors > 0 ? 1 : 0);
