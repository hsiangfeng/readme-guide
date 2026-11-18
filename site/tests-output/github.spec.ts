import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOCALES } from '../shared/utils/locales'
import { localizedPath, SITE_PAGES } from '../shared/utils/seo'

/*
 * 產生出來的靜態網站（.output/public）跟 GitHub 有關的部分：
 * 建置時用過的權杖不能出現在任何檔案裡、瀏覽器不會去問 GitHub、星星數跟建置時讀到的一致。要先跑 pnpm generate。
 */

const output = join(__dirname, '../.output/public')
if (!existsSync(join(output, 'index.html'))) throw new Error('找不到 .output/public/index.html，請先跑 pnpm generate')

/** 輸出資料夾裡的每個檔案（相對路徑） */
const files = (readdirSync(output, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name).slice(output.length + 1))

/** 會被當成文字讀的檔案（字型、圖片另外用位元組比對） */
const TEXT_FILE = /\.(?:html|js|css|json|txt|xml|svg|webmanifest)$/

/** GitHub 各種權杖的開頭與長度（https://github.blog/2021-04-05-behind-githubs-new-authentication-token-formats/） */
const TOKEN_PATTERN = /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/

describe('建置時讀 GitHub 星星數用到的權杖', () => {
  it(`${files.length} 個檔案裡都沒有像 GitHub 權杖的字串`, () => {
    for (const file of files.filter((name) => TEXT_FILE.test(name))) {
      expect(TOKEN_PATTERN.exec(readFileSync(join(output, file), 'utf8'))?.[0], file).toBeUndefined()
    }
  })

  // CI 跑這個檢查時會帶著建置用的同一個 GITHUB_TOKEN；本機沒有權杖就略過
  it.skipIf(!process.env.GITHUB_TOKEN)('建置用的權杖本身沒有出現在任何檔案裡（含字型、圖片）', () => {
    const token = Buffer.from(process.env.GITHUB_TOKEN!)
    for (const file of files) expect(readFileSync(join(output, file)).includes(token), file).toBe(false)
  })

  it('瀏覽器不會去問 GitHub：沒有任何檔案提到 api.github.com', () => {
    for (const file of files.filter((name) => TEXT_FILE.test(name))) {
      expect(readFileSync(join(output, file), 'utf8').includes('api.github.com'), file).toBe(false)
    }
  })
})

describe('GitHub 按鈕上的星星數', () => {
  /** 網站設定裡的星星數（建置時讀到才有） */
  const configured = /__NUXT__\.config=\{public:\{[^}]*?githubStars:(\d+)/.exec(readFileSync(join(output, 'index.html'), 'utf8'))?.[1]
  const pages = LOCALES.flatMap((locale) => SITE_PAGES.map((page) => localizedPath(locale.code, page.path)))

  it(configured ? `每一頁都顯示建置時讀到的 ${configured}` : '建置時讀不到，每一頁都只有按鈕、沒有星星數', () => {
    for (const path of pages) {
      const html = readFileSync(join(output, path.replace(/^\//, ''), 'index.html'), 'utf8')
      const shown = [...html.matchAll(/data-github-stars>.*?<span aria-hidden="true">([^<]*)<\/span>/g)].map((match) => match[1])
      if (configured) {
        expect(shown.length, path).toBeGreaterThan(0)
        for (const value of shown) expect(value, path).toBe(configured)
      }
      else {
        expect(html.includes('data-github-stars'), path).toBe(false)
      }
    }
  })
})
