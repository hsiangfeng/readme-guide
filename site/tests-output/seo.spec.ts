import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOCALES } from '../shared/utils/locales'
import { allPagePaths, alternateLinks, localizedPath, pageUrl, PERSON_ID, SITE_PAGES } from '../shared/utils/seo'
import { PROJECT_TYPES } from '../shared/utils/projectTypes'
import { samplePath } from '../shared/utils/samples'
import { AI_CHECK_COMMAND, REPO_URL, SITE_URL, SKILL_URL } from '../shared/utils/site'
import { listGuideFiles } from '../server/utils/guideFiles'

/*
 * 產生出來的靜態網站（.output/public）：每一頁的 SEO 標籤、標題層級、結構化資料、分享圖，
 * 網站地圖、robots.txt、llms.txt，以及不能出現 AI 廠商名稱。要先跑 pnpm generate。
 */

const output = join(__dirname, '../.output/public')
if (!existsSync(join(output, 'index.html'))) throw new Error('找不到 .output/public/index.html，請先跑 pnpm generate')

/**
 * 讀產生出來的檔案。
 * @param path 相對於 .output/public 的路徑
 */
const read = (path: string) => readFileSync(join(output, path), 'utf8')

/**
 * 某個網址路徑對到的 HTML 檔。
 * @param path 網址路徑（有尾斜線）
 */
const htmlOf = (path: string) => read(`${path.replace(/^\//, '')}index.html`)

/** 標籤的某個屬性 */
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]

/** 所有符合的標籤 */
const tags = (html: string, pattern: RegExp) => html.match(pattern) ?? []

/** HTML 實體換回文字（標題、描述比對用） */
const decode = (text: string) => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")

const pages = LOCALES.flatMap((locale) => SITE_PAGES.map((page) => ({ locale, page, path: localizedPath(locale.code, page.path) })))

