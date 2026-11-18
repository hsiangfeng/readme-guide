import { loadRulesFile } from '#shared/data/rules'
import { rulesOfBlock } from '#shared/utils/ruleCatalog'
import { readGuideContent } from '../data/content'

/**
 * 寫法頁的資料（產生靜態頁時讀好）：內容檔（還沒寫的話是 null）、這一塊已實作的規則、
 * 規劃中幾條、內容檔裡提到的規則各是什麼狀態、嚴重度與狀態的名稱。
 * @param slug 塊的代號
 */
export function useGuidePage(slug: string) {
  const { locale } = useI18n()
  return useAsyncData(`guide:${locale.value}:${slug}`, async () => {
    const [content, rulesFile] = await Promise.all([readGuideContent(dataLang(locale.value), slug), loadRulesFile()])
    const own = rulesOfBlock(rulesFile.rules, slug)
    const mentioned = content?.notes.flatMap((note) => note.rules ?? []) ?? []
    const ruleStatus = Object.fromEntries(mentioned.map((id) => [id, rulesFile.rules.find((rule) => rule.id === id)?.status ?? null]))
    return {
      content,
      rules: own.implemented,
      plannedCount: own.plannedCount,
      ruleStatus,
      labels: { severities: rulesFile.severities, statuses: rulesFile.statuses },
    }
  })
}
