/**
 * 網站分析與搜尋引擎的網站驗證碼。
 *
 * 值不寫在原始碼裡，由建置環境的環境變數提供（正式站設定在部署平台的建置變數）；
 * 沒設定的那一項就完全不輸出對應的標籤與指令碼。所以本機建置、PR 檢查，
 * 以及別人複製這個專案之後的建置，預設都不會帶分析，也不會帶到別人的驗證碼。
 *
 * 輸出的位置：產生靜態頁時（nuxt.config.ts 的 prerender:generate）塞進每一頁 HTML 的 `<head>` 開頭，
 * 所以開發模式（nuxt dev）不會載入分析。
 */

/**
 * 四個環境變數的名稱：
 * - `SITE_GA_ID`：Google 代碼的 ID。GA 後台「管理 → 資料串流 → 網頁 → 查看代碼操作說明 → 手動安裝」
 *   那段程式碼裡 `id=` 後面那一串，照抄就好（`GTM-` 或 `G-` 開頭）。
 * - `SITE_GOOGLE_VERIFICATION`：Google Search Console「HTML 標記」驗證方式裡
 *   `<meta name="google-site-verification">` 的 content。
 * - `SITE_BING_VERIFICATION`：Bing Webmaster Tools 的 `<meta name="msvalidate.01">` 的 content。
 * - `SITE_NAVER_VERIFICATION`：Naver Search Advisor 的 `<meta name="naver-site-verification">` 的 content。
 */
export const SITE_TAG_ENV = {
  ga: 'SITE_GA_ID',
  google: 'SITE_GOOGLE_VERIFICATION',
  bing: 'SITE_BING_VERIFICATION',
  naver: 'SITE_NAVER_VERIFICATION',
} as const

/** Google Analytics 載入指令碼的網域（輸出檢查裡唯一允許的外部網域） */
export const GA_ORIGIN = 'https://www.googletagmanager.com'

export interface SiteTagIds {
  ga: string
  google: string
  bing: string
  naver: string
}

/**
 * 建置時用的四個值：讀建置環境的環境變數，沒設定的就是空字串（不輸出）。
 * 前後的空白會去掉（從後台複製貼上時常多帶一個空白）。
 * @param env 環境變數
 */
export function siteTagIds(env: Record<string, string | undefined> = process.env): SiteTagIds {
  const read = (name: string) => (env[name] ?? '').trim()
  return {
    ga: read(SITE_TAG_ENV.ga),
    google: read(SITE_TAG_ENV.google),
    bing: read(SITE_TAG_ENV.bing),
    naver: read(SITE_TAG_ENV.naver),
  }
}

/** 驗證碼只會是英數與 `-`、`_`（各家給的格式）；不是的話多半是貼錯，讓建置失敗 */
const VERIFICATION_CODE = /^[\w-]+$/
const GA_ID = /^(?:GTM|GT|G)-[A-Z0-9]+$/

/**
 * 每一頁 `<head>` 開頭要加的 HTML。值是空的就不輸出那一項；格式不對就丟錯（建置失敗）。
 * Google Analytics 照 Google 代碼的官方安裝寫法（https://developers.google.com/tag-platform/gtagjs/install）：
 * 非同步載入，不擋第一個畫面；站內換頁的瀏覽量交給 GA 後台的「加強型評估：依瀏覽器記錄事件計算網頁變更」
 * （https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications），這裡不另外送，避免重複計算。
 * @param ids 四個值
 */
export function siteHeadHtml(ids: SiteTagIds): string {
  const parts: string[] = []
  const verifications: [name: string, value: string][] = [
    ['google-site-verification', ids.google],
    ['msvalidate.01', ids.bing],
    ['naver-site-verification', ids.naver],
  ]
  for (const [name, value] of verifications) {
    if (!value) continue
    if (!VERIFICATION_CODE.test(value)) throw new Error(`網站驗證碼 ${name} 的格式不對：「${value}」，只能有英數、-、_`)
    parts.push(`<meta name="${name}" content="${value}">`)
  }
  if (ids.ga) {
    if (!GA_ID.test(ids.ga)) throw new Error(`Google 代碼的 ID 格式不對：「${ids.ga}」，應該是 GTM- 或 G- 開頭`)
    parts.push(
      `<script async src="${GA_ORIGIN}/gtm.js?id=${ids.ga}"></script>`,
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());</script>`,
    )
  }
  return parts.join('')
}

/**
 * 把 siteHeadHtml 的內容塞到 `<head>` 之後（Google 建議放在 `<head>` 的最前面）。沒有要加的就原樣回傳。
 * @param html 一頁的 HTML
 * @param ids 四個值
 */
export function injectSiteTags(html: string, ids: SiteTagIds): string {
  const tags = siteHeadHtml(ids)
  if (!tags) return html
  if (!html.includes('<head>')) throw new Error('找不到 <head>，沒辦法加上分析與網站驗證的標籤')
  return html.replace('<head>', `<head>${tags}`)
}
