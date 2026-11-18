import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { LOCALES } from '../../shared/utils/locales'
import { SKILL_PATH } from '../../shared/utils/site'

/*
 * 放上網站給 AI 直接讀的原始檔：撰寫指南（SKILL.md）、它的 references、範本、rules/ 的 JSON。
 * 建置時從 repo 原文複製（伺服器資源 → 預先產生成靜態檔），網站上不另外存一份；開發模式（nuxt dev）也讀得到。
 * 網址與來源的對應寫在這裡，modules/guideFiles.ts 照這份清單註冊網址，llms.txt 與輸出檢查也用同一份。
 */

/** 一個放上網站的原始檔 */
export interface GuideFile {
  /** 網站上的路徑，例如 /templates/zh-TW/web-app.md */
  path: string
  /** repo 裡的來源（根目錄起算），例如 templates/zh-TW/web-app.md */
  source: string
  kind: 'markdown' | 'json'
}

/** 伺服器資源的名稱 → repo 裡的資料夾（只放這三個資料夾，不會把整個 repo 打包進去） */
export const GUIDE_ASSET_DIRS = {
  'guide-skill': 'skills/readme-guide',
  'guide-templates': 'templates',
  'guide-rules': 'rules',
} as const

export type GuideAssetBase = keyof typeof GUIDE_ASSET_DIRS

/**
 * 某個資料夾裡某種副檔名的檔案（照檔名排序）。
 * @param dir 資料夾的絕對路徑
 * @param extension 副檔名（含點）
 */
function filesIn(dir: string, extension: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => entry.name)
    .sort()
}

/**
 * 全部要放上網站的原始檔。照 repo 現在有的檔案列（references 與 rules/ 多了檔案，下次建置自動跟上）。
 * @param repoRoot repo 根目錄的絕對路徑
 */
export function listGuideFiles(repoRoot: string): GuideFile[] {
  const references = filesIn(join(repoRoot, 'skills/readme-guide/references'), '.md')
  const languages = [...new Set(LOCALES.map((locale) => locale.dataLang))]
  return [
    { path: SKILL_PATH, source: 'skills/readme-guide/SKILL.md', kind: 'markdown' },
    ...references.map((name) => ({ path: `/skill/references/${name}`, source: `skills/readme-guide/references/${name}`, kind: 'markdown' as const })),
    ...languages.flatMap((lang) => filesIn(join(repoRoot, 'templates', lang), '.md')
      .map((name) => ({ path: `/templates/${lang}/${name}`, source: `templates/${lang}/${name}`, kind: 'markdown' as const }))),
    ...filesIn(join(repoRoot, 'rules'), '.json').map((name) => ({ path: `/rules/${name}`, source: `rules/${name}`, kind: 'json' as const })),
  ]
}

/**
 * 網址對到哪一個伺服器資源的哪個檔案。
 * @param path 網站上的路徑
 */
export function guideAsset(path: string): { base: GuideAssetBase, key: string } | null {
  if (path === SKILL_PATH) return { base: 'guide-skill', key: 'SKILL.md' }
  const match = /^\/(skill\/references|templates|rules)\/(.+)$/.exec(path)
  if (!match) return null
  const base: GuideAssetBase = match[1] === 'skill/references' ? 'guide-skill' : match[1] === 'templates' ? 'guide-templates' : 'guide-rules'
  return { base, key: match[1] === 'skill/references' ? `references/${match[2]}` : match[2]! }
}

/**
 * 回應標頭：Markdown 與 JSON 都標明 UTF-8（繁中範本有中文）；不給搜尋引擎收錄，免得跟正式頁面搶。
 * 部署到 Cloudflare 後由 public/_headers 給同樣的標頭（輸出檢查會比對兩邊一致）。
 * @param kind 檔案種類
 */
export function guideFileHeaders(kind: GuideFile['kind']): Record<string, string> {
  return {
    'Content-Type': kind === 'markdown' ? 'text/markdown; charset=utf-8' : 'application/json; charset=utf-8',
    'X-Robots-Tag': 'noindex',
  }
}
