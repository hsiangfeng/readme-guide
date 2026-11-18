import type { BlockId } from '#shared/types/project'

/** 首頁示意結果裡的一筆：規則、位置、訊息要換進去的值 */
export interface LintIssue {
  /** 規則代號（rules/rules.json） */
  ruleId: string
  /** 行:欄；整份文件的問題沒有位置 */
  position: string | null
  /** 用規則的哪一種訊息 */
  message: string
  /** 訊息裡 `{name}` 要換成的值 */
  params?: Record<string, string>
  /** 規則本身不屬於哪一塊時，示意結果指定放在哪一塊 */
  block?: BlockId
}
