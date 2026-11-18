import type { RuleData } from '#shared/types/rules'
import type { LintIssue } from '../types'

/**
 * 首頁「檢查工具」區的示意結果：只記規則代號、位置、訊息要換進去的值，
 * 嚴重度、訊息文字、屬於哪一塊都從 rules/rules.json 讀。這只是示意，不是檢查工具真的跑出來的。
 */
export const SAMPLE_FILE = 'README.md'

export const SAMPLE_ISSUES: readonly LintIssue[] = [
  { ruleId: 'STR003', position: '1:1', message: 'missing' },
  { ruleId: 'IMG005', position: null, message: 'missing' },
  { ruleId: 'CMD004', position: '12:1', message: 'mismatch', params: { used: 'npm', expected: 'pnpm', evidence: 'pnpm-lock.yaml' } },
  { ruleId: 'ENV008', position: '14:1', message: 'missing', params: { file: '.env.example' } },
  // ENV004（貼了真的金鑰）是整份文件都適用的規則，示意結果裡出現在環境變數那一塊
  { ruleId: 'ENV004', position: '18:9', message: 'found', block: 'env' },
]

/** 畫面上一筆示意結果需要的規則資料 */
export type SampleRule = Pick<RuleData, 'id' | 'block' | 'severity' | 'messages'>

/**
 * 從規則清單取出示意結果用到的規則（只帶這幾條到畫面上）；少了哪一條就丟錯。
 * @param rules 所有規則
 */
export function pickSampleRules(rules: readonly RuleData[]): Record<string, SampleRule> {
  const entries = SAMPLE_ISSUES.map((issue) => {
    const rule = rules.find((item) => item.id === issue.ruleId)
    if (!rule) throw new Error(`首頁示意結果用到的規則 ${issue.ruleId} 不在 rules/rules.json`)
    if (!rule.messages[issue.message]) throw new Error(`規則 ${issue.ruleId} 沒有「${issue.message}」這種訊息`)
    return [rule.id, { id: rule.id, block: rule.block, severity: rule.severity, messages: rule.messages }] as const
  })
  return Object.fromEntries(entries)
}

/**
 * 算出錯誤與警告各幾個。
 * @param severities 每一筆的嚴重度
 */
export function countIssues(severities: readonly string[]) {
  const errors = severities.filter((severity) => severity === 'error').length
  return { total: severities.length, errors, warnings: severities.length - errors }
}
