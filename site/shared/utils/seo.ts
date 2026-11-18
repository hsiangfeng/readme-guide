import { BLOCKS } from './blocks'
import { DEFAULT_LOCALE, LOCALES, localeInfo } from './locales'
import { PROJECT_TYPES } from './projectTypes'
import { REPO_URL, SITE_URL } from './site'

/**
 * SEO 共用：網址、語言對應、頁面清單、結構化資料（JSON-LD）。
 * 網址分兩種，用兩個函式組：頁面一律有尾斜線（`pageUrl`），圖片這類有副檔名的資源一律沒有（`assetUrl`）。
 * 搞混的話 `…/og.png/` 會 404，`…/rules` 會多一次 301。
 */

/** 頁面的種類 */
export type PageKind = 'home' | 'guide' | 'template' | 'rules'

/** 一個頁面（不分語言） */
export interface SitePage {
  kind: PageKind
  /** 塊或類型的代號（首頁、檢查項目頁沒有） */
  id?: string
  /** 不帶語言前綴、有尾斜線的路徑，例如 `/guide/install/` */
  path: string
}

/** 全站要被收錄的頁面（不分語言）：首頁、八塊的寫法、四種範本、檢查項目。清單照 rules/ 算 */
export const SITE_PAGES: readonly SitePage[] = [
  { kind: 'home', path: '/' },
  ...BLOCKS.map((block) => ({ kind: 'guide' as const, id: block.id, path: `/guide/${block.id}/` })),
  ...PROJECT_TYPES.map((type) => ({ kind: 'template' as const, id: type.id, path: `/templates/${type.id}/` })),
  { kind: 'rules', path: '/rules/' },
]

/**
 * 找出某一頁。
 * @param kind 頁面種類
 * @param id 塊或類型的代號
 */
export function sitePage(kind: PageKind, id?: string): SitePage {
  const page = SITE_PAGES.find((item) => item.kind === kind && item.id === id)
  if (!page) throw new Error(`沒有這一頁：${kind} ${id ?? ''}`)
  return page
}

/**
 * 加上語言前綴的路徑（預設語言英文沒有前綴）。
 * @param code 網站語言代碼
 * @param path 不帶語言前綴、有尾斜線的路徑
 */
export function localizedPath(code: string, path: string): string {
  return code === DEFAULT_LOCALE ? path : `/${code}${path}`
}

/** 全站所有頁面 × 所有語言的路徑（預先產生、網站地圖、測試共用） */
export function allPagePaths(): string[] {
  return LOCALES.flatMap((locale) => SITE_PAGES.map((page) => localizedPath(locale.code, page.path)))
}

