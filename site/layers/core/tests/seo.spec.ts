import { describe, expect, it } from 'vitest'
import { BLOCKS } from '../../../shared/utils/blocks'
import { LOCALES, localized } from '../../../shared/utils/locales'
import { createTranslator, MESSAGE_FILES, type Messages } from '../../../shared/utils/messages'
import { pageMeta, textWidth, TITLE_MAX_WIDTH } from '../../../shared/utils/pageMeta'
import { PROJECT_TYPES } from '../../../shared/utils/projectTypes'
import {
  allPagePaths,
  alternateLinks,
  assetUrl,
  checkerNode,
  localizedPath,
  ogImageUrl,
  pageGraph,
  pageUrl,
  PERSON_ID,
  PERSON_SAME_AS,
  SITE_PAGES,
} from '../../../shared/utils/seo'

/*
 * SEO 的資料：每一頁的標題與描述、網址、語言對應、結構化資料。
 * 產生出來的 HTML 另外由 tests-output/ 檢查（要先 pnpm generate）。
 */

const modules = import.meta.glob<{ default: Messages }>('../../../i18n/locales/*/*.ts', { eager: true })

/**
 * 某種語言的翻譯函式（全部文案檔合在一起）。
 * @param locale 語言代碼
 */
function translator(locale: string) {
  return createTranslator(Object.assign({}, ...MESSAGE_FILES.map((file) => modules[`../../../i18n/locales/${locale}/${file}.ts`]!.default)))
}

const metas = LOCALES.flatMap((locale) => SITE_PAGES.map((page) => ({ locale: locale.code, page, ...pageMeta(page, locale.code, translator(locale.code)) })))

/** 描述的長度範圍：英文照字元數；中文照字數（搜尋結果大約顯示 80 到 100 個中文字） */
const DESCRIPTION_RANGE: Record<string, [number, number]> = { 'en': [70, 160], 'zh-tw': [40, 100] }

describe('每一頁的標題與描述', () => {
  it(`頁面清單照 rules/ 算：首頁、${BLOCKS.length} 塊、${PROJECT_TYPES.length} 種範本、檢查項目，每種語言各一份`, () => {
    expect(SITE_PAGES).toHaveLength(BLOCKS.length + PROJECT_TYPES.length + 2)
    expect(allPagePaths()).toHaveLength(SITE_PAGES.length * LOCALES.length)
    expect(new Set(allPagePaths()).size).toBe(allPagePaths().length)
    for (const path of allPagePaths()) expect(path.endsWith('/'), path).toBe(true)
  })

  it('麵包屑用短名稱：寫法頁是塊名、範本頁是類型名（讀 rules/），首頁是 common.meta.home；不是整句標題', () => {
    for (const meta of metas) {
      const t = translator(meta.locale)
      const where = `${meta.locale} ${meta.page.path}`
      if (meta.page.kind === 'guide') expect(meta.crumb, where).toBe(localized(BLOCKS.find((block) => block.id === meta.page.id)!.name, meta.locale))
      if (meta.page.kind === 'template') expect(meta.crumb, where).toBe(localized(PROJECT_TYPES.find((type) => type.id === meta.page.id)!.name, meta.locale))
      if (meta.page.kind === 'home') expect(meta.crumb, where).toBe(t('common.meta.home'))
      if (meta.page.kind === 'rules') expect(meta.crumb, where).toBe(t('common.footer.rules'))
      expect(meta.crumb, where).not.toBe(meta.name)
    }
  })

  it('標題全站不重複、描述全站不重複', () => {
    expect(new Set(metas.map((meta) => meta.title)).size).toBe(metas.length)
    expect(new Set(metas.map((meta) => meta.description)).size).toBe(metas.length)
  })

  it(`標題不超過 ${TITLE_MAX_WIDTH} 個半形字寬（中文算兩個）；放得下才加站名`, () => {
    for (const meta of metas) expect(textWidth(meta.title), `${meta.locale} ${meta.page.path}：${meta.title}`).toBeLessThanOrEqual(TITLE_MAX_WIDTH)
  })

  it('描述的長度合理（英文 70 到 160 個字元，中文 40 到 100 個字）', () => {
    for (const meta of metas) {
      const [min, max] = DESCRIPTION_RANGE[meta.locale]!
      const length = [...meta.description].length
      expect(length, `${meta.locale} ${meta.page.path}（${length}）：${meta.description}`).toBeGreaterThanOrEqual(min)
      expect(length, `${meta.locale} ${meta.page.path}（${length}）：${meta.description}`).toBeLessThanOrEqual(max)
    }
  })

  it('寫法頁、範本頁的標題帶出那一塊、那個類型的名稱（讀 rules/）', () => {
    for (const meta of metas) {
      if (meta.page.kind === 'guide') expect(meta.title).toContain(localized(BLOCKS.find((block) => block.id === meta.page.id)!.name, meta.locale))
      if (meta.page.kind === 'template') expect(meta.title).toContain(localized(PROJECT_TYPES.find((type) => type.id === meta.page.id)!.name, meta.locale))
    }
  })

  it('沒有寫出 AI 廠商或產品名稱', () => {
    for (const meta of metas) expect(`${meta.title} ${meta.description}`).not.toMatch(/claude|anthropic|openai|chatgpt|gpt|gemini|copilot|perplexity/i)
  })
})

