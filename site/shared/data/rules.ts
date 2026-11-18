import type { BlocksFile, ConventionsFile, HeadingsFile, ProjectTypesFile, RulesFile } from '../types/rules'
import blocksJson from '../../../rules/blocks.json'
import conventionsJson from '../../../rules/conventions.json'
import headingsJson from '../../../rules/headings.json'
import projectTypesJson from '../../../rules/project-types.json'

/*
 * 讀 rules/ 的唯一入口：rules/ 的相對路徑只寫在這個檔案，其他地方都從這裡拿。
 *
 * 八塊、章節、專案類型、寫法慣例很小，直接帶進來；
 * 規則清單（rules.json）比較大，用到的頁面在產生靜態頁時才載入，畫面只帶那一頁需要的部分。
 */

export const blocksFile = blocksJson as BlocksFile
export const headingsFile = headingsJson as HeadingsFile
export const projectTypesFile = projectTypesJson as ProjectTypesFile
export const conventionsFile = conventionsJson as ConventionsFile

/** 載入規則清單 */
export async function loadRulesFile(): Promise<RulesFile> {
  const module = await import('../../../rules/rules.json')
  return (module.default ?? module) as unknown as RulesFile
}
