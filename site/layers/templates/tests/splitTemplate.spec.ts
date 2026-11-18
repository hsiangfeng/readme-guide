import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BLOCKS } from '../../../shared/utils/blocks'
import { countPlaceholders, firstPlaceholder, isSyntaxMention } from '../../../shared/utils/placeholders'
import { PROJECT_TYPES } from '../../../shared/utils/projectTypes'
import { isSegmentRequired, splitTemplate } from '../app/utils/splitTemplate'

/*
 * 範本依標題切成八塊：每個標題都要對到一塊、塊的順序只會往後、要填的地方數得對。
 * 檢查 templates/ 裡現有的每一份；另外用檢查工具的範本樣本（lint/fixtures/template-sample）確認切法。
 */

const templates = import.meta.glob<string>('../../../../templates/*/*.md', { eager: true, query: '?raw', import: 'default' })
const repoRoot = join(__dirname, '../../../..')

/**
 * 塊在 rules/blocks.json 裡的位置。
 * @param block 塊的代號
 */
function order(block: string | null): number {
  return BLOCKS.findIndex((item) => item.id === block)
}

/**
 * 用另一種方式數待填的地方：數 `{{` 開頭、`請填` 或 `FILL` 接著的次數。
 * @param text 範本原文
 */
function countByHand(text: string): number {
  return (text.match(/\{\{\s*(?:請填|FILL)/gi) ?? []).length
}

/**
 * 檢查一份範本的切法。
 * @param name 名稱（錯誤訊息用）
 * @param text 範本原文
 */
function expectWellFormed(name: string, text: string) {
  const split = splitTemplate(text)
  for (const segment of split.segments) {
    expect(segment.block, `${name} 第 ${segment.startLine} 行開始的一段對不到塊`).not.toBeNull()
    expect(segment.unmatched, `${name} 對不到章節的標題`).toEqual([])
  }
  const orders = split.segments.map((segment) => order(segment.block))
  expect(orders, `${name} 塊的順序`).toEqual([...orders].sort((a, b) => a - b))
  expect(new Set(orders).size, `${name} 同一塊不要拆成兩段`).toBe(orders.length)
  expect(split.segments[0]?.block, `${name} 第一段是第一塊`).toBe(BLOCKS[0]!.id)
  expect(split.placeholderCount, `${name} 要填的地方`).toBe(countByHand(text))
  expect(split.segments.reduce((sum, segment) => sum + segment.lines.length, 0)).toBe(split.lineCount)
  return split
}

describe('範本切成八塊', () => {
  it('檢查工具的範本樣本：每個標題都對到一塊、順序往後、要填的地方數得對', () => {
    const text = readFileSync(join(repoRoot, 'lint/fixtures/template-sample/README.md'), 'utf8')
    const split = expectWellFormed('template-sample', text)
    expect(split.segments.map((segment) => segment.block)).toEqual(BLOCKS.map((block) => block.id))
    expect(split.segments[1]!.sections).toEqual(['demo', 'screenshots'])
  })

  it('程式碼區塊裡的 # 不算標題', () => {
    const split = splitTemplate('# 名稱\n\n## 安裝與執行\n\n```bash\n# 這是註解\n## 也是註解\n```\n')
    expect(split.segments.map((segment) => segment.block)).toEqual([BLOCKS[0]!.id, 'install'])
  })

  it('第一塊一律必填；其他段看段裡的章節是不是那種類型的必填', () => {
    const text = readFileSync(join(repoRoot, 'lint/fixtures/template-sample/README.md'), 'utf8')
    const split = splitTemplate(text)
    for (const type of PROJECT_TYPES) {
      expect(isSegmentRequired(split.segments[0]!, type.required)).toBe(true)
      for (const segment of split.segments.slice(1)) {
        expect(isSegmentRequired(segment, type.required)).toBe(segment.sections.some((id) => type.required.includes(id)))
      }
    }
  })

  const entries = Object.entries(templates)
  if (entries.length === 0) it.skip('templates/ 裡還沒有範本（跳過現有範本的檢查）', () => {})
  for (const [path, text] of entries) {
    it(`${path.replace('../../../../', '')}：每個標題都對到一塊、順序往後、要填的地方數得對`, () => {
      expectWellFormed(path, text)
    })
  }
})

describe('介紹寫法本身的 {{請填：…}}（rules/conventions.json 的 syntaxMention）', () => {
  it('說明只有刪節號的不算待填的地方，真正的待填處照算', () => {
    expect(isSyntaxMention('{{請填：…}}')).toBe(true)
    expect(isSyntaxMention('{{FILL: ...}}')).toBe(true)
    expect(isSyntaxMention('{{請填：專案名稱}}')).toBe(false)
    expect(countPlaceholders('把 {{請填：…}} 換掉，例如 {{請填：專案名稱}}、{{FILL: owner}}')).toBe(2)
    expect(firstPlaceholder('寫法是 {{FILL: ...}}\n# {{FILL: project name}}')).toEqual({ line: 2, column: 3, text: '{{FILL: project name}}' })
  })
})
