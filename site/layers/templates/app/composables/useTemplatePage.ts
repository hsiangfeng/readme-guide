import { loadRulesFile } from '#shared/data/rules'
import { readTemplate } from '#layers/core/app/data/templateFiles'

/** 範本頁示意結果用的規則：還有沒填的地方 */
const PLACEHOLDER_RULE = 'STR015'

/**
 * 範本頁的資料（產生靜態頁時讀好）：範本原文，以及「填完讓工具對一次」示意結果用的規則訊息。
 * 範本檔不在會丟錯，讓建置失敗並說出缺哪個檔。
 * @param type 專案類型
 */
export function useTemplatePage(type: string) {
  const { locale } = useI18n()
  return useAsyncData(`template:${locale.value}:${type}`, async () => {
    const [text, rulesFile] = await Promise.all([readTemplate(type, locale.value), loadRulesFile()])
    const rule = rulesFile.rules.find((item) => item.id === PLACEHOLDER_RULE)
    return {
      text,
      sample: rule
        ? { severity: rulesFile.severities[rule.severity], message: Object.values(rule.messages)[0] ?? null }
        : null,
    }
  })
}
