import { LOCALES } from '#shared/utils/locales'
import { alternateLinks, localizedPath, pageUrl, SITE_PAGES } from '#shared/utils/seo'

/**
 * 網站地圖：全部頁面 × 全部語言，每一個網址都附上語言對應（跟頁面裡的 hreflang 一樣）。
 * 沒有放 lastmod：沒有可靠的修改日期，寫建置時間反而會讓搜尋引擎以為每一頁天天都改。
 */
export default defineEventHandler((event) => {
  const urls = LOCALES.flatMap((locale) => SITE_PAGES.map((page) => {
    const links = alternateLinks(page.path)
      .map((link) => `    <xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${link.href}"/>`)
      .join('\n')
    return `  <url>\n    <loc>${pageUrl(localizedPath(locale.code, page.path))}</loc>\n${links}\n  </url>`
  }))
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
})
