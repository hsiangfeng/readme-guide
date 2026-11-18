import { blocksFile } from '../data/rules'
import type { BlockId } from '../types/project'
import type { Localized } from '../types/rules'

/*
 * 八塊結構：順序、編號、名稱、分組全部照 rules/blocks.json 算，這裡不寫死任何一塊。
 */

/** 八塊裡的一塊 */
export interface BlockInfo {
  id: BlockId
  /** 畫面上的編號（01、02…，照資料的順序） */
  number: string
  /** 屬於哪個問題 */
  group: string
  name: Localized
  summary: Localized
}

/** 讀者的一個問題，與它涵蓋的幾塊 */
export interface BlockGroupInfo {
  id: string
  question: Localized
  blocks: BlockInfo[]
  /** 涵蓋的編號範圍，例如 01–04 */
  range: string
}

/** 「整份文件」那一組的編號（不屬於哪一塊的規則） */
export const WHOLE_DOCUMENT_NUMBER = '—'

/**
 * 編號補成兩位數。
 * @param index 從 0 開始的位置
 */
function blockNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}

/** 八塊，照資料的順序 */
export const BLOCKS: readonly BlockInfo[] = blocksFile.blocks.map((block, index) => ({
  id: block.slug,
  number: blockNumber(index),
  group: block.group,
  name: block.name,
  summary: block.summary,
}))

/** 三個問題，照資料的順序 */
export const BLOCK_GROUPS: readonly BlockGroupInfo[] = blocksFile.groups.map((group) => {
  const blocks = BLOCKS.filter((block) => block.group === group.id)
  const first = blocks[0]?.number ?? ''
  const last = blocks.at(-1)?.number ?? ''
  return { id: group.id, question: group.question, blocks, range: first === last ? first : `${first}–${last}` }
})

/**
 * 依代號取得某一塊；不認得的代號丟錯（資料對不起來要在建置時就發現）。
 * @param id 塊的代號
 */
export function blockInfo(id: BlockId): BlockInfo {
  const block = BLOCKS.find((item) => item.id === id)
  if (!block) throw new Error(`rules/blocks.json 裡沒有「${id}」這一塊`)
  return block
}

/**
 * 某一塊的前一塊與下一塊（第一塊沒有前一塊，最後一塊沒有下一塊）。
 * @param id 塊的代號
 */
export function adjacentBlocks(id: BlockId): { previous: BlockInfo | null, next: BlockInfo | null } {
  const index = BLOCKS.findIndex((block) => block.id === id)
  return { previous: BLOCKS[index - 1] ?? null, next: BLOCKS[index + 1] ?? null }
}