describe(`產生出來的 ${pages.length} 頁`, () => {
  it(`頁面數量是 ${allPagePaths().length}，每一頁都有 HTML`, () => {
    expect(pages).toHaveLength(allPagePaths().length)
    for (const { path } of pages) expect(existsSync(join(output, path, 'index.html')), path).toBe(true)
  })

  const heads = pages.map(({ locale, page, path }) => {
    const html = htmlOf(path)
    const head = html.slice(0, html.indexOf('</head>'))
    return { locale, page, path, html, head }
  })

  it('每一頁剛好一個 <title> 與一個描述，全站不重複', () => {
    const titles = heads.map(({ head, path }) => {
      const found = tags(head, /<title>[^<]*<\/title>/g)
      expect(found, path).toHaveLength(1)
      return decode(found[0]!.replace(/<\/?title>/g, ''))
    })
    const descriptions = heads.map(({ head, path }) => {
      const found = tags(head, /<meta name="description"[^>]*>/g)
      expect(found, path).toHaveLength(1)
      return attr(found[0]!, 'content')!
    })
    expect(new Set(titles).size).toBe(pages.length)
    expect(new Set(descriptions).size).toBe(pages.length)
  })

  it('<html lang> 是那一頁的語言', () => {
    for (const { html, locale, path } of heads) expect(/<html[^>]*\slang="([^"]+)"/.exec(html)?.[1], path).toBe(locale.tag)
  })

  it('canonical 指向自己（有尾斜線），三條 hreflang 兩種語言互相指向對方', () => {
    for (const { head, page, path } of heads) {
      const canonical = tags(head, /<link rel="canonical"[^>]*>/g)
      expect(canonical, path).toHaveLength(1)
      expect(attr(canonical[0]!, 'href'), path).toBe(pageUrl(path))
      const alternates = tags(head, /<link rel="alternate" hreflang[^>]*>/g).map((tag) => ({ hreflang: attr(tag, 'hreflang'), href: attr(tag, 'href') }))
      expect(alternates.sort((a, b) => a.hreflang!.localeCompare(b.hreflang!)), path)
        .toEqual(alternateLinks(page.path).sort((a, b) => a.hreflang.localeCompare(b.hreflang)))
    }
  })

  it('每一頁剛好一個 h1，標題層級不跳號', () => {
    for (const { html, path } of heads) {
      const body = html.slice(html.indexOf('<body'))
      const levels = [...body.matchAll(/<h([1-6])[\s>]/g)].map((match) => Number(match[1]))
      expect(levels.filter((level) => level === 1), path).toHaveLength(1)
      expect(levels[0], `${path}：第一個標題要是 h1`).toBe(1)
      levels.reduce((previous, level) => {
        expect(level, `${path}：h${previous} 後面直接接 h${level}`).toBeLessThanOrEqual(previous + 1)
        return level
      })
    }
  })

  it('圖片都有替代文字，圖示不是對輔助工具隱藏就是有名稱', () => {
    for (const { html, path } of heads) {
      for (const img of tags(html, /<img\b[^>]*>/g)) expect(img, path).toMatch(/\salt="/)
      for (const svg of tags(html, /<svg\b[^>]*>/g)) expect(svg, path).toMatch(/aria-hidden="true"|aria-label="|role="img"/)
    }
  })

  it('結構化資料解析得了；作者只有一份完整的，@id 是部落格那個；其他節點用 @id 指過去', () => {
    for (const { html, path, page } of heads) {
      const scripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      expect(scripts, path).toHaveLength(1)
      const data = JSON.parse(scripts[0]![1]!) as { '@graph': Record<string, unknown>[] }
      const graph = data['@graph']
      const people = graph.filter((node) => node['@type'] === 'Person')
      expect(people, path).toHaveLength(1)
      expect(people[0]!['@id'], path).toBe(PERSON_ID)
      expect(graph.some((node) => node['@type'] === 'WebSite'), path).toBe(true)
      if (page.kind !== 'home') {
        // 麵包屑最後一層用短名稱（塊名、類型名），不是整句標題
        const crumbs = graph.find((node) => node['@type'] === 'BreadcrumbList')?.itemListElement as { name: string }[] | undefined
        const main = graph.find((node) => String(node['@id']).endsWith('#main'))!
        expect(crumbs, path).toBeDefined()
        expect(crumbs!.at(-1)!.name.length, path).toBeLessThan(String(main.name).length)
      }
      for (const node of graph.filter((item) => item['@type'] !== 'Person')) {
        if ('author' in node) expect(node.author, path).toEqual({ '@id': PERSON_ID })
        if ('publisher' in node) expect(node.publisher, path).toEqual({ '@id': PERSON_ID })
      }
    }
  })

  it('分享卡片：og:image 沒有尾斜線而且檔案存在，og:url 等於 canonical', () => {
    for (const { head, path } of heads) {
      const image = attr(tags(head, /<meta property="og:image"[^>]*>/g)[0] ?? '', 'content')
      expect(image, path).toMatch(/\.png$/)
      expect(existsSync(join(output, image!.replace(SITE_URL, ''))), image).toBe(true)
      expect(attr(tags(head, /<meta property="og:url"[^>]*>/g)[0] ?? '', 'content'), path).toBe(pageUrl(path))
      for (const name of ['og:title', 'og:description', 'og:site_name', 'og:locale']) expect(head, `${path} ${name}`).toContain(`property="${name}"`)
      for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) expect(head, `${path} ${name}`).toContain(`name="${name}"`)
    }
  })

  it('theme-color、網址圖示（含 apple-touch-icon）都在，檔案也在', () => {
    for (const { head, path } of heads) {
      expect(head, path).toContain('name="theme-color"')
      for (const href of ['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/site.webmanifest']) {
        expect(head, `${path} ${href}`).toContain(`href="${href}"`)
        expect(existsSync(join(output, href)), href).toBe(true)
      }
    }
  })

  it('頁尾的站內連結：任何一頁都連得到每一頁（同一種語言），所以兩次點擊內一定到得了', () => {
    for (const { html, locale, path } of heads) {
      const links = new Set(tags(html, /<a\b[^>]*href="[^"]*"/g).map((tag) => attr(tag, 'href')!.split('#')[0]))
      for (const page of SITE_PAGES) expect(links, `${path} → ${page.path}`).toContain(localizedPath(locale.code, page.path))
    }
  })

  it('繁中字型只在繁中頁載入；字型都是 font-display: swap', () => {
    for (const { head, locale, path } of heads) {
      const sheets = tags(head, /<link rel="stylesheet"[^>]*>/g).map((tag) => attr(tag, 'href')!)
      const tc = sheets.some((href) => href.includes('LocaleFontTc'))
      expect(tc, path).toBe(locale.code === 'zh-tw')
    }
    for (const file of readdirSync(join(output, '_nuxt')).filter((name) => name.endsWith('.css'))) {
      const css = read(`_nuxt/${file}`)
      // 只看真的要下載字型檔的宣告（備用字型那種 local() 的不用）
      const faces = (css.match(/@font-face\{[^}]*\}/g) ?? []).filter((face) => face.includes('url('))
      for (const face of faces) expect(face, file).toContain('font-display:swap')
    }
  })
})

