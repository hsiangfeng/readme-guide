import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { guideFileHeaders, listGuideFiles } from '../server/utils/guideFiles'
import { allPagePaths, assetUrl } from '../shared/utils/seo'

/*
 * 產生出來的網站裡，撰寫指南的原始檔（/skill.md、references、範本、rules/ 的 JSON）。要先跑 pnpm generate。
 * 只比對「跟 repo 裡的來源一個位元組都不差、該有的檔都在」，不看內文（內文由別的地方維護）。
 */

const output = join(__dirname, '../.output/public')
if (!existsSync(join(output, 'index.html'))) throw new Error('找不到 .output/public/index.html，請先跑 pnpm generate')

const repoRoot = join(__dirname, '../..')
const files = listGuideFiles(repoRoot)

describe(`撰寫指南的原始檔（${files.length} 個）`, () => {
  it('四類都在，數量對', () => {
    const kinds = ['/skill.md', '/skill/references/', '/templates/', '/rules/']
    for (const prefix of kinds) expect(files.some((file) => file.path.startsWith(prefix)), prefix).toBe(true)
    expect(files.filter((file) => file.path.startsWith('/templates/'))).toHaveLength(8)
  })

  it('每個檔案都在輸出裡，而且跟 repo 裡的來源逐位元組相同', () => {
    for (const file of files) {
      const built = join(output, file.path)
      expect(existsSync(built), file.path).toBe(true)
      expect(readFileSync(built).equals(readFileSync(join(repoRoot, file.source))), `${file.path} 跟 ${file.source} 不一樣`).toBe(true)
    }
  })

  it('頁面沒有被蓋掉：/templates/<類型>/ 與 /rules/ 的頁面還在', () => {
    for (const page of allPagePaths()) expect(existsSync(join(output, page, 'index.html')), page).toBe(true)
  })

  it('網站地圖不列這些檔', () => {
    const sitemap = readFileSync(join(output, 'sitemap.xml'), 'utf8')
    for (const file of files) expect(sitemap.includes(assetUrl(file.path)), file.path).toBe(false)
  })
})

describe('Cloudflare 的標頭檔（_headers）', () => {
  /** 解析 _headers：網址規則 → 標頭（https://developers.cloudflare.com/workers/static-assets/headers/） */
  const rules = readFileSync(join(output, '_headers'), 'utf8').split(/\n(?=\/)/).flatMap((block) => {
    const lines = block.split('\n').filter((line) => line.trim() && !line.trim().startsWith('#'))
    const [pattern, ...headers] = lines
    if (!pattern?.startsWith('/')) return []
    // * 可以跨過斜線（貪婪比對）；:name 不跨斜線
    const regex = new RegExp(`^${pattern.trim().split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:\w+/g, '[^/]+')).join('.*')}$`)
    const pairs = headers.map((header) => {
      const colon = header.indexOf(':')
      return [header.slice(0, colon).trim(), header.slice(colon + 1).trim()]
    })
    return [{ pattern: pattern.trim(), regex, headers: Object.fromEntries(pairs) as Record<string, string> }]
  })

  /** 某個網址套到的標頭（多條規則都符合時合在一起） */
  const headersFor = (path: string) => Object.assign({}, ...rules.filter((rule) => rule.regex.test(path)).map((rule) => rule.headers))

  it('每個原始檔都有正確的 Content-Type 與 X-Robots-Tag: noindex，跟開發模式一致', () => {
    expect(rules.length).toBeGreaterThan(0)
    for (const file of files) expect(headersFor(file.path), file.path).toEqual(guideFileHeaders(file.kind))
  })

  it('不會誤傷頁面：任何一頁都不套用這些標頭', () => {
    for (const page of [...allPagePaths(), '/404.html']) expect(headersFor(page), page).toEqual({})
  })
})
