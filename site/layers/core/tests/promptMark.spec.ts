import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AI_CHECK_COMMAND, CHECK_COMMAND, SKILL_COMMAND } from '../../../shared/utils/site'
import { commandCopyText } from '../app/utils/commandCopy'

/**
 * 指令前面的 `$`：畫面上可以有（裝飾），可是「複製」和「選取後複製」都不能帶到它。
 * 檢查工具的 CMD003 就是在抓這件事，網站不能自己犯。
 */

const siteRoot = join(__dirname, '../../..')
/** app/ 與 layers/ 底下所有 .vue（路徑 → 原始碼） */
const vueFiles = Object.fromEntries(['app', 'layers'].flatMap((dir) =>
  readdirSync(join(siteRoot, dir), { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith('.vue'))
    .map((path) => [`${dir}/${path}`, readFileSync(join(siteRoot, dir, path), 'utf8')]),
))

describe('指令前面的 $', () => {
  it('指令框「複製」出去的只有指令，沒有 $、說明與示意結果', () => {
    const text = commandCopyText([
      { kind: 'command', text: 'curl -fsSL https://example.com/guide.md' },
      { kind: 'command', text: '$ npx guide check README.md' },
      { kind: 'comment', text: '# 說明' },
      { kind: 'error', text: '1:3  錯誤' },
    ])
    expect(text).toBe('curl -fsSL https://example.com/guide.md\nnpx guide check README.md')
    expect(text).not.toMatch(/^\s*\$/m)
  })

  it('站上給人照打的指令本身都不帶 $', () => {
    for (const command of [CHECK_COMMAND, AI_CHECK_COMMAND, SKILL_COMMAND]) expect(command).not.toMatch(/^\s*\$/)
  })

  it('$ 是 CSS 產生的（.prompt-mark::before），而且選不到', () => {
    const css = readFileSync(join(siteRoot, 'layers/core/app/assets/css/main.css'), 'utf8')
    expect(css).toMatch(/\.prompt-mark::before\s*\{\s*content:\s*'\$/)
    const mark = vueFiles['layers/core/app/components/PromptMark.vue']
    expect(mark).toContain('prompt-mark')
    expect(mark).toContain('select-none')
    expect(mark).toContain('aria-hidden="true"')
  })

  it('沒有元件在畫面上直接寫出 $ 字元（一律用 <PromptMark />）', () => {
    expect(Object.keys(vueFiles).length).toBeGreaterThan(20)
    for (const [path, source] of Object.entries(vueFiles)) {
      const template = source.slice(source.indexOf('<template>'))
      // 標籤之間的文字以 $ 開頭（例如 `<span>$ </span>`、`>$ git`）
      expect(template, path).not.toMatch(/>\s*\$(?!\{)/)
    }
  })
})
