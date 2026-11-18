import { loadRulesFile } from '#shared/data/rules'
import type { RulesFile } from '#shared/types/rules'

/**
 * 在產生靜態頁時讀規則清單，只把這一頁用得到的部分帶到畫面上。
 * @param key 這份資料的名稱（同一頁不同用途要不一樣）
 * @param pick 從規則清單取出要的部分
 */
export function useRules<T>(key: string, pick: (file: RulesFile) => T) {
  return useAsyncData(`rules:${key}`, async () => pick(await loadRulesFile()))
}
