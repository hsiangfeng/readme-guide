// 授權類規則：README、LICENSE 檔、package.json 三處的授權是否一致。
import { findSection, sectionText } from '../sections.js';

const PROPRIETARY = 'PROPRIETARY';

// README 文字裡的授權名稱（順序重要：先比對較長、較特定的名稱）
const README_PATTERNS = [
  ['AGPL-3.0', /\bAGPL(?:[- ]?v?3(?:\.0)?)?\b|GNU Affero/i],
  ['LGPL-3.0', /\bLGPL[- ]?v?3(?:\.0)?\b/i],
  ['LGPL-2.1', /\bLGPL[- ]?v?2\.1\b/i],
  ['GPL-3.0', /(?<![AL])\bGPL[- ]?v?3(?:\.0)?\b|GNU General Public License v(?:ersion )?3/i],
  ['GPL-2.0', /(?<![AL])\bGPL[- ]?v?2(?:\.0)?\b|GNU General Public License v(?:ersion )?2/i],
  ['Apache-2.0', /\bApache(?:[- ]License)?[- ,]*(?:v(?:ersion)?\s*)?2(?:\.0)?\b/i],
  ['MPL-2.0', /\bMPL[- ]?2(?:\.0)?\b|Mozilla Public License/i],
  ['BSD-3-Clause', /\bBSD[- ]3(?:[- ]Clause)?\b/i],
  ['BSD-2-Clause', /\bBSD[- ]2(?:[- ]Clause)?\b/i],
  ['CC-BY-NC-SA-4.0', /\bCC[- ]BY[- ]NC[- ]SA(?:[- ]4\.0)?\b/i],
  ['CC-BY-NC-4.0', /\bCC[- ]BY[- ]NC(?![- ]SA)(?:[- ]4\.0)?\b/i],
  ['CC-BY-SA-4.0', /\bCC[- ]BY[- ]SA(?:[- ]4\.0)?\b/i],
  ['CC-BY-4.0', /\bCC[- ]BY(?![- ](?:NC|SA))(?:[- ]4\.0)?\b/i],
  ['CC0-1.0', /\bCC0\b/i],
  ['Unlicense', /\bUnlicense\b/],
  ['ISC', /\bISC\b/],
  ['MIT', /\bMIT\b/],
];
const PROPRIETARY_PATTERN = /保留所有權利|版權所有|不開放|未授權|all rights reserved|proprietary|\bUNLICENSED\b/i;

