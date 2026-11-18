import { describe, expect, it } from 'vitest'
import { loadRulesFile } from '../../../shared/data/rules'
import { BLOCKS } from '../../../shared/utils/blocks'
import { PROJECT_TYPES } from '../../../shared/utils/projectTypes'
import { countRules, filterRules, formatRuleMessage, groupRules, NO_FILTERS, rulesOfBlock, splitInlineCode } from '../../../shared/utils/ruleCatalog'

/*
 * 檢查規則的分組與篩選。條數全部從 rules/rules.json 算，測試不寫死任何數字。
 */

const rules = (await loadRulesFile()).rules
const implemented = rules.filter((rule) => rule.status === 'implemented')

describe('規則分組', () => {
  it('八塊各一組，最後一組是整份文件，順序照 rules/blocks.json', () => {
    const groups = groupRules(rules)
    expect(groups.map((group) => group.block?.id ?? null)).toEqual([...BLOCKS.map((block) => block.id), null])
  })

  it('每一條規則剛好在一組，屬於哪一塊就在哪一組', () => {
    const groups = groupRules(rules)
    expect(groups.reduce((sum, group) => sum + group.rules.length, 0)).toBe(rules.length)
    for (const group of groups) {
      for (const rule of group.rules) expect(rule.block, rule.id).toBe(group.block?.id ?? null)
    }
  })

  it('組裡已實作的排在規劃中前面', () => {
    for (const group of groupRules(rules)) {
      const statuses = group.rules.map((rule) => rule.status === 'implemented')
      expect(statuses).toEqual([...statuses].sort((a, b) => Number(b) - Number(a)))
    }
  })

  it('寫法頁的規則：屬於這一塊的在前、相關的（relatedBlocks）在後，已實作與規劃中加起來是全部', () => {
    for (const block of BLOCKS) {
      const { implemented: list, plannedCount } = rulesOfBlock(rules, block.id)
      const own = rules.filter((rule) => rule.block === block.id)
      const related = rules.filter((rule) => rule.block === null && rule.relatedBlocks?.includes(block.id))
      expect(list.length + plannedCount).toBe(own.length + related.length)
      expect(list.every((rule) => rule.status === 'implemented')).toBe(true)
      const firstRelated = list.findIndex((rule) => rule.block === null)
      if (firstRelated >= 0) expect(list.slice(firstRelated).every((rule) => rule.block === null), block.id).toBe(true)
    }
  })

  it('relatedBlocks 只出現在整份文件的規則，而且都是 rules/blocks.json 的塊', () => {
    for (const rule of rules.filter((item) => item.relatedBlocks)) {
      expect(rule.block, rule.id).toBeNull()
      for (const id of rule.relatedBlocks!) expect(BLOCKS.map((block) => block.id), rule.id).toContain(id)
    }
  })
})

describe('規則篩選', () => {
  it('預設只顯示已實作的', () => {
    expect(filterRules(rules, NO_FILTERS)).toEqual(implemented)
  })

  it('打開規劃中就全部顯示', () => {
    expect(filterRules(rules, { ...NO_FILTERS, showPlanned: true })).toEqual(rules)
  })

  it('專案類型：只留適用那種類型的', () => {
    for (const type of PROJECT_TYPES) {
      const result = filterRules(rules, { ...NO_FILTERS, type: type.id })
      expect(result).toEqual(implemented.filter((rule) => rule.types.includes(type.id)))
    }
  })

  it('只看錯誤、只看警告；兩個都選等於都要', () => {
    expect(filterRules(rules, { ...NO_FILTERS, error: true }).every((rule) => rule.severity === 'error')).toBe(true)
    expect(filterRules(rules, { ...NO_FILTERS, warning: true }).every((rule) => rule.severity === 'warning')).toBe(true)
    expect(filterRules(rules, { ...NO_FILTERS, error: true, warning: true })).toEqual(implemented)
  })

  it('只看對照專案檔案，可以跟其他條件一起用', () => {
    const result = filterRules(rules, { ...NO_FILTERS, needsProject: true, error: true, type: 'web-app' })
    expect(result).toEqual(implemented.filter((rule) => rule.needsProject && rule.severity === 'error' && rule.types.includes('web-app')))
  })

  it('計數跟篩選結果一致', () => {
    const counts = countRules(rules)
    expect(counts.implemented).toBe(implemented.length)
    expect(counts.planned).toBe(rules.length - implemented.length)
    expect(counts.errors).toBe(filterRules(rules, { ...NO_FILTERS, error: true }).length)
    expect(counts.warnings).toBe(filterRules(rules, { ...NO_FILTERS, warning: true }).length)
    expect(counts.needsProject).toBe(filterRules(rules, { ...NO_FILTERS, needsProject: true }).length)
    expect(counts.errors + counts.warnings).toBe(counts.implemented)
  })
})

describe('規則文字', () => {
  it('訊息裡的 {名稱} 換成實際的值，沒給的留著', () => {
    expect(formatRuleMessage('寫的是 {used}，專案用的是 {expected}', { used: 'npm' })).toBe('寫的是 npm，專案用的是 {expected}')
  })

  it('反引號裡的是程式碼', () => {
    expect(splitInlineCode('看 `pnpm-lock.yaml` 和 `packageManager`。')).toEqual([
      { text: '看 ', code: false },
      { text: 'pnpm-lock.yaml', code: true },
      { text: ' 和 ', code: false },
      { text: 'packageManager', code: true },
      { text: '。', code: false },
    ])
  })

  it('每條規則都屬於 rules/blocks.json 的某一塊，或是整份文件', () => {
    for (const rule of rules) {
      if (rule.block !== null) expect(BLOCKS.map((block) => block.id), rule.id).toContain(rule.block)
    }
  })
})
