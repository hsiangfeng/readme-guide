import type { BlockId, ProjectType } from '../types/project'
import type { RuleData } from '../types/rules'
import { BLOCKS, type BlockInfo } from './blocks'

/*
 * 檢查規則的整理：篩選、依八塊分組、計數。全部從 rules/rules.json 的資料算，不寫死任何條數。
 */

/** 檢查項目頁的篩選條件 */
export interface RuleFilters {
  /** 只看某一種專案類型；null 是全部 */
  type: ProjectType | null
  /** 只看錯誤 */
  error: boolean
  /** 只看警告 */
  warning: boolean
  /** 只看要對照專案檔案的 */
  needsProject: boolean
  /** 也顯示規劃中的 */
  showPlanned: boolean
}

/** 什麼都不篩 */
export const NO_FILTERS: RuleFilters = { type: null, error: false, warning: false, needsProject: false, showPlanned: false }

/** 一組規則：八塊的某一塊，或「整份文件」（block 是 null） */
export interface RuleGroup {
  block: BlockInfo | null
  rules: RuleData[]
}

/**
 * 依篩選條件留下符合的規則。
 * 「錯誤」「警告」都沒選等於兩種都要；兩個都選也是兩種都要。
 * @param rules 規則
 * @param filters 篩選條件
 */
export function filterRules(rules: readonly RuleData[], filters: RuleFilters): RuleData[] {
  const severityOn = filters.error !== filters.warning
  return rules.filter((rule) => {
    if (!filters.showPlanned && rule.status !== 'implemented') return false
    if (filters.type && !rule.types.includes(filters.type)) return false
    if (severityOn && rule.severity !== (filters.error ? 'error' : 'warning')) return false
    if (filters.needsProject && !rule.needsProject) return false
    return true
  })
}

/**
 * 依八塊分組，最後一組是不屬於哪一塊的規則。沒有規則的塊也會留著（畫面上要說明沒有）。
 * 每組裡已實作的排前面，其餘照資料的順序。
 * @param rules 規則
 */
export function groupRules(rules: readonly RuleData[]): RuleGroup[] {
  const sorted = [...rules].sort((a, b) => Number(a.status !== 'implemented') - Number(b.status !== 'implemented'))
  const groups: RuleGroup[] = BLOCKS.map((block) => ({ block, rules: sorted.filter((rule) => rule.block === block.id) }))
  groups.push({ block: null, rules: sorted.filter((rule) => rule.block === null || !BLOCKS.some((block) => block.id === rule.block)) })
  return groups
}

/**
 * 寫法頁要列的規則：屬於這一塊的，加上整份文件適用、但跟這一塊最相關的（`relatedBlocks`），前者排前面。
 * 回傳已實作的規則，和規劃中的條數。檢查項目頁的分組不看 `relatedBlocks`。
 * @param rules 所有規則
 * @param block 塊的代號
 */
export function rulesOfBlock(rules: readonly RuleData[], block: BlockId): { implemented: RuleData[], plannedCount: number } {
  const own = rules.filter((rule) => rule.block === block)
  const related = rules.filter((rule) => rule.block === null && rule.relatedBlocks?.includes(block))
  const all = [...own, ...related]
  return {
    implemented: all.filter((rule) => rule.status === 'implemented'),
    plannedCount: all.filter((rule) => rule.status !== 'implemented').length,
  }
}

/** 檢查項目頁上方的幾個數字 */
export interface RuleCounts {
  implemented: number
  planned: number
  errors: number
  warnings: number
  needsProject: number
}

/**
 * 算出已實作幾條、規劃中幾條，以及已實作裡的錯誤、警告、要對照專案的各幾條。
 * @param rules 規則
 */
export function countRules(rules: readonly RuleData[]): RuleCounts {
  const implemented = rules.filter((rule) => rule.status === 'implemented')
  return {
    implemented: implemented.length,
    planned: rules.length - implemented.length,
    errors: implemented.filter((rule) => rule.severity === 'error').length,
    warnings: implemented.filter((rule) => rule.severity === 'warning').length,
    needsProject: implemented.filter((rule) => rule.needsProject).length,
  }
}

/**
 * 把規則訊息裡的 `{name}` 換成實際的值；沒給的保留原樣。
 * @param template 訊息
 * @param params 要換進去的值
 */
export function formatRuleMessage(template: string, params: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => params[name] ?? whole)
}

/**
 * 把一段文字依反引號切開，反引號裡的是程式碼（畫面上用程式碼樣式）。
 * @param text 文字
 */
export function splitInlineCode(text: string): { text: string, code: boolean }[] {
  return text.split(/(`[^`]+`)/).filter(Boolean).map((part) => (
    part.startsWith('`') && part.endsWith('`') && part.length > 1
      ? { text: part.slice(1, -1), code: true }
      : { text: part, code: false }
  ))
}
