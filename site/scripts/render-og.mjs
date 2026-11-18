/**
 * 產生分享圖與網址圖示，放進 public/：
 * - public/og/<語言>.png（1200×630，社群分享卡片用，每種語言一張）
 * - public/apple-touch-icon.png（180×180）、public/icon-192.png、public/icon-512.png、public/favicon.ico（32×32）
 *
 * 做法：組一個不對外的靜態版面（深色、琥珀色、等寬字，跟網站同一套顏色，不用漸層），用本機的 Chrome 無頭模式截圖。
 * 不需要另外裝套件。分享圖的文字讀訊息檔（主視覺標題）與 rules/blocks.json（八塊的名稱），改了文案重跑一次就好。
 *
 * 用法（在 site/ 裡）：node scripts/render-og.mjs
 * Chrome 不在預設位置時：CHROME_PATH=/path/to/chrome node scripts/render-og.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(siteRoot, 'public')
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

/** 網站的顏色（跟 layers/core/app/assets/css/main.css 的 token 一樣） */
const COLOR = { bg: '#0F100D', surface: '#181A15', line: '#30342A', ink: '#ECEADF', ink2: '#A9AB9B', amber: '#FFB224', amberSoft: '#2B2310' }

/** 每種語言：網站語言代碼、rules/ 的語言代碼、html lang */
const LOCALES = [
  { code: 'en', data: 'en', lang: 'en' },
  { code: 'zh-tw', data: 'zh-TW', lang: 'zh-Hant-TW' },
]

const blocks = JSON.parse(readFileSync(join(siteRoot, '../rules/blocks.json'), 'utf8')).blocks

/** HTML 跳脫 */
const escape = (text) => text.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char])

/**
 * 分享圖的版面。
 * @param {typeof LOCALES[number]} locale 語言
 */
async function ogHtml(locale) {
  const hero = (await import(pathToFileURL(join(siteRoot, `i18n/locales/${locale.code}/hero.ts`)).href)).default.hero
  const common = (await import(pathToFileURL(join(siteRoot, `i18n/locales/${locale.code}/common.ts`)).href)).default.common
  const title = hero.title.split('\n').map(escape).join('<br>')
  const rows = blocks.map((block, index) => `<li><span class="num">${String(index + 1).padStart(2, '0')}</span>${escape(block.name[locale.data])}</li>`).join('')
  const bodyFont = locale.code === 'zh-tw' ? "'Noto Sans TC'" : "'Archivo'"
  return `<!doctype html><html lang="${locale.lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;900&family=JetBrains+Mono:wght@500;800&family=Noto+Sans+TC:wght@500;900&display=block">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden;background:${COLOR.bg};color:${COLOR.ink}}
body{font-family:${bodyFont},sans-serif;padding:56px 64px;display:grid;grid-template-columns:1fr 420px;grid-template-rows:auto 1fr auto;column-gap:56px}
.mono{font-family:'JetBrains Mono',monospace}
.logo{grid-column:1/3;display:flex;align-items:center;gap:12px;font-size:22px;font-weight:800}
.logo i{display:block;width:12px;height:26px;background:${COLOR.amber}}
.main{align-self:center}
.eyebrow{color:${COLOR.amber};font-size:19px;font-weight:500}
h1{margin-top:18px;font-size:${locale.code === 'zh-tw' ? 66 : 64}px;line-height:1.16;font-weight:900;letter-spacing:${locale.code === 'zh-tw' ? '0.01em' : '-0.01em'}}
.card{grid-row:2;grid-column:2;align-self:center;border:1px solid ${COLOR.line};background:${COLOR.surface};border-radius:12px;padding:22px 26px}
.card p{color:${COLOR.ink2};font-size:15px}
.card ol{list-style:none;margin-top:12px;display:grid;gap:9px}
.card li{display:flex;align-items:center;gap:14px;font-size:19px;font-weight:500}
.num{display:inline-flex;align-items:center;justify-content:center;min-width:40px;height:28px;border:1.5px solid ${COLOR.amber};border-radius:6px;color:${COLOR.amber};font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:800}
.foot{grid-column:1/3;display:flex;justify-content:space-between;color:${COLOR.ink2};font-size:18px}
</style></head><body>
<div class="logo mono"><i></i>${escape(common.brand)}</div>
<div class="main"><p class="eyebrow mono">$ ${escape(hero.eyebrow)}</p><h1>${title}</h1></div>
<div class="card"><p class="mono">README.md</p><ol>${rows}</ol></div>
<div class="foot"><span lang="zh-Hant-TW">${escape(common.byline)}</span><span class="mono">readme-guide.com</span></div>
</body></html>`
}

/**
 * 圖示的版面：把 public/favicon.svg 放大到指定大小。
 * @param {number} size 邊長
 */
function iconHtml(size) {
  const svg = readFileSync(join(publicDir, 'favicon.svg'), 'utf8')
  return `<!doctype html><html><head><style>*{margin:0}html,body{width:${size}px;height:${size}px;overflow:hidden;background:${COLOR.bg}}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${svg}</body></html>`
}

/**
 * 用 Chrome 無頭模式把一個 HTML 截成 PNG。
 * @param {string} html 版面
 * @param {number} width 寬
 * @param {number} height 高
 * @param {string} out 輸出檔
 */
function screenshot(html, width, height, out) {
  const dir = mkdtempSync(join(tmpdir(), 'readme-guide-og-'))
  try {
    const file = join(dir, 'page.html')
    writeFileSync(file, html)
    mkdirSync(dirname(out), { recursive: true })
    execFileSync(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--no-first-run', '--no-default-browser-check',
      `--user-data-dir=${join(dir, 'profile')}`, `--window-size=${width},${height}`, '--virtual-time-budget=15000',
      `--screenshot=${out}`, pathToFileURL(file).href,
    ], { stdio: 'ignore' })
  }
  finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * 把一張 32×32 PNG 包成 favicon.ico（ICO 裡直接放 PNG，現在的瀏覽器都認得）。
 * @param {Buffer} png PNG 內容
 * @param {number} size 邊長
 */
function pngToIco(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(size, 0)
  entry.writeUInt8(size, 1)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(header.length + entry.length, 12)
  return Buffer.concat([header, entry, png])
}

for (const locale of LOCALES) {
  screenshot(await ogHtml(locale), 1200, 630, join(publicDir, 'og', `${locale.code}.png`))
  console.log(`public/og/${locale.code}.png`)
}
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  screenshot(iconHtml(size), size, size, join(publicDir, name))
  console.log(`public/${name}`)
}
const temp = mkdtempSync(join(tmpdir(), 'readme-guide-ico-'))
try {
  const png = join(temp, 'favicon-32.png')
  screenshot(iconHtml(32), 32, 32, png)
  writeFileSync(join(publicDir, 'favicon.ico'), pngToIco(readFileSync(png), 32))
  console.log('public/favicon.ico')
}
finally {
  rmSync(temp, { recursive: true, force: true })
}