/** 從 README 的授權章節找出授權名稱 */
export function licensesInText(text) {
  const found = new Set();
  let rest = text;
  for (const [id, pattern] of README_PATTERNS) {
    if (pattern.test(rest)) {
      found.add(id);
      rest = rest.replace(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`), ' ');
    }
  }
  if (!found.size && PROPRIETARY_PATTERN.test(text)) found.add(PROPRIETARY);
  return found;
}

/** 從 LICENSE 檔的全文判斷授權 */
export function licenseOfFile(text) {
  const head = text.slice(0, 3000);
  if (/GNU AFFERO GENERAL PUBLIC LICENSE/i.test(head)) return 'AGPL-3.0';
  if (/GNU LESSER GENERAL PUBLIC LICENSE[\s\S]{0,60}Version 2\.1/i.test(head)) return 'LGPL-2.1';
  if (/GNU LESSER GENERAL PUBLIC LICENSE/i.test(head)) return 'LGPL-3.0';
  if (/GNU GENERAL PUBLIC LICENSE[\s\S]{0,60}Version 2/i.test(head)) return 'GPL-2.0';
  if (/GNU GENERAL PUBLIC LICENSE/i.test(head)) return 'GPL-3.0';
  if (/Apache License[\s\S]{0,60}Version 2\.0/i.test(head)) return 'Apache-2.0';
  if (/Mozilla Public License,?\s*(?:Version|v\.?)\s*2\.0/i.test(head)) return 'MPL-2.0';
  if (/MIT License|Permission is hereby granted, free of charge/i.test(head)) return 'MIT';
  if (/ISC License|Permission to use, copy, modify, and\/or distribute this software for any purpose/i.test(head)) return 'ISC';
  if (/This is free and unencumbered software released into the public domain/i.test(head)) return 'Unlicense';
  if (/CC0 1\.0|Creative Commons Zero/i.test(head)) return 'CC0-1.0';
  if (/Redistribution and use in source and binary forms/i.test(head)) return /Neither the name/i.test(text) ? 'BSD-3-Clause' : 'BSD-2-Clause';
  if (/Attribution-NonCommercial-ShareAlike 4\.0/i.test(head)) return 'CC-BY-NC-SA-4.0';
  if (/Attribution-NonCommercial 4\.0/i.test(head)) return 'CC-BY-NC-4.0';
  if (/Attribution-ShareAlike 4\.0/i.test(head)) return 'CC-BY-SA-4.0';
  if (/Attribution 4\.0 International/i.test(head)) return 'CC-BY-4.0';
  if (PROPRIETARY_PATTERN.test(head) && !/permission is hereby granted/i.test(head)) return PROPRIETARY;
  return null;
}

/** package.json 的 license 欄位 */
export function licensesOfPackage(pkg) {
  const value = typeof pkg?.license === 'string' ? pkg.license : pkg?.license?.type;
  if (typeof value !== 'string' || /^SEE LICEN[CS]E IN/i.test(value)) return new Set();
  if (/^UNLICENSED$/i.test(value)) return new Set([PROPRIETARY]);
  return new Set(
    value
      .replace(/[()]/g, ' ')
      .split(/\s+(?:OR|AND|WITH)\s+/i)
      .map((s) => s.trim().replace(/-only$|-or-later$|\+$/i, ''))
      .filter(Boolean),
  );
}

/** 專案根目錄的授權檔 */
export function licenseFiles(project) {
  return project.list('.').filter((name) => /^(?:LICEN[CS]E|COPYING)(?:[-.][\w.-]+)?$/i.test(name) && !project.isDir(name));
}

const same = (a, b) => a.toLowerCase() === b.toLowerCase();
const overlaps = (a, b) => [...a].some((x) => [...b].some((y) => same(x, y)));
const show = (set) => (set.size ? [...set].map((x) => (x === PROPRIETARY ? '保留所有權利' : x)).join(' / ') : '—');
const showEn = (set) => (set.size ? [...set].map((x) => (x === PROPRIETARY ? 'all rights reserved' : x)).join(' / ') : '—');

export const checks = {
  LIC001(ctx) {
    if (findSection(ctx.sections, 'license')) return [];
    const files = licenseFiles(ctx.project);
    if (files.length) {
      const id = licenseOfFile(ctx.project.readText(files[0]) ?? '');
      // 授權檔寫的是「保留所有權利」，視為不公開的專案
      if (id === PROPRIETARY) return [];
      const license = id ?? { 'zh-TW': '看不出是哪一種授權', en: 'license not recognized' };
      return [{ messageKey: 'file', params: { file: files[0], license }, line: null, column: null }];
    }
    const fromPkg = [...licensesOfPackage(ctx.pkg)].filter((x) => x !== PROPRIETARY);
    // npm init 預設會填 ISC，只有這個值又沒有授權檔時，不當成刻意選的授權
    if (!fromPkg.length || (fromPkg.length === 1 && same(fromPkg[0], 'ISC'))) return [];
    return [{ messageKey: 'package', params: { license: fromPkg.join(' / ') }, line: null, column: null }];
  },

  LIC002(ctx) {
    const section = findSection(ctx.sections, 'license');
    if (!section) return [];
    const readme = licensesInText(sectionText(ctx.md, section));
    const files = licenseFiles(ctx.project);
    const fromFile = new Set(files.map((f) => licenseOfFile(ctx.project.readText(f) ?? '')).filter(Boolean));
    const fromPkg = licensesOfPackage(ctx.pkg);
    const sources = [
      ['README', readme],
      [files[0] ?? 'LICENSE', fromFile],
      ['package.json', fromPkg],
    ].filter(([, set]) => set.size > 0);
    let conflict = false;
    for (let i = 0; i < sources.length; i++) {
      for (let k = i + 1; k < sources.length; k++) if (!overlaps(sources[i][1], sources[k][1])) conflict = true;
    }
    if (!conflict) return [];
    const details = {
      'zh-TW': `README 寫 ${show(readme)}，${files[0] ?? 'LICENSE'} 檔是 ${show(fromFile)}，package.json 是 ${show(fromPkg)}`,
      en: `README says ${showEn(readme)}, ${files[0] ?? 'LICENSE'} is ${showEn(fromFile)}, package.json is ${showEn(fromPkg)}`,
    };
    return [{ messageKey: 'mismatch', params: { details }, line: section.line, column: 1 }];
  },

  LIC003(ctx) {
    const section = findSection(ctx.sections, 'license');
    if (!section) return [];
    const readme = licensesInText(sectionText(ctx.md, section));
    if (!readme.size || readme.has(PROPRIETARY) || licenseFiles(ctx.project).length) return [];
    return [{ messageKey: 'missing', params: { license: [...readme].join(' / ') }, line: section.line, column: 1 }];
  },
};