describe('找不到頁面', () => {
  it('404 頁有 noindex', () => {
    expect(read('404.html')).toMatch(/<meta name="robots" content="noindex/)
  })
})

describe('網站地圖、robots.txt、llms.txt', () => {
  it(`sitemap.xml 列了 ${allPagePaths().length} 個網址，每個都有三條語言對應`, () => {
    const xml = read('sitemap.xml')
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
    expect(locs.sort()).toEqual(allPagePaths().map(pageUrl).sort())
    expect(tags(xml, /<xhtml:link /g)).toHaveLength(locs.length * 3)
  })

  it('robots.txt：AI 訓練的爬蟲擋掉、AI 搜尋放行，有 Content-Signal 與 Sitemap', () => {
    const robots = read('robots.txt')
    const groups = robots.split(/\n\n/)
    const blocked = groups.find((group) => group.includes('Disallow: /'))!
    for (const agent of ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'Bytespider', 'cohere-ai', 'FacebookBot', 'Applebot-Extended']) expect(blocked).toContain(`User-agent: ${agent}\n`)
    const allowed = groups.find((group) => group.includes('OAI-SearchBot'))!
    for (const agent of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot']) expect(allowed).toContain(`User-agent: ${agent}\n`)
    expect(allowed).toContain('Allow: /')
    expect(robots).toContain('Content-Signal: ai-train=no, search=yes, ai-input=no')
    expect(robots.trim().split('\n').at(-1)).toBe(`Sitemap: ${SITE_URL}/sitemap.xml`)
  })

  it('llms.txt：叫 AI 讀網站上的 skill.md、不用 clone、用 npx 跑檢查工具；列出原始檔網址、填好的範例與全部頁面、最後是 Entity', () => {
    const llms = read('llms.txt')
    expect(llms).toContain(SKILL_URL)
    expect(llms).toContain('do not need to clone')
    expect(llms).not.toMatch(/git clone|readme-guide\.mjs/)
    expect(llms).toContain(AI_CHECK_COMMAND)
    expect(llms).toContain('Node.js 22 or later')
    // 放上網站的原始檔都列出網址（SKILL、references、範本、rules/ 的 JSON）
    for (const file of listGuideFiles(join(__dirname, '../..'))) expect(llms, file.path).toContain(`${SITE_URL}${file.path}`)
    // 原始碼的連結只留一處
    expect(llms.split(REPO_URL).length - 1).toBe(1)
    // 四種類型「填好的範例」，繁中與英文的路徑都列出來，而且檔案真的在
    for (const type of PROJECT_TYPES) {
      for (const locale of LOCALES) {
        const path = samplePath(type.id, locale.code)
        expect(llms, path).toContain(path)
        expect(existsSync(join(__dirname, '../..', path)), path).toBe(true)
      }
    }
    for (const path of allPagePaths()) expect(llms, path).toContain(`](${pageUrl(path)})`)
    expect(llms.trim().endsWith(`## Entity\n\nPerson canonical: ${PERSON_ID}`)).toBe(true)
  })
})

describe('不出現 AI 廠商或產品名稱（robots.txt 例外）', () => {
  /** 要檢查的檔案：所有 HTML、文字檔、網站地圖、頁面資料與程式 */
  const files = (dir: string): string[] => readdirSync(join(output, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = dir ? `${dir}/${entry.name}` : entry.name
    if (entry.isDirectory()) return files(path)
    return /\.(html|txt|xml|json|js|webmanifest)$/.test(entry.name) && path !== 'robots.txt' ? [path] : []
  })

  it('除了 robots.txt，輸出裡沒有這些名稱', () => {
    const pattern = /\b(?:Claude|Anthropic|OpenAI|ChatGPT|GPT-\d|Gemini|Copilot|Perplexity|Cohere)\b/
    for (const file of files('')) expect(pattern.exec(read(file))?.[0], file).toBeUndefined()
  })
})
