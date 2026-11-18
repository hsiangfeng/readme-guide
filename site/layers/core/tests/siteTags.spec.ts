import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GA_ORIGIN, injectSiteTags, SITE_TAG_ENV, siteHeadHtml, siteTagIds, type SiteTagIds } from '#shared/utils/siteTags'

/*
 * 分析與網站驗證碼：值是空的就什麼都不加；填了就每一項剛好一次、放在 <head> 開頭。
 * 真正的值由建置環境的環境變數提供，原始碼裡不放；測試值只放在這裡。
 * 產生出來的每一頁另外由 tests-output/siteTags.spec.ts 檢查。
 */

const EMPTY: SiteTagIds = { ga: '', google: '', bing: '', naver: '' }
const FILLED: SiteTagIds = { ga: 'G-TEST123ABC', google: 'test-google_Code-123', bing: 'TESTBING0123456789ABCDEF', naver: 'testnaver0123456789abcdef' }
const PAGE = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Page</title></head><body><header>x</header></body></html>'

/** 字串出現幾次 */
const count = (text: string, part: string) => text.split(part).length - 1

describe('分析與網站驗證碼', () => {
  it('原始碼裡不放任何值：沒有環境變數時四項都是空的', () => {
    expect(siteTagIds({})).toEqual(EMPTY)
    // 不小心把真正的 ID 或驗證碼寫回原始碼時在這裡擋下來（公開的專案，別人複製去部署會把流量算到這個站）
    const source = readFileSync(join(__dirname, '../../../shared/utils/siteTags.ts'), 'utf8')
    expect(source).not.toMatch(/['"`](?:GTM|GT|G)-[A-Z0-9]{6,}['"`]/)
    expect(source).not.toMatch(/\bconst\s+\w+\s*=\s*['"`][\w-]{20,}['"`]/)
  })

  it('四個值都空：HTML 原樣不動', () => {
    expect(siteHeadHtml(EMPTY)).toBe('')
    expect(injectSiteTags(PAGE, EMPTY)).toBe(PAGE)
  })

  it('四個值都填：每一項剛好一次，放在 <head> 的最前面', () => {
    const html = injectSiteTags(PAGE, FILLED)
    expect(count(html, '<meta name="google-site-verification" content="test-google_Code-123">')).toBe(1)
    expect(count(html, '<meta name="msvalidate.01" content="TESTBING0123456789ABCDEF">')).toBe(1)
    expect(count(html, '<meta name="naver-site-verification" content="testnaver0123456789abcdef">')).toBe(1)
    expect(count(html, `<script async src="${GA_ORIGIN}/gtm.js?id=G-TEST123ABC"></script>`)).toBe(1)
    expect(count(html, 'window.dataLayer=window.dataLayer||[]')).toBe(1)
    expect(html.indexOf('<head>') + '<head>'.length).toBe(html.indexOf('<meta name="google-site-verification"'))
    expect(html.indexOf('<meta charset')).toBeGreaterThan(html.indexOf('gtag('))
  })

  it('只填一部分：只輸出填了的那幾項', () => {
    const html = injectSiteTags(PAGE, { ...EMPTY, bing: 'TESTBING' })
    expect(html).toContain('msvalidate.01')
    for (const part of ['google-site-verification', 'naver-site-verification', 'googletagmanager', 'dataLayer']) expect(html).not.toContain(part)
  })

  it('Google Analytics 用非同步載入，不擋第一個畫面', () => {
    expect(siteHeadHtml({ ...EMPTY, ga: 'G-TEST123ABC' })).toMatch(/<script async src="https:\/\/www\.googletagmanager\.com\/[^"]+"><\/script>/)
  })

  it('格式不對就讓建置失敗，不輸出壞掉的標籤', () => {
    expect(() => siteHeadHtml({ ...EMPTY, ga: 'UA-12345-1' })).toThrow()
    expect(() => siteHeadHtml({ ...EMPTY, ga: 'GTM-TEST123' })).not.toThrow()
    expect(() => siteHeadHtml({ ...EMPTY, google: 'abc" onload="x' })).toThrow()
    expect(() => siteHeadHtml({ ...EMPTY, naver: '<script>' })).toThrow()
  })

  it('值從環境變數來，前後的空白會去掉', () => {
    expect(siteTagIds({ SITE_GA_ID: 'G-ENV', SITE_GOOGLE_VERIFICATION: 'g', SITE_BING_VERIFICATION: 'b', SITE_NAVER_VERIFICATION: 'n' }))
      .toEqual({ ga: 'G-ENV', google: 'g', bing: 'b', naver: 'n' })
    expect(siteTagIds({ SITE_GA_ID: ' G-ENV\n', SITE_BING_VERIFICATION: '' })).toEqual({ ...EMPTY, ga: 'G-ENV' })
    expect(Object.values(SITE_TAG_ENV)).toEqual(['SITE_GA_ID', 'SITE_GOOGLE_VERIFICATION', 'SITE_BING_VERIFICATION', 'SITE_NAVER_VERIFICATION'])
  })
})