/** 路徑最後一段有沒有副檔名（`og/en.png` 有，`guide/install/` 沒有） */
function hasExtension(path: string): boolean {
  return /\.[a-z0-9]+$/i.test(path.split(/[?#]/)[0]!)
}

/**
 * 頁面的完整網址，一律有尾斜線（正式站會把沒有斜線的網址轉到有斜線的版本，見根目錄 wrangler.jsonc）。
 * 傳進有副檔名的路徑會直接丟錯：那是資源，要用 `assetUrl`。
 * @param path 站內路徑（可以已經有語言前綴）
 */
export function pageUrl(path: string): string {
  if (hasExtension(path)) throw new Error(`pageUrl 只給頁面用，「${path}」是檔案，請用 assetUrl`)
  const [pathname, hash] = path.split('#')
  const withSlash = pathname!.endsWith('/') ? pathname : `${pathname}/`
  return `${SITE_URL}${withSlash}${hash ? `#${hash}` : ''}`
}

/**
 * 資源（圖片、文字檔）的完整網址，絕不加尾斜線。
 * 傳進沒有副檔名或結尾是斜線的路徑會直接丟錯：那是頁面，要用 `pageUrl`。
 * @param path 站內路徑，例如 `/og/en.png`
 */
export function assetUrl(path: string): string {
  if (path.endsWith('/') || !hasExtension(path)) throw new Error(`assetUrl 只給有副檔名的檔案用，「${path}」請用 pageUrl`)
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** 一條語言對應（`<link rel="alternate" hreflang>`） */
export interface AlternateLink {
  hreflang: string
  href: string
}

/**
 * 某一頁的語言對應：每種語言一條，再加一條 `x-default`（指向預設語言英文）。
 * @param path 不帶語言前綴的路徑
 */
export function alternateLinks(path: string): AlternateLink[] {
  return [
    ...LOCALES.map((locale) => ({ hreflang: locale.tag, href: pageUrl(localizedPath(locale.code, path)) })),
    { hreflang: 'x-default', href: pageUrl(localizedPath(DEFAULT_LOCALE, path)) },
  ]
}

/** 分享圖（1200×630，每種語言一張，`site/scripts/render-og.mjs` 產生） */
export const OG_IMAGE = { width: 1200, height: 630, type: 'image/png' } as const

/**
 * 某種語言的分享圖網址。
 * @param code 網站語言代碼
 */
export function ogImageUrl(code: string): string {
  return assetUrl(`/og/${localeInfo(code).code}.png`)
}

/** `og:locale` 用的寫法（`zh-Hant-TW` → `zh_TW`） */
export function ogLocale(code: string): string {
  return code === 'zh-tw' ? 'zh_TW' : 'en_US'
}

/* ───── 結構化資料 ───── */

/** 作者的 `@id`：固定指到部落格那邊，所有站台共用這一個人（不可以改成本站網域） */
export const PERSON_ID = 'https://israynotarray.com/#ray'

/** 作者的其他網站與帳號（所有站台互相指認，集中在這裡改） */
export const PERSON_SAME_AS: readonly string[] = [
  'https://israynotarray.com',
  'https://israynotarray.dev',
  'https://tools.israynotarray.dev',
  'https://labor.israynotarray.dev',
  'https://gems.israynotarray.dev',
  'https://skills.israynotarray.dev',
  'https://line-analysis.israynotarray.dev',
  'https://calculator.israynotarray.dev',
  'https://galaxy.israynotarray.dev',
  'https://just-google-it.israynotarray.dev',
  'https://readme-guide.com',
  'https://github.com/hsiangfeng',
  'https://www.facebook.com/israynotarray',
  'https://www.youtube.com/@IsRayNotArray',
]

/** 作者節點（每一頁都放一份完整的，其他節點用 `PERSON_REF` 指過來） */
export const PERSON_NODE = {
  '@type': 'Person',
  '@id': PERSON_ID,
  'name': 'Ray',
  'url': 'https://israynotarray.com',
  'jobTitle': 'Software Engineer',
  'sameAs': PERSON_SAME_AS,
} as const

/** 指到作者 */
export const PERSON_REF = { '@id': PERSON_ID } as const

/** 本站的 `@id` */
export const WEBSITE_ID = `${SITE_URL}/#website`

/** 檢查工具的 `@id`（首頁與檢查項目頁都會提到它） */
export const CHECKER_ID = `${SITE_URL}/#checker`

/** JSON-LD 的一個節點 */
export type JsonLdNode = Record<string, unknown>

/** 組一頁結構化資料要的東西 */
export interface PageGraphInput {
  /** 網站語言代碼 */
  locale: string
  /** 不帶語言前綴的路徑 */
  path: string
  /** 站名 */
  siteName: string
  /** 站的一句話描述（WebSite 用） */
  siteDescription: string
  /** 這一頁的標題（不含站名）與描述 */
  name: string
  description: string
  /** 這一頁的主要節點型別，例如 TechArticle；首頁用 WebPage */
  type: string
  /** 主要節點多加的欄位 */
  extra?: JsonLdNode
  /** 麵包屑：首頁之後的每一層（最後一層是這一頁）；首頁不給 */
  breadcrumb?: { name: string, path: string }[]
  /** 首頁的名稱（麵包屑第一層） */
  homeName: string
  /** 其他要放進來的節點（例如檢查工具） */
  nodes?: JsonLdNode[]
}

/**
 * 一頁的結構化資料：本站、作者、這一頁的主要節點、麵包屑，放在同一個 `@graph`。
 * 只放頁面上看得到的東西；作者只寫一次完整的，其他地方都用 `@id` 指過去。
 * @param input 這一頁的內容
 */
export function pageGraph(input: PageGraphInput): { '@context': string, '@graph': JsonLdNode[] } {
  const url = pageUrl(localizedPath(input.locale, input.path))
  const inLanguage = localeInfo(input.locale).tag
  const graph: JsonLdNode[] = [
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      'url': pageUrl('/'),
      'name': input.siteName,
      'description': input.siteDescription,
      'inLanguage': LOCALES.map((locale) => locale.tag),
      'author': PERSON_REF,
      'publisher': PERSON_REF,
    },
    PERSON_NODE,
    {
      '@type': input.type,
      '@id': `${url}#main`,
      'url': url,
      'name': input.name,
      ...(input.type.endsWith('Article') ? { headline: input.name } : {}),
      'description': input.description,
      'inLanguage': inLanguage,
      'isPartOf': { '@id': WEBSITE_ID },
      'author': PERSON_REF,
      'publisher': PERSON_REF,
      'image': ogImageUrl(input.locale),
      ...(input.breadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      ...input.extra,
    },
  ]
  if (input.breadcrumb) {
    const items = [{ name: input.homeName, path: '/' }, ...input.breadcrumb]
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': pageUrl(localizedPath(input.locale, item.path)),
      })),
    })
  }
  graph.push(...(input.nodes ?? []))
  return { '@context': 'https://schema.org', '@graph': graph }
}

/**
 * 檢查工具的節點：放在 repo 裡的一支 Node.js 指令。
 * @param name 名稱
 * @param description 說明（頁面上看得到的那句）
 */
export function checkerNode(name: string, description: string): JsonLdNode {
  return {
    '@type': 'SoftwareSourceCode',
    '@id': CHECKER_ID,
    'name': name,
    'description': description,
    'codeRepository': REPO_URL,
    'programmingLanguage': 'JavaScript',
    'runtimePlatform': 'Node.js',
    'author': PERSON_REF,
  }
}
