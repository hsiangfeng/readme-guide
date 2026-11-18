// 專案資料夾的存取。檢查工具只透過這裡讀專案檔案，測試時可以換成記憶體裡的假專案。
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * 真實的專案資料夾。
 * @param {string} dir 專案資料夾的絕對路徑
 */
export function fsProject(dir) {
  const abs = (rel) => path.resolve(dir, rel);
  return {
    dir,
    name: path.basename(dir),
    exists: (rel) => existsSync(abs(rel)),
    isDir: (rel) => existsSync(abs(rel)) && statSync(abs(rel)).isDirectory(),
    readText: (rel) => {
      try {
        return readFileSync(abs(rel), 'utf8');
      } catch {
        return null;
      }
    },
    list: (rel = '.') => {
      try {
        return readdirSync(abs(rel));
      } catch {
        return [];
      }
    },
  };
}

/**
 * 記憶體裡的假專案（測試用）。
 * @param {Record<string,string>} files 路徑對內容，路徑用 / 分隔
 * @param {string} [name] 專案資料夾名稱
 */
export function memoryProject(files, name = 'demo-project') {
  const norm = (rel) => path.posix.normalize(rel.replace(/\\/g, '/')).replace(/^\.\//, '').replace(/\/$/, '');
  const fileMap = new Map(Object.entries(files).map(([k, v]) => [norm(k), v]));
  const dirs = new Set(['.']);
  for (const key of fileMap.keys()) {
    const parts = key.split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join('/'));
  }
  return {
    dir: `/memory/${name}`,
    name,
    exists: (rel) => fileMap.has(norm(rel)) || dirs.has(norm(rel)),
    isDir: (rel) => dirs.has(norm(rel)),
    readText: (rel) => fileMap.get(norm(rel)) ?? null,
    list: (rel = '.') => {
      const base = norm(rel);
      const prefix = base === '.' ? '' : `${base}/`;
      const names = new Set();
      for (const key of [...fileMap.keys(), ...dirs]) {
        if (key === '.' || !key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (rest) names.add(rest.split('/')[0]);
      }
      return [...names];
    },
  };
}

const IGNORED_ENTRIES = new Set(['.DS_Store', 'Thumbs.db', '.git']);

/**
 * 專案資料夾裡除了 README（與其他 .md 文件）之外，還有沒有別的檔案。
 * 只有 README 時，要對照專案檔案的規則會被跳過。
 * @param {ReturnType<typeof fsProject>} project
 */
export function hasProjectFiles(project) {
  return project.list('.').some((entry) => !IGNORED_ENTRIES.has(entry) && !/\.md$/i.test(entry));
}

/** 讀 package.json，讀不到或格式錯誤時回傳 null */
export function readPackageJson(project, dir = '.') {
  const text = project.readText(dir === '.' ? 'package.json' : `${dir}/package.json`);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
