import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadRulesFile } from '../../../shared/data/rules'
import { BLOCKS } from '../../../shared/utils/blocks'
import { matchHeading, officialHeadingLine, parseHeadingLine, sectionInfo } from '../../../shared/utils/headings'
import { LOCALES } from '../../../shared/utils/locales'
import { PROJECT_TYPES } from '../../../shared/utils/projectTypes'
import { existingGuideContent, guideContentPath } from '../app/data/content'
import type { GuideContent } from '../app/types'
import { displayWidth, unmark } from '../app/utils/guideLines'

/*
 * 「每一塊的完整寫法」內容檔：現有的每一個檔都要照 site/content/guide/README.md 的格式。
 * 還沒寫的檔不算失敗，只列出來。
 */

const files = import.meta.glob<GuideContent>('../../../content/guide/*/*.json', { eager: true, import: 'default' })
const MAX_WIDTH = 58
const rules = (await loadRulesFile()).rules

const expected = LOCALES.flatMap((locale) => BLOCKS.map((block) => `${locale.dataLang}/${block.id}`))
const existing = existingGuideContent()

describe('寫法內容檔', () => {
  it('列出還沒有的內容檔（只提醒，不算失敗）', () => {
    const missing = expected.filter((name) => !existing.includes(name))
    if (missing.length > 0) {
      console.info(`還沒有的內容檔（${missing.length} 個）：\n${missing.map((name) => `  - ${guideContentPath(...name.split('/') as [string, string])}`).join('\n')}`)
    }
    expect(missing.length).toBeGreaterThanOrEqual(0)
  })

  it('沒有多出來的檔（語言與塊都要對得上 rules/）', () => {
    for (const name of existing) expect(expected, name).toContain(name)
  })

  for (const [path, content] of Object.entries(files)) {
    const name = path.replace('../../../content/guide/', '')
    const [lang, file] = name.split('/') as [string, string]
    const slug = file.replace(/\.json$/, '')

    describe(name, () => {
      it('欄位齊全，slug 跟檔名一樣', () => {
        expect(content.slug).toBe(slug)
        for (const key of ['why', 'question', 'questionNote', 'who', 'whoNote', 'partsTitle'] as const) {
          expect(typeof content[key], key).toBe('string')
          expect(content[key].length, key).toBeGreaterThan(0)
        }
        expect(content.headings.length).toBeGreaterThan(0)
        expect(content.parts.length).toBeGreaterThanOrEqual(2)
        expect(content.parts.length).toBeLessThanOrEqual(4)
        for (const part of content.parts) {
          expect(['required', 'optional', 'conditional']).toContain(part.need)
          expect(part.heading.length).toBeGreaterThan(0)
          expect(part.text.length).toBeGreaterThan(0)
        }
        expect(content.notes.length).toBeGreaterThanOrEqual(2)
        expect(content.notes.length).toBeLessThanOrEqual(4)
        expect(content.tip.title.length).toBeGreaterThan(0)
        expect(content.tip.paragraphs.length).toBeGreaterThanOrEqual(1)
        expect(Object.keys(content.types).sort()).toEqual(PROJECT_TYPES.map((type) => type.id).sort())
      })

      it('標題都是這一塊的正式標題（rules/headings.json；第一塊的一級標題是專案名稱，沒有固定寫法）', () => {
        for (const heading of content.headings) {
          const parsed = parseHeadingLine(heading)
          expect(parsed, heading).not.toBeNull()
          if (parsed!.level === 1) {
            expect(slug, `${heading} 只有第一塊可以用一級標題`).toBe(BLOCKS[0]!.id)
            continue
          }
          const ids = matchHeading(parsed!.text, parsed!.level)
          expect(ids.length, heading).toBe(1)
          expect(sectionInfo(ids[0]!).block, heading).toBe(slug)
          expect(officialHeadingLine(ids[0]!, lang === 'zh-TW' ? 'zh-tw' : 'en'), heading).toBe(heading)
        }
      })

      it('每個問題都有一行指到，指到的編號都存在', () => {
        const referenced = new Set(content.before.lines.flatMap((line) => (typeof line === 'string' ? [] : line.notes)))
        for (const number of referenced) {
          expect(number).toBeGreaterThanOrEqual(1)
          expect(number).toBeLessThanOrEqual(content.notes.length)
        }
        content.notes.forEach((note, index) => expect(referenced.has(index + 1), `問題 ${index + 1}「${note.title}」`).toBe(true))
      })

      it('提到的規則都在 rules/rules.json', () => {
        for (const note of content.notes) {
          for (const id of note.rules ?? []) expect(rules.some((rule) => rule.id === id), `${note.title} → ${id}`).toBe(true)
        }
      })

      it(`改之前、改之後每行不超過 ${MAX_WIDTH} 個半形字寬（中文算兩個）`, () => {
        const lines = [
          ...content.before.lines.map((line) => unmark(typeof line === 'string' ? line : line.text)),
          ...content.after.lines,
        ]
        for (const line of lines) expect(displayWidth(line), line).toBeLessThanOrEqual(MAX_WIDTH)
      })
    })
  }
})

/*
 * 同一種語言八塊的「改之後」照 rules/blocks.json 的順序接起來，就是一份完整的 README：
 * 放進範例專案 lint/fixtures/breakfast-order/ 對照，檢查工具不能有錯誤（警告可以有）。
 * 少了內容檔、或 lint/ 不在時跳過。
 */
const repoRoot = join(__dirname, '../../../..')
const linter = join(repoRoot, 'lint/bin/readme-guide.mjs')
const project = join(repoRoot, 'lint/fixtures/breakfast-order')

describe('八塊的「改之後」接起來通過檢查工具（對照 lint/fixtures/breakfast-order）', () => {
  for (const locale of LOCALES) {
    const contents = BLOCKS.map((block) => files[`../../../content/guide/${locale.dataLang}/${block.id}.json`])
    const ready = contents.every(Boolean) && existsSync(linter) && existsSync(project)
    it.skipIf(!ready)(`${locale.dataLang}：沒有錯誤`, () => {
      const markdown = `${contents.map((content) => content!.after.lines.join('\n')).join('\n\n')}\n`
      const dir = mkdtempSync(join(tmpdir(), 'readme-guide-after-'))
      try {
        const file = join(dir, 'README.md')
        writeFileSync(file, markdown)
        let output: string
        try {
          output = execFileSync(process.execPath, [linter, 'check', file, '--json', '--project', project], { encoding: 'utf8' })
        }
        catch (error) {
          output = (error as { stdout?: string }).stdout ?? ''
          if (!output) throw error
        }
        const result = JSON.parse(output) as { problems: { ruleId: string, severity: string, line: number, message: string }[] }
        const errors = result.problems.filter((problem) => problem.severity === 'error')
        expect(errors.map((problem) => `${problem.ruleId} 第 ${problem.line} 行：${problem.message}`)).toEqual([])
      }
      finally {
        rmSync(dir, { recursive: true, force: true })
      }
    })
  }
})
