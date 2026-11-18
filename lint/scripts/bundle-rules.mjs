#!/usr/bin/env node
// 打包 npm 套件前後執行：把 repo 根目錄的 rules/*.json 與 LICENSE 放進套件，打包完再刪掉。
// 規則的單一來源仍然是根目錄的 rules/，這裡產生的複本不進版控（.gitignore 已排除）。
// 用法：node scripts/bundle-rules.mjs copy | clean
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = fileURLToPath(new URL('..', import.meta.url));
const repoDir = path.dirname(path.resolve(packageDir));
const target = path.join(packageDir, 'rules');
const license = path.join(packageDir, 'LICENSE');

function clean() {
  rmSync(target, { recursive: true, force: true });
  rmSync(license, { force: true });
}

function copy() {
  const source = path.join(repoDir, 'rules');
  if (!existsSync(path.join(source, 'rules.json'))) {
    console.error(`找不到規則資料：${source}（要在 README Guide 的 repo 裡打包）`);
    process.exit(1);
  }
  // 先清掉舊的複本，確保打包的是根目錄最新的規則
  clean();
  mkdirSync(target);
  for (const name of readdirSync(source).filter((n) => n.endsWith('.json'))) {
    copyFileSync(path.join(source, name), path.join(target, name));
  }
  copyFileSync(path.join(repoDir, 'LICENSE'), license);
}

const mode = process.argv[2];
if (mode === 'copy') copy();
else if (mode === 'clean') clean();
else {
  console.error('用法：node scripts/bundle-rules.mjs copy | clean');
  process.exit(2);
}
