import { BLOCK_GROUPS } from '#shared/utils/blocks'
import { localized } from '#shared/utils/locales'
import type { IndexGroup } from '../types'

/**
 * 八塊索引的分組資料：三個問題、每組的塊，名稱都照 rules/blocks.json。
 * @param to 每一塊連去哪裡
 * @param count 每一塊旁邊的條數（不給就不顯示）
 */
export function useBlockIndex(to: (block: string) => string, count?: () => Record<string, number>) {
  const { locale } = useI18n()
  return computed<IndexGroup[]>(() => {
    const counts = count?.()
    return BLOCK_GROUPS.map((group) => ({
      id: group.id,
      label: localized(group.question, locale.value),
      items: group.blocks.map((block) => ({
        id: block.id,
        number: block.number,
        name: localized(block.name, locale.value),
        to: to(block.id),
        count: counts?.[block.id],
      })),
    }))
  })
}
