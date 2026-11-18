import type { RuleData } from '#shared/types/rules'
import { filterRules, groupRules, NO_FILTERS, type RuleFilters } from '#shared/utils/ruleCatalog'

/**
 * 檢查項目頁的篩選：條件、篩完的分組、篩選按鈕上的條數。
 * 按鈕上的條數只套用「專案類型」與「顯示規劃中」，不受另外兩個「只看」影響，按下去之前就知道會剩幾條。
 * @param rules 所有規則
 */
export function useRuleFilters(rules: () => readonly RuleData[]) {
  const filters = reactive<RuleFilters>({ ...NO_FILTERS })

  const visible = computed(() => filterRules(rules(), filters))
  const groups = computed(() => groupRules(visible.value))

  /** 只套用專案類型與規劃中之後的規則（算按鈕上的條數） */
  const base = computed(() => filterRules(rules(), { ...NO_FILTERS, type: filters.type, showPlanned: filters.showPlanned }))
  const chipCounts = computed(() => ({
    error: base.value.filter((rule) => rule.severity === 'error').length,
    warning: base.value.filter((rule) => rule.severity === 'warning').length,
    needsProject: base.value.filter((rule) => rule.needsProject).length,
  }))

  /** 規劃中的條數（只套用專案類型） */
  const plannedCount = computed(() => rules().filter((rule) => rule.status !== 'implemented' && (!filters.type || rule.types.includes(filters.type))).length)

  /**
   * 讓某一條規則一定看得到（從網址的 #代號 進來時）：被篩掉的話把篩選放寬。
   * @param id 規則代號
   */
  function reveal(id: string) {
    const rule = rules().find((item) => item.id === id)
    if (!rule || visible.value.includes(rule)) return
    Object.assign(filters, NO_FILTERS, { showPlanned: rule.status !== 'implemented' })
  }

  return { filters, visible, groups, chipCounts, plannedCount, reveal }
}
