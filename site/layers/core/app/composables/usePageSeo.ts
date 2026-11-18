import { LOCALES } from '#shared/utils/locales'
import { pageMeta } from '#shared/utils/pageMeta'
import {
  alternateLinks,
  type JsonLdNode,
  localizedPath,
  OG_IMAGE,
  ogImageUrl,
  ogLocale,
  pageGraph,
  pageUrl,
  type SitePage,
} from '#shared/utils/seo'

/** 每一頁的 SEO 要多給的東西 */
export interface PageSeoOptions {
  /** 主要節點的型別：首頁 WebPage、寫法頁 TechArticle…… */
  type: string
  /** 主要節點多加的欄位 */
  extra?: JsonLdNode
  /** 其他節點 */
  nodes?: JsonLdNode[]
  /** 要不要麵包屑（首頁不用） */
  breadcrumb?: boolean
}

/**
 * 一頁的 SEO：標題、描述、canonical、三條語言對應、分享卡片、結構化資料（JSON-LD）。
 * 標題與描述的文字在訊息檔，名稱讀 rules/；網址一律從 shared/utils/seo.ts 組（頁面有尾斜線、圖片沒有）。
 * @param page 哪一頁
 * @param options 結構化資料的型別與多加的節點（可以是 getter，資料載入後才有的節點也放得進來）
 */
export function usePageSeo(page: SitePage, options: PageSeoOptions | (() => PageSeoOptions)) {
  const { t, locale } = useI18n()

  const head = computed(() => {
    const resolved = typeof options === 'function' ? options() : options
    const meta = pageMeta(page, locale.value, (key, params) => (params ? t(key, params) : t(key)))
    const url = pageUrl(localizedPath(locale.value, page.path))
    const image = ogImageUrl(locale.value)
    const imageAlt = t('common.meta.ogImageAlt')
    const graph = pageGraph({
      locale: locale.value,
      path: page.path,
      siteName: t('common.brand'),
      siteDescription: t('common.meta.description'),
      name: meta.name,
      description: meta.description,
      type: resolved.type,
      extra: resolved.extra,
      nodes: resolved.nodes,
      homeName: t('common.meta.home'),
      breadcrumb: resolved.breadcrumb ? [{ name: meta.crumb, path: page.path }] : undefined,
    })
    const otherLocales = LOCALES.filter((item) => item.code !== locale.value)
    return {
      title: meta.title,
      link: [
        { rel: 'canonical' as const, href: url, key: 'canonical' },
        ...alternateLinks(page.path).map((link) => ({ rel: 'alternate' as const, hreflang: link.hreflang, href: link.href, key: `alternate-${link.hreflang}` })),
      ],
      meta: [
        { name: 'description', content: meta.description, key: 'description' },
        { property: 'og:type', content: resolved.type.endsWith('Article') ? 'article' : 'website', key: 'og:type' },
        { property: 'og:site_name', content: t('common.brand'), key: 'og:site_name' },
        { property: 'og:title', content: meta.title, key: 'og:title' },
        { property: 'og:description', content: meta.description, key: 'og:description' },
        { property: 'og:url', content: url, key: 'og:url' },
        { property: 'og:locale', content: ogLocale(locale.value), key: 'og:locale' },
        ...otherLocales.map((item) => ({ property: 'og:locale:alternate', content: ogLocale(item.code), key: `og:locale:alternate-${item.code}` })),
        { property: 'og:image', content: image, key: 'og:image' },
        { property: 'og:image:width', content: String(OG_IMAGE.width), key: 'og:image:width' },
        { property: 'og:image:height', content: String(OG_IMAGE.height), key: 'og:image:height' },
        { property: 'og:image:type', content: OG_IMAGE.type, key: 'og:image:type' },
        { property: 'og:image:alt', content: imageAlt, key: 'og:image:alt' },
        { name: 'twitter:card', content: 'summary_large_image', key: 'twitter:card' },
        { name: 'twitter:title', content: meta.title, key: 'twitter:title' },
        { name: 'twitter:description', content: meta.description, key: 'twitter:description' },
        { name: 'twitter:image', content: image, key: 'twitter:image' },
        { name: 'twitter:image:alt', content: imageAlt, key: 'twitter:image:alt' },
      ],
      script: [
        // `<` 換成 <：內容裡有 `</script>` 也不會提早結束
        { type: 'application/ld+json' as const, innerHTML: JSON.stringify(graph).replace(/</g, '\\u003c'), key: 'jsonld' },
      ],
    }
  })

  useHead(head)
}
