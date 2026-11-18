// 類型專屬規則：後端 API、作品集、課程範例各自多出來的要求。
import { readPackageJson } from '../project.js';
import { findSection } from '../sections.js';
import { proseLines, readableText } from './util.js';

const API_DOC_HINT = /swagger|api-docs|openapi|redoc|scalar|postman|\/docs\b|\/api\/docs/i;
const DB_DEPS = ['prisma', '@prisma/client', 'knex', 'sequelize', 'typeorm', 'drizzle-orm', '@mikro-orm/core'];
const DB_FILES = ['prisma', 'migrations', 'db/migrations', 'database/migrations', 'knexfile.js', 'knexfile.ts', 'knexfile.cjs', 'knexfile.mjs', '.sequelizerc', 'drizzle.config.ts', 'drizzle.config.js', 'ormconfig.json', 'ormconfig.js', 'ormconfig.ts'];

function hasSection(ctx, id) {
  return Boolean(findSection(ctx.sections, id));
}

export const checks = {
  'TYPE-API001'(ctx) {
    if (hasSection(ctx, 'api-docs')) return [];
    if (ctx.md.links.some((l) => API_DOC_HINT.test(l.href) || /API\s*(?:文件|docs?|documentation|reference)/i.test(l.text))) return [];
    if (ctx.md.lines.some((l) => l.kind === 'text' && /https?:\/\/\S*(?:swagger|api-docs|openapi|redoc|\/docs\b)/i.test(l.raw))) return [];
    return [{ messageKey: 'missing', line: null, column: null }];
  },

  'TYPE-API002'(ctx) {
    const evidence = DB_FILES.filter((f) => ctx.project.exists(f));
    const pkg = readPackageJson(ctx.project);
    const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
    evidence.push(...DB_DEPS.filter((d) => d in deps));
    if (!evidence.length) return [];
    if (/migrat|seed|db push|db:push|db:migrate|db:setup|db:init|schema:sync|createdb|CREATE DATABASE/i.test(ctx.md.source)) return [];
    const anchor = findSection(ctx.sections, 'getting-started');
    return [{ messageKey: 'missing', params: { evidence: evidence.slice(0, 3).join(', ') }, line: anchor?.line ?? null, column: anchor ? 1 : null }];
  },

  'TYPE-API003'(ctx) {
    for (const block of ctx.md.codeBlocks) {
      if (['http', 'rest', 'httpie'].includes(block.lang)) return [];
      if (block.lines.some(({ text }) => /\b(?:curl|wget|httpie|xh)\b|^\s*(?:\$\s+)?http\s+(?:GET|POST|PUT|PATCH|DELETE)\b|fetch\(/i.test(text))) return [];
    }
    return [{ messageKey: 'missing', line: null, column: null }];
  },

  'TYPE-PF001'(ctx) {
    return hasSection(ctx, 'my-role') ? [] : [{ messageKey: 'missing', line: null, column: null }];
  },

  'TYPE-PF002'(ctx) {
    return hasSection(ctx, 'design-decisions') ? [] : [{ messageKey: 'missing', line: null, column: null }];
  },

  'TYPE-CS002'(ctx) {
    if (hasSection(ctx, 'course-unit')) return [];
    const UNIT = /第\s*[0-9一二三四五六七八九十]+\s*(?:週|周|堂|章|單元|課|講)|\b(?:Lesson|Week|Chapter|Unit|Module|Session)\s*\d+/i;
    if (proseLines(ctx.md).some((l) => UNIT.test(readableText(l)))) return [];
    return [{ messageKey: 'missing', line: null, column: null }];
  },
};
