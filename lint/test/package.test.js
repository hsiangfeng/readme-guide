// npm 套件：實際打包、解到 repo 外面，用解出來的那份跑檢查；以及規則資料的來源不會被殘留的複本蓋過。
// 這個測試不連 registry：只用 npm pack（打包在本機完成）與 tar 解壓縮。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { data, rulesSource } from '../src/data.js';

const lintDir = fileURLToPath(new URL('..', import.meta.url));
const repoDir = path.dirname(path.resolve(lintDir));
const rootRules = path.join(repoDir, 'rules');
const RULE_FILES = ['blocks.json', 'headings.json', 'project-types.json', 'rules.json', 'conventions.json'];

test('在 repo 裡一律讀根目錄的 rules/，不讀 lint/rules/ 的複本', () => {
  assert.equal(rulesSource.from, 'repository');
  assert.equal(path.resolve(rulesSource.dir), path.resolve(rootRules));
  const keys = { 'blocks.json': 'blocks', 'headings.json': 'headings', 'project-types.json': 'projectTypes', 'rules.json': 'rules', 'conventions.json': 'conventions' };
  for (const name of RULE_FILES) {
    assert.deepEqual(data[keys[name]], JSON.parse(readFileSync(path.join(rootRules, name), 'utf8')), name);
  }
});

test('打包成 npm 套件，在 repo 外面也能跑，而且不夾帶測試與範例專案', () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), 'readme-guide-pack-'));
  try {
    // 1. 打包到暫存資料夾（.tgz 不留在工作目錄）
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const pack = spawnSync(npm, ['pack', '--json', '--pack-destination', temp], {
      cwd: lintDir,
      encoding: 'utf8',
      shell: process.platform === 'win32',
      env: { ...process.env, npm_config_offline: 'true', npm_config_audit: 'false', npm_config_fund: 'false', npm_config_update_notifier: 'false' },
    });
    assert.equal(pack.status, 0, `npm pack 失敗：${pack.stderr}`);
    const [info] = JSON.parse(pack.stdout.slice(pack.stdout.indexOf('[')));
    const files = info.files.map((f) => f.path).sort();

    // 2. 套件內容：要有的都有，測試、範例專案、打包腳本都沒混進去
    for (const required of ['package.json', 'README.md', 'LICENSE', 'bin/readme-guide.mjs', 'src/data.js', 'src/explain.js', ...RULE_FILES.map((f) => `rules/${f}`)]) {
      assert.ok(files.includes(required), `套件裡缺少 ${required}`);
    }
    for (const file of files) {
      assert.doesNotMatch(file, /^(test|fixtures|scripts)\//, `套件裡不該有 ${file}`);
    }

    // 3. 打包後 lint/ 裡的暫時複本已清掉，也沒有留下 .tgz
    assert.equal(existsSync(path.join(lintDir, 'rules')), false, 'postpack 沒有清掉 lint/rules/');
    assert.equal(existsSync(path.join(lintDir, 'LICENSE')), false, 'postpack 沒有清掉 lint/LICENSE');
    assert.deepEqual(readdirSync(lintDir).filter((n) => n.endsWith('.tgz')), []);

    // 4. 解到 node_modules/readme-guide，旁邊故意放一個不相干的 node_modules/rules 套件
    const modules = path.join(temp, 'node_modules');
    const installed = path.join(modules, 'readme-guide');
    mkdirSync(installed, { recursive: true });
    const untar = spawnSync('tar', ['-xzf', path.join(temp, info.filename), '-C', installed, '--strip-components=1'], { encoding: 'utf8' });
    assert.equal(untar.status, 0, `解壓縮失敗：${untar.stderr}`);
    mkdirSync(path.join(modules, 'rules'));
    writeFileSync(path.join(modules, 'rules', 'rules.json'), '{ "這不是": "README Guide 的規則" }');
    writeFileSync(path.join(modules, 'rules', 'blocks.json'), 'not json');

    // npx 靠 bin 欄位找指令：名稱是 readme-guide，指到套件裡真的存在的檔案
    const manifest = JSON.parse(readFileSync(path.join(installed, 'package.json'), 'utf8'));
    assert.equal(manifest.bin?.['readme-guide'], 'bin/readme-guide.mjs');
    assert.ok(existsSync(path.join(installed, manifest.bin['readme-guide'])));
    assert.equal(manifest.private, undefined);
    assert.deepEqual(manifest.dependencies ?? {}, {});

    // 套件裡的規則跟根目錄的一字不差
    for (const name of RULE_FILES) {
      assert.equal(readFileSync(path.join(installed, 'rules', name), 'utf8'), readFileSync(path.join(rootRules, name), 'utf8'), name);
    }

    // 5. 用解出來的那份檢查兩份 README（範例專案複製到暫存資料夾，跟 repo 完全分開）
    const project = path.join(temp, 'breakfast-order');
    cpSync(fileURLToPath(new URL('../fixtures/breakfast-order', import.meta.url)), project, { recursive: true });
    const bin = path.join(installed, 'bin', 'readme-guide.mjs');
    const run = (...args) => spawnSync(process.execPath, [bin, ...args], { cwd: temp, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });

    const good = run('check', 'breakfast-order/README.md', '--json');
    assert.equal(good.status, 0, good.stderr);
    const goodJson = JSON.parse(good.stdout);
    assert.equal(goodJson.summary.errors, 0);
    assert.equal(goodJson.type.id, 'web-app');
    assert.equal(goodJson.projectFilesFound, true);

    const bad = run('check', 'breakfast-order/README.bad.md', '--json');
    assert.equal(bad.status, 1, bad.stderr);
    assert.ok(JSON.parse(bad.stdout).summary.errors > 0);

    const missing = run('check', 'nope/README.md');
    assert.equal(missing.status, 2);

    const explain = run('explain', 'CMD004', '--lang', 'en', '--json');
    assert.equal(explain.status, 0, explain.stderr);
    assert.equal(JSON.parse(explain.stdout).id, 'CMD004');

    // 說明文字用安裝後的指令名稱，不是 repo 裡的路徑
    const help = run('--help', '--lang', 'en');
    assert.match(help.stdout, /readme-guide check/);
    assert.doesNotMatch(help.stdout, /lint\/bin/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
  assert.equal(existsSync(temp), false);
});
