import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { LOCALES } from './shared/utils/locales'
import { fetchGithubStars } from './shared/utils/githubStars'
import { MESSAGE_FILES } from './shared/utils/messages'
import { PROJECT_TYPES, templatePath } from './shared/utils/projectTypes'
import { allPagePaths } from './shared/utils/seo'
import { REPO_SLUG, SITE_URL } from './shared/utils/site'
import { injectSiteTags, siteTagIds } from './shared/utils/siteTags'


/** 分析與網站驗證碼（建置開始時讀一次；格式不對的話第一頁就會讓建置失敗） */
const siteTags = siteTagIds()

/** repo 根目錄（templates/ 在這裡） */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * 要預先產生的頁面：首頁、八塊的寫法、四種範本、檢查項目，兩種語言各一份（清單照 rules/ 算，見 shared/utils/seo.ts），
 * 再加上給搜尋引擎與 AI 讀的三個檔（server/routes/）。
 */
function prerenderRoutes(): string[] {
  return [...allPagePaths(), '/sitemap.xml', '/robots.txt', '/llms.txt']
}

/** 範本檔少了任何一個就讓建置失敗，並列出缺哪些（範本頁與首頁「複製這份範本」都要讀它們） */
function assertTemplatesExist() {
  const missing = LOCALES.flatMap((locale) => PROJECT_TYPES.map((type) => templatePath(type.id, locale.code)))
    .filter((path) => !existsSync(join(repoRoot, path)))
  if (missing.length > 0) {
    throw new Error(`找不到範本檔，範本頁與首頁「複製這份範本」都要讀它們：\n${missing.map((path) => `  - ${path}`).join('\n')}`)
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    // 建置時檢查範本檔都在（開發與 nuxt prepare 不檢查；開發時少了範本，範本頁會直接顯示錯誤）
    (_options, nuxt) => {
      if (nuxt.options.dev || nuxt.options._prepare) return
      nuxt.hook('build:before', assertTemplatesExist)
    },
    // 建置時讀一次 GitHub 星星數，寫進網站設定（產生出來的頁面直接帶著數字，瀏覽器不會再去問 GitHub）。
    // 讀不到就不寫，GitHub 按鈕只顯示按鈕、不顯示星星數；建置照常完成。
    // CI 會給 GITHUB_TOKEN（內建的 workflow 權杖，次數上限比較高），本機不用；權杖只放在請求標頭，不寫進任何輸出。
    // 不另外在 runtimeConfig 宣告 githubStars：宣告就得給預設值，型別產生又會把 null 當成字串；讀的地方一律用 parseStarCount 檢查
    async (_options, nuxt) => {
      if (nuxt.options._prepare) return
      const result = await fetchGithubStars({ repo: REPO_SLUG, token: process.env.GITHUB_TOKEN || undefined })
      if (result.ok) {
        nuxt.options.runtimeConfig.public.githubStars = result.stars
        console.info(`[GitHub 星星數] ${REPO_SLUG}：${result.stars}`)
      }
      else console.warn(`[GitHub 星星數] 讀不到 ${REPO_SLUG}，這次建置不顯示星星數：${result.reason}`)
    },
  ],

  devtools: { enabled: false },

  // 樣式不內嵌進 HTML：中文字型的字型宣告有幾百個切片，內嵌的話每一頁都多帶好幾百 KB；
  // 改成外部 CSS 檔，第一次載入後全站共用快取
  features: {
    inlineStyles: false,
  },

  // 站內連結一律輸出尾斜線（`/zh-tw` → `/zh-tw/`）：正式站會把沒有斜線的網址轉到有斜線的版本
  // （見根目錄 wrangler.jsonc 的 html_handling），內部連結先對齊才不會多繞一圈
  experimental: {
    defaults: {
      nuxtLink: { trailingSlash: 'append' },
    },
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0F100D' },
        { name: 'color-scheme', content: 'dark' },
      ],
      link: [
        // 網址圖示：新瀏覽器用 SVG，舊的用 ico，iOS 加到主畫面用 apple-touch-icon（scripts/render-og.mjs 產生）
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  i18n: {
    baseUrl: SITE_URL,
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    // 不自動跳轉：每個網址的內容都固定，換語言交給頂端列的切換
    detectBrowserLanguage: false,
    locales: LOCALES.map((locale) => ({
      code: locale.code,
      language: locale.tag,
      name: locale.nativeName,
      files: MESSAGE_FILES.map((file) => `${locale.code}/${file}.ts`),
    })),
  },

  fonts: {
    families: [
      // 等寬字：指令、檔名、終端機
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 700, 800] },
      // 英文頁的內文與標題：有 900 粗細，撐得起設計稿的粗標題，跟等寬字一樣偏工程感
      { name: 'Archivo', provider: 'google', weights: [400, 500, 700, 900] },
      // 繁中頁的內文（只在繁中頁載入，見 LocaleFontTc.vue）
      { name: 'Noto Sans TC', provider: 'google', weights: [400, 500, 700, 900] },
    ],
  },

  hooks: {
    // 繁中字型的樣式很大，英文頁不要在背景預先下載；繁中頁照常直接載入
    'build:manifest'(manifest) {
      for (const [id, meta] of Object.entries(manifest)) {
        if (id.includes('LocaleFontTc')) meta.prefetch = false
      }
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    // 固定輸出純靜態檔。不寫的話，在 Cloudflare 的建置環境裡 Nitro 會自動改用 Workers 的伺服器版輸出，
    // 跟本機、CI 產生的東西不一樣；部署只需要 .output/public（見根目錄 wrangler.jsonc）
    preset: 'static',
    hooks: {
      'prerender:generate'(route) {
        if (typeof route.contents !== 'string' || !route.fileName?.endsWith('.html')) return
        // 找不到頁面（404.html，以及 200.html 這個備用頁）是在瀏覽器裡才畫出內容的空殼，
        // 搜尋引擎不會執行到頁面裡的 noindex，所以直接寫進產生出來的 HTML
        if (['/404.html', '/200.html'].includes(route.route)) {
          route.contents = route.contents.replace('<head>', '<head><meta name="robots" content="noindex">')
        }
        // 分析與網站驗證碼（值來自建置環境的環境變數，見 shared/utils/siteTags.ts；沒設定就不加）。只在產生靜態頁時加，開發模式不載入分析
        route.contents = injectSiteTags(route.contents, siteTags)
      },
    },
    prerender: {
      crawlLinks: false,
      failOnError: true,
      routes: prerenderRoutes(),
    },
  },
})
