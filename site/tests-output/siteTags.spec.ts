import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GA_ORIGIN, injectSiteTags, siteTagIds, type SiteTagIds } from '../shared/utils/siteTags'

/*
 * 產生出來的每一頁：分析與網站驗證碼。要先跑 pnpm generate。
 * 期待的值跟建置時一樣讀 siteTagIds()（原始碼的常數；建置時有 SITE_GA_ID 等環境變數就用環境變數），
 * 所以帶測試值建置時，跑這個檢查也要帶同樣的環境變數。
 */

const output = join(__dirname, '../.output/public')
if (!existsSync(join(output, 'index.html'))) throw new Error('找不到 .output/public/index.html，請先跑 pnpm generate')

/** 每一個 HTML 檔（含 404.html） */
const pages = readdirSync(output, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => join(entry.parentPath, entry.name).slice(output.length + 1))

const read = (file: string) => readFileSync(join(output, file), 'utf8')

/** 字串出現幾次 */
const count = (text: string, part: string) => text.split(part).length - 1

/** 每一項的標記：沒填的時候整份 HTML 都不能出現，填了就剛好一次 */
const MARKERS: Record<keyof SiteTagIds, string> = {
  ga: `${GA_ORIGIN}/gtm.js`,
  google: '<meta name="google-site-verification"',
  bing: '<meta name="msvalidate.01"',
  naver: '<meta name="naver-site-verification"',
}

const ids = siteTagIds()

/** 建置時已經加上的分析與驗證標籤（套測試值前先拿掉） */
const FILLED_TAGS = /<meta name="(?:google-site-verification|msvalidate\.01|naver-site-verification)" content="[^"]*">|<script async src="[^"]*\/gtm\.js\?id=[^"]*"><\/script><script>window\.dataLayer[^<]*<\/script>/g

describe(`分析與網站驗證碼（${pages.length} 個 HTML）`, () => {
  it('頁數涵蓋全部頁面（至少 28 頁加 404）', () => {
    expect(pages.length).toBeGreaterThanOrEqual(29)
    expect(pages).toContain('index.html')
  })

  for (const key of Object.keys(MARKERS) as (keyof SiteTagIds)[]) {
    it(ids[key] ? `${key}：每一頁剛好一次，值是設定的那個` : `${key}：沒填，任何一頁都沒有`, () => {
      for (const page of pages) {
        const html = read(page)
        if (!ids[key]) {
          expect(html.includes(MARKERS[key]), page).toBe(false)
          if (key === 'ga') expect(html.includes('dataLayer'), page).toBe(false)
          continue
        }
        expect(count(html, MARKERS[key]), page).toBe(1)
        expect(html, page).toContain(key === 'ga' ? `${MARKERS.ga}?id=${ids.ga}"` : `${MARKERS[key]} content="${ids[key]}">`)
        // 放在 <head> 裡
        expect(html.indexOf(MARKERS[key]), page).toBeLessThan(html.indexOf('</head>'))
      }
    })
  }

  it('套上測試值時，每一頁各項剛好一次（確認每一頁都塞得進去，不會重複）', () => {
    const test: SiteTagIds = { ga: 'G-TEST123ABC', google: 'test-google', bing: 'TESTBING', naver: 'testnaver' }
    for (const page of pages) {
      // 已經填了的值先拿掉，回到建置前的樣子
      const html = injectSiteTags(read(page).replace(FILLED_TAGS, ''), test)
      for (const marker of Object.values(MARKERS)) expect(count(html, marker), `${page} ${marker}`).toBe(1)
    }
  })
})

describe('外部網域：只允許 Google Analytics', () => {
  /** HTML 裡會讓瀏覽器去載入東西的網址（script、link 的樣式／預載／圖示、img、iframe、source） */
  const RESOURCE = /<(?:script|img|iframe|source)\b[^>]*\bsrc="([^"]+)"|<link\b(?=[^>]*\brel="(?:stylesheet|preload|modulepreload|prefetch|preconnect|dns-prefetch|icon|apple-touch-icon|manifest)")[^>]*\bhref="([^"]+)"/g

  it('每一頁載入的東西都在本站，唯一的例外是 Google Analytics', () => {
    for (const page of pages) {
      for (const match of read(page).matchAll(RESOURCE)) {
        const url = match[1] ?? match[2]!
        if (!/^(?:https?:)?\/\//.test(url)) continue
        expect(url.startsWith(`${GA_ORIGIN}/`), `${page}：${url}`).toBe(true)
      }
    }
  })

  it('樣式表裡沒有外部網址（字型都放在本站）', () => {
    const css = readdirSync(join(output, '_nuxt')).filter((name) => name.endsWith('.css'))
    for (const file of css) expect(/url\((?:["']?)(?:https?:)?\/\//.exec(read(`_nuxt/${file}`))?.[0], file).toBeUndefined()
  })
})