describe('網址', () => {
  it('頁面網址一律有尾斜線，錨點放在斜線後面', () => {
    expect(pageUrl('/')).toBe('https://readme-guide.com/')
    expect(pageUrl('/zh-tw')).toBe('https://readme-guide.com/zh-tw/')
    expect(pageUrl('/rules#CMD003')).toBe('https://readme-guide.com/rules/#CMD003')
  })

  it('圖片這類有副檔名的網址不加尾斜線；兩種用錯都會丟錯', () => {
    expect(assetUrl('/og/en.png')).toBe('https://readme-guide.com/og/en.png')
    expect(assetUrl('sitemap.xml')).toBe('https://readme-guide.com/sitemap.xml')
    expect(() => pageUrl('/og/en.png')).toThrow()
    expect(() => assetUrl('/rules/')).toThrow()
    expect(() => assetUrl('/rules')).toThrow()
    for (const locale of LOCALES) expect(ogImageUrl(locale.code)).toMatch(/\.png$/)
  })

  it('每一頁有三條語言對應（en、zh-Hant-TW、x-default），兩種語言互相指向對方', () => {
    for (const page of SITE_PAGES) {
      const links = alternateLinks(page.path)
      expect(links.map((link) => link.hreflang).sort()).toEqual(['en', 'x-default', 'zh-Hant-TW'])
      expect(links.find((link) => link.hreflang === 'en')!.href).toBe(pageUrl(localizedPath('en', page.path)))
      expect(links.find((link) => link.hreflang === 'zh-Hant-TW')!.href).toBe(pageUrl(localizedPath('zh-tw', page.path)))
      expect(links.find((link) => link.hreflang === 'x-default')!.href).toBe(pageUrl(page.path))
    }
  })
})

describe('結構化資料', () => {
  const graph = pageGraph({
    locale: 'zh-tw',
    path: '/guide/install/',
    siteName: 'README Guide',
    siteDescription: '站的描述',
    name: '安裝與執行怎麼寫',
    description: '描述',
    type: 'TechArticle',
    homeName: '首頁',
    breadcrumb: [{ name: '安裝與執行怎麼寫', path: '/guide/install/' }],
    nodes: [checkerNode('檢查工具', '說明')],
  })
  const nodes = graph['@graph']

  it('作者只寫一份完整的，@id 固定在部落格那邊；其他節點都用 @id 指過去', () => {
    const people = nodes.filter((node) => node['@type'] === 'Person')
    expect(people).toHaveLength(1)
    expect(people[0]!['@id']).toBe('https://israynotarray.com/#ray')
    expect(people[0]!.name).toBe('Ray')
    expect(people[0]!.sameAs).toBe(PERSON_SAME_AS)
    for (const node of nodes.filter((item) => item['@type'] !== 'Person')) {
      for (const field of ['author', 'publisher']) {
        if (field in node) expect(node[field], `${String(node['@type'])}.${field}`).toEqual({ '@id': PERSON_ID })
      }
    }
  })

  it('有本站、主要節點與麵包屑；麵包屑的網址都有尾斜線', () => {
    expect(nodes.map((node) => node['@type'])).toEqual(['WebSite', 'Person', 'TechArticle', 'BreadcrumbList', 'SoftwareSourceCode'])
    const crumbs = nodes.find((node) => node['@type'] === 'BreadcrumbList')!.itemListElement as { item: string }[]
    expect(crumbs.map((crumb) => crumb.item)).toEqual(['https://readme-guide.com/zh-tw/', 'https://readme-guide.com/zh-tw/guide/install/'])
  })

  it('轉成 JSON 再解析回來一模一樣，沒有評分、評論這類編出來的欄位', () => {
    const text = JSON.stringify(graph)
    expect(JSON.parse(text)).toEqual(graph)
    expect(text).not.toMatch(/aggregateRating|review|ratingValue/i)
  })
})

describe('中英文之間的空白', () => {
  it('繁中句子裡英數字結尾的名稱後面補空白，英文不動', async () => {
    const { beforeCjk } = await import('../../../shared/utils/locales')
    expect(beforeCjk('後端 API', 'zh-tw')).toBe('後端 API ')
    expect(beforeCjk('作品集', 'zh-tw')).toBe('作品集')
    expect(beforeCjk('Backend API', 'en')).toBe('Backend API')
    const meta = metas.find((item) => item.locale === 'zh-tw' && item.page.id === 'backend-api')!
    expect(meta.title.startsWith('後端 API 的 README 範本')).toBe(true)
  })
})
