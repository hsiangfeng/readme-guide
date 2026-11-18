import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BLOCKS } from '../../../shared/utils/blocks'
import { matchHeading } from '../../../shared/utils/headings'
import { LOCALES } from '../../../shared/utils/locales'
import { PROJECT_TYPES } from '../../../shared/utils/projectTypes'
import { SAMPLE_FIXTURES, samplePath } from '../app/data/samples'
import { parseSample } from '../app/utils/parseSample'
import { sampleToMarkdown } from '../app/utils/sampleToMarkdown'
import zhAnatomy from '../../../i18n/locales/zh-tw/anatomy'
import enAnatomy from '../../../i18n/locales/en/anatomy'

/*
 * 首頁解剖圖中間那份 README：直接讀 lint/fixtures/ 裡「範本填完的樣子」。
 * 拆成一段一段畫在畫面上，再轉回 Markdown 要跟原檔一字不差，才表示畫面上的內容沒有漏、沒有多、沒有改字。
 */

type Messages = { [key: string]: string | Messages }

const repoRoot = join(__dirname, '../../../..')
const messages: Record<string, Messages> = { 'zh-tw': zhAnatomy as Messages, 'en': enAnatomy as Messages }

/**
 * 照 key 從文案取字，找不到回傳 undefined。
 * @param locale 網站語言代碼
 * @param key 訊息 key
 */
function message(locale: string, key: string): string | undefined {
  const value = key.split('.').reduce<string | Messages | undefined>((node, part) => (typeof node === 'object' ? node[part] : undefined), messages[locale])
  return typeof value === 'string' ? value : undefined
}

describe('解剖圖的範例 README', () => {
  it('rules/ 的每種專案類型都對到一份範例，而且檔案都在', () => {
    expect(Object.keys(SAMPLE_FIXTURES).sort()).toEqual(PROJECT_TYPES.map((type) => type.id).sort())
    for (const type of PROJECT_TYPES) {
      for (const locale of LOCALES) expect(existsSync(join(repoRoot, samplePath(type.id, locale.code))), samplePath(type.id, locale.code)).toBe(true)
    }
  })

  for (const type of PROJECT_TYPES) {
    for (const locale of LOCALES) {
      describe(`${type.id}（${locale.code}）`, () => {
        const path = samplePath(type.id, locale.code)
        const markdown = readFileSync(join(repoRoot, path), 'utf8')
        const rows = parseSample(markdown)

        it(`畫面上的內容轉回 Markdown，跟 ${path} 一字不差`, () => {
          expect(sampleToMarkdown(rows)).toBe(markdown)
        })

        it('第一列是標題那一塊；每個二級標題都對得到 rules/headings.json，各列都是 rules/blocks.json 的塊', () => {
          expect(rows[0]?.block).toBe(BLOCKS[0]!.id)
          for (const row of rows) {
            expect(BLOCKS.map((block) => block.id), row.block).toContain(row.block)
            for (const piece of row.pieces) {
              if (piece.kind === 'heading' && piece.level === 2) expect(matchHeading(piece.text, 2), `${path}：${piece.text}`).not.toEqual([])
            }
          }
        })

        it('旁邊會標出的每一塊，兩種語言都有「為什麼」', () => {
          for (const block of new Set(rows.map((row) => row.block))) {
            for (const code of Object.keys(messages)) {
              expect(message(code, `anatomy.templates.${type.messageKey}.why.${block}`), `${code} ${type.messageKey}.${block}`).toBeTruthy()
            }
          }
        })

        it('圖片只畫出位置與替代文字（不載入）', () => {
          for (const piece of rows.flatMap((row) => row.pieces)) {
            if (piece.kind === 'shot') expect(piece.alt.length, piece.src).toBeGreaterThan(0)
          }
        })
      })
    }
  }
})

/*
 * 範例本身要通過檢查工具（連同對照專案檔案的規則，範例資料夾就是那個專案）。
 * 檢查工具跑不起來時（例如 lint/ 不在），這組測試跳過並說明原因。
 */
const linter = join(repoRoot, 'lint/bin/readme-guide.mjs')

interface LintProblem { ruleId: string, severity: string, line: number, message: string }

describe.skipIf(!existsSync(linter))('首頁的範例 README 通過檢查工具（跳過的話：找不到 lint/bin/readme-guide.mjs）', () => {
  for (const type of PROJECT_TYPES) {
    for (const locale of LOCALES) {
      const path = samplePath(type.id, locale.code)
      it(`${path}：沒有錯誤`, () => {
        let output: string
        try {
          output = execFileSync(process.execPath, [linter, 'check', join(repoRoot, path), '--json', '--type', type.id, '--project', join(repoRoot, 'lint/fixtures', SAMPLE_FIXTURES[type.id]!)], { encoding: 'utf8' })
        }
        catch (error) {
          // 有錯誤時結束代碼是 1，結果一樣在 stdout
          output = (error as { stdout?: string }).stdout ?? ''
          if (!output) throw error
        }
        const result = JSON.parse(output) as { problems: LintProblem[] }
        const errors = result.problems.filter((problem) => problem.severity === 'error')
        expect(errors.map((problem) => `${problem.ruleId} 第 ${problem.line} 行：${problem.message}`)).toEqual([])
      })
    }
  }
})
